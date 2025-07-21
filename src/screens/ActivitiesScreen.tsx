import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants';
import { usePets } from '../contexts';
import { Activity, ActivityType } from '../types';
import { formatDateTime } from '../utils';

const getActivityIcon = (type: ActivityType) => {
    switch (type) {
        case ActivityType.WALK:
            return 'walk';
        case ActivityType.RUN:
            return 'fitness';
        case ActivityType.PLAY:
            return 'happy';
        case ActivityType.TRAINING:
            return 'school';
        case ActivityType.GROOMING:
            return 'cut';
        case ActivityType.FEEDING:
            return 'restaurant';
        default:
            return 'ellipse';
    }
};

export default function ActivitiesScreen() {
    const { activities, pets } = usePets();

    const sortedActivities = [...activities].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const renderActivityItem = ({ item }: { item: Activity }) => {
        const pet = pets.find(p => p.id === item.petId);

        return (
            <View style={styles.activityCard}>
                <View style={styles.activityIcon}>
                    <Ionicons
                        name={getActivityIcon(item.type)}
                        size={20}
                        color={COLORS.primary}
                    />
                </View>
                <View style={styles.activityInfo}>
                    <Text style={styles.activityTitle}>
                        {pet?.name || 'Unknown Pet'} • {item.type}
                    </Text>
                    <Text style={styles.activityDate}>
                        {formatDateTime(item.date)}
                    </Text>
                    {item.duration && (
                        <Text style={styles.activityDetail}>
                            Duration: {item.duration} minutes
                        </Text>
                    )}
                    {item.distance && (
                        <Text style={styles.activityDetail}>
                            Distance: {item.distance} km
                        </Text>
                    )}
                    {item.location && (
                        <Text style={styles.activityDetail}>
                            Location: {item.location}
                        </Text>
                    )}
                    {item.notes && (
                        <Text style={styles.activityNotes}>
                            {item.notes}
                        </Text>
                    )}
                </View>
            </View>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Ionicons name="walk-outline" size={64} color={COLORS.textLight} />
            <Text style={styles.emptyStateTitle}>No activities recorded</Text>
            <Text style={styles.emptyStateText}>
                Start tracking your pet's activities to see their daily adventures!
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={sortedActivities}
                renderItem={renderActivityItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={renderEmptyState}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    listContainer: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
        flexGrow: 1,
    },
    activityCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.md,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    activityIcon: {
        width: 40,
        height: 40,
        borderRadius: BORDER_RADIUS.round,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    activityInfo: {
        flex: 1,
    },
    activityTitle: {
        fontSize: FONT_SIZES.md,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.xs,
        textTransform: 'capitalize',
    },
    activityDate: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
        marginBottom: SPACING.xs,
    },
    activityDetail: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
        marginBottom: 2,
    },
    activityNotes: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.text,
        marginTop: SPACING.xs,
        fontStyle: 'italic',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: SPACING.xl,
    },
    emptyStateTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.text,
        marginTop: SPACING.lg,
        marginBottom: SPACING.sm,
    },
    emptyStateText: {
        fontSize: FONT_SIZES.md,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
});
