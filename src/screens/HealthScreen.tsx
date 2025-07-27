import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants';
import { usePets } from '../contexts';
import { VetVisit, Vaccination } from '../types';
import { formatDate } from '../utils';

export default function HealthScreen() {
  const { vetVisits, vaccinations, pets } = usePets();

  const upcomingVisits = vetVisits.filter(
    visit => visit.nextVisitDate && visit.nextVisitDate > new Date()
  );

  const overdueVaccinations = vaccinations.filter(
    vacc => vacc.nextDueDate && vacc.nextDueDate < new Date()
  );

  const renderVetVisitItem = ({ item }: { item: VetVisit }) => {
    const pet = pets.find(p => p.id === item.petId);

    return (
      <View style={styles.healthCard}>
        <View style={styles.healthIcon}>
          <Ionicons name="medical" size={20} color={COLORS.info} />
        </View>
        <View style={styles.healthInfo}>
          <Text style={styles.healthTitle}>{pet?.name || 'Unknown Pet'} • Vet Visit</Text>
          <Text style={styles.healthDate}>
            {item.nextVisitDate ? formatDate(item.nextVisitDate) : 'No date set'}
          </Text>
          <Text style={styles.healthDetail}>
            {item.clinic} - Dr. {item.veterinarian}
          </Text>
          <Text style={styles.healthReason}>{item.reason}</Text>
        </View>
      </View>
    );
  };

  const renderVaccinationItem = ({ item }: { item: Vaccination }) => {
    const pet = pets.find(p => p.id === item.petId);
    const isOverdue = item.nextDueDate && item.nextDueDate < new Date();

    return (
      <View style={[styles.healthCard, isOverdue && styles.overdueCard]}>
        <View style={styles.healthIcon}>
          <Ionicons name="shield" size={20} color={isOverdue ? COLORS.error : COLORS.success} />
        </View>
        <View style={styles.healthInfo}>
          <Text style={styles.healthTitle}>
            {pet?.name || 'Unknown Pet'} • {item.vaccineName}
          </Text>
          <Text style={[styles.healthDate, isOverdue && styles.overdueText]}>
            {item.nextDueDate ? `Due: ${formatDate(item.nextDueDate)}` : 'No due date'}
          </Text>
          <Text style={styles.healthDetail}>Last given: {formatDate(item.dateAdministered)}</Text>
          <Text style={styles.healthDetail}>Veterinarian: Dr. {item.veterinarian}</Text>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="medical-outline" size={64} color={COLORS.textLight} />
      <Text style={styles.emptyStateTitle}>No health records</Text>
      <Text style={styles.emptyStateText}>
        Keep track of your pet's health by adding vet visits and vaccination records.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <FlatList
        data={[...upcomingVisits, ...overdueVaccinations]}
        renderItem={props => {
          if ('clinic' in props.item) {
            return renderVetVisitItem(props as { item: VetVisit });
          } else {
            return renderVaccinationItem(props as { item: Vaccination });
          }
        }}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        ListHeaderComponent={() => (
          <>
            {overdueVaccinations.length > 0 && (
              <View style={styles.alertSection}>
                <Text style={styles.alertTitle}>
                  ⚠️ {overdueVaccinations.length} Overdue Vaccination(s)
                </Text>
              </View>
            )}
            {upcomingVisits.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
              </View>
            )}
          </>
        )}
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
  alertSection: {
    backgroundColor: COLORS.warning,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
  },
  alertTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.surface,
    textAlign: 'center',
  },
  section: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  healthCard: {
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
  overdueCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  healthIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  healthInfo: {
    flex: 1,
  },
  healthTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  healthDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  overdueText: {
    color: COLORS.error,
    fontWeight: 'bold',
  },
  healthDetail: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  healthReason: {
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
