import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants';
import { usePets } from '../contexts';
import { config } from '../config';
import { info, warn, error } from '../utils/logging';

export default function ProfileScreen() {
  const { addSamplePets, clearAllPets, pets, loadPetsFromStorage } = usePets();

  const handleExportData = () => {
    Alert.alert('Export Data', 'This feature will be available in a future update.', [
      { text: 'OK' },
    ]);
  };

  const handleImportData = () => {
    Alert.alert('Import Data', 'This feature will be available in a future update.', [
      { text: 'OK' },
    ]);
  };

  const handleBackupSettings = () => {
    Alert.alert('Backup Settings', 'This feature will be available in a future update.', [
      { text: 'OK' },
    ]);
  };

  const handleNotifications = () => {
    Alert.alert('Notification Settings', 'This feature will be available in a future update.', [
      { text: 'OK' },
    ]);
  };

  const handleAbout = () => {
    Alert.alert(
      'About Pet Tracker',
      `Pet Tracker v1.0.0\n\nKeep track of your beloved pets' activities, health, and more!\n\nEnvironment: ${config.environment}`,
      [{ text: 'OK' }]
    );
  };

  // Development-only functions
  const handleGenerateSamplePets = async () => {
    try {
      info('Generating sample pets from ProfileScreen');
      await addSamplePets();
      Alert.alert('Success', 'Sample pets have been generated!');
    } catch (err) {
      error('Failed to generate sample pets', err);
      Alert.alert('Error', 'Failed to generate sample pets. Please try again.');
    }
  };

  const handleClearAllPets = () => {
    Alert.alert(
      'Clear All Pets',
      'This will permanently delete all pets and their data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              info('Clearing all pets from ProfileScreen');
              await clearAllPets();
              Alert.alert('Success', 'All pets have been cleared!');
            } catch (err) {
              error('Failed to clear pets', err);
              Alert.alert('Error', 'Failed to clear pets. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleClearStorage = () => {
    Alert.alert(
      'Clear All Storage',
      'This will permanently delete ALL app data including pets, settings, and cached data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              warn('Clearing all app storage from ProfileScreen');

              // Clear pets first
              await clearAllPets();

              // Then clear other storage (you can extend this as needed)
              // await PetTrackerStorageManager.clearAll();

              Alert.alert('Success', 'All app data has been cleared!');
            } catch (err) {
              error('Failed to clear storage', err);
              Alert.alert('Error', 'Failed to clear storage. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleRefreshData = async () => {
    try {
      info('Refreshing all data from ProfileScreen');
      await loadPetsFromStorage();
      Alert.alert('Success', 'Data has been refreshed!');
    } catch (err) {
      error('Failed to refresh data', err);
      Alert.alert('Error', 'Failed to refresh data. Please try again.');
    }
  };

  const handleShowAppInfo = () => {
    const petCount = pets.length;
    const environmentInfo = `Environment: ${config.environment}
API Base URL: ${config.apiBaseUrl}
Debug Mode: ${config.enableDebugMode ? 'Enabled' : 'Disabled'}
Logging: ${config.enableLogging ? 'Enabled' : 'Disabled'}
Pet Count: ${petCount}`;

    Alert.alert('App Information', environmentInfo, [{ text: 'OK' }]);
  };

  const renderMenuItem = (
    iconName: keyof typeof Ionicons.glyphMap,
    title: string,
    onPress: () => void,
    color = COLORS.text
  ) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <Ionicons name={iconName} size={24} color={color} />
        <Text style={[styles.menuItemText, { color }]}>{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileAvatar}>
            <Ionicons name="person" size={48} color={COLORS.surface} />
          </View>
          <Text style={styles.profileName}>Pet Owner</Text>
          <Text style={styles.profileSubtitle}>Pet Tracker User</Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          {renderMenuItem('download-outline', 'Export Data', handleExportData)}
          {renderMenuItem('cloud-upload-outline', 'Import Data', handleImportData)}
          {renderMenuItem('cloud-outline', 'Backup Settings', handleBackupSettings)}
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          {renderMenuItem('notifications-outline', 'Notifications', handleNotifications)}
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Support</Text>
          {renderMenuItem('information-circle-outline', 'About', handleAbout)}
        </View>

        {/* Development Tools - show in development */}
        <View style={styles.menuSection}>
          <Text style={[styles.sectionTitle, { color: COLORS.warning }]}>Development Tools</Text>
          {renderMenuItem('flask-outline', 'Generate Sample Pets', handleGenerateSamplePets)}
          {renderMenuItem('information-circle-outline', 'App Info', handleShowAppInfo)}
          {renderMenuItem('refresh-outline', 'Refresh Data', handleRefreshData)}
          {renderMenuItem('trash-outline', 'Clear All Pets', handleClearAllPets)}
          {renderMenuItem('nuclear-outline', 'Clear All Storage', handleClearStorage)}
        </View>

        {/* App Version */}
        <Text style={styles.versionText}>Pet Tracker v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: SPACING.md,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  profileName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  profileSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  menuSection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
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
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: FONT_SIZES.md,
    marginLeft: SPACING.md,
    fontWeight: '500',
  },
  versionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    marginTop: SPACING.xl,
  },
});
