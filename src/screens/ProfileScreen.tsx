import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants';

export default function ProfileScreen() {
    const handleExportData = () => {
        Alert.alert(
            'Export Data',
            'This feature will be available in a future update.',
            [{ text: 'OK' }]
        );
    };

    const handleImportData = () => {
        Alert.alert(
            'Import Data',
            'This feature will be available in a future update.',
            [{ text: 'OK' }]
        );
    };

    const handleBackupSettings = () => {
        Alert.alert(
            'Backup Settings',
            'This feature will be available in a future update.',
            [{ text: 'OK' }]
        );
    };

    const handleNotifications = () => {
        Alert.alert(
            'Notification Settings',
            'This feature will be available in a future update.',
            [{ text: 'OK' }]
        );
    };

    const handleAbout = () => {
        Alert.alert(
            'About Pet Tracker',
            'Pet Tracker v1.0.0\n\nKeep track of your beloved pets\' activities, health, and more!',
            [{ text: 'OK' }]
        );
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
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
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

                {/* App Version */}
                <Text style={styles.versionText}>Pet Tracker v1.0.0</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        flex: 1,
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
        marginTop: 'auto',
        marginBottom: SPACING.lg,
    },
});
