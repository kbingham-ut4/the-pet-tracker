import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES } from '../constants';
import { usePets } from '../contexts';

export default function HomeScreen() {
  const { pets, activities, vetVisits, addSamplePets } = usePets();

  const upcomingVisits = vetVisits
    .filter(visit => visit.nextVisitDate && visit.nextVisitDate > new Date())
    .slice(0, 3);

  const recentActivities = activities.slice(-5).reverse();

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Welcome to Pet Tracker</Text>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{pets.length}</Text>
            <Text style={styles.statLabel}>Pets</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{activities.length}</Text>
            <Text style={styles.statLabel}>Activities</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{vetVisits.length}</Text>
            <Text style={styles.statLabel}>Vet Visits</Text>
          </View>
        </View>

        {/* Upcoming Vet Visits */}
        {upcomingVisits.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming Vet Visits</Text>
            {upcomingVisits.map(visit => (
              <View key={visit.id} style={styles.listItem}>
                <Text style={styles.listItemTitle}>
                  {pets.find(p => p.id === visit.petId)?.name || 'Unknown Pet'}
                </Text>
                <Text style={styles.listItemSubtitle}>{visit.nextVisitDate?.toDateString()}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Recent Activities */}
        {recentActivities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            {recentActivities.map(activity => (
              <View key={activity.id} style={styles.listItem}>
                <Text style={styles.listItemTitle}>
                  {pets.find(p => p.id === activity.petId)?.name || 'Unknown Pet'}
                </Text>
                <Text style={styles.listItemSubtitle}>
                  {activity.type} - {activity.date.toDateString()}
                </Text>
              </View>
            ))}
          </View>
        )}

        {pets.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No pets added yet</Text>
            <Text style={styles.emptyStateText}>
              Start by adding your first pet to begin tracking their activities and health.
            </Text>
            <TouchableOpacity style={styles.sampleButton} onPress={addSamplePets}>
              <Text style={styles.sampleButtonText}>Add Sample Pets</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.title,
    fontWeight: 'bold',
    color: COLORS.text,
    marginVertical: SPACING.lg,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  listItem: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  listItemTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  listItemSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyStateTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptyStateText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  sampleButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sampleButtonText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});
