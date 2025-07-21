import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants';
import { usePets } from '../contexts';
import { Pet, PetType } from '../types';
import { RootStackNavigationProp } from '../types/Navigation';

export default function PetsScreen() {
    const { pets } = usePets();
    const navigation = useNavigation<RootStackNavigationProp>();

    const renderPetItem = ({ item }: { item: Pet }) => (
        <View style={styles.petCard}>
            <View style={[
                styles.petTypeIcon,
                { backgroundColor: COLORS.petColors[item.type] || COLORS.petColors.other }
            ]}>
                <Ionicons
                    name="paw"
                    size={24}
                    color={COLORS.surface}
                />
            </View>
            <View style={styles.petInfo}>
                <Text style={styles.petName}>{item.name}</Text>
                <Text style={styles.petDetails}>
                    {item.breed} • {item.age ? `${item.age} years old` : 'Age unknown'}
                </Text>
                <Text style={styles.petType}>{item.type}</Text>

                {/* Weight Management and Food Log buttons for dogs */}
                {item.type === PetType.DOG && (
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => navigation.navigate('WeightManagement', { petId: item.id })}
                        >
                            <Ionicons name="fitness" size={16} color={COLORS.primary} />
                            <Text style={styles.actionButtonText}>Weight</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => navigation.navigate('FoodLog', { petId: item.id })}
                        >
                            <Ionicons name="restaurant" size={16} color={COLORS.primary} />
                            <Text style={styles.actionButtonText}>Food Log</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
            <Ionicons
                name="chevron-forward"
                size={20}
                color={COLORS.textSecondary}
            />
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Ionicons name="paw-outline" size={64} color={COLORS.textLight} />
            <Text style={styles.emptyStateTitle}>No pets added yet</Text>
            <Text style={styles.emptyStateText}>
                Tap the + button to add your first furry, feathered, or scaly friend!
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.addButton}>
                    <Ionicons name="add" size={24} color={COLORS.surface} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={pets}
                renderItem={renderPetItem}
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
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: SPACING.md,
        paddingBottom: SPACING.md,
    },
    addButton: {
        backgroundColor: COLORS.primary,
        borderRadius: BORDER_RADIUS.round,
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    listContainer: {
        paddingHorizontal: SPACING.md,
        paddingBottom: SPACING.lg,
        flexGrow: 1,
    },
    petCard: {
        flexDirection: 'row',
        alignItems: 'center',
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
    petTypeIcon: {
        width: 48,
        height: 48,
        borderRadius: BORDER_RADIUS.round,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    petInfo: {
        flex: 1,
    },
    petName: {
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    petDetails: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
        marginBottom: SPACING.xs,
    },
    petType: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textLight,
        textTransform: 'capitalize',
    },
    actionButtons: {
        flexDirection: 'row',
        marginTop: SPACING.sm,
        gap: SPACING.sm,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        borderRadius: BORDER_RADIUS.sm,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    actionButtonText: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.primary,
        marginLeft: SPACING.xs,
        fontWeight: '500',
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
