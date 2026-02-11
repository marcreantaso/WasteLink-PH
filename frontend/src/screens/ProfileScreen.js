import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import Card from '../components/Card';
import Button from '../components/Button';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';
import { isVoiceEnabled, toggleVoice } from '../services/voice';

export default function ProfileScreen({ navigation }) {
    const { t, lang, toggleLanguage } = useLanguage();
    const { user, logout } = useAuth();
    const { isOnline, pendingCount, lastSyncAt } = useOffline();
    const [voiceOn, setVoiceOn] = useState(isVoiceEnabled());

    const handleVoiceToggle = async () => {
        const newVal = await toggleVoice();
        setVoiceOn(newVal);
    };

    const handleLogout = () => {
        Alert.alert(
            t('logout'),
            lang === 'tl' ? 'Sigurado ka bang gusto mong mag-logout?' : 'Are you sure you want to logout?',
            [
                { text: t('cancel'), style: 'cancel' },
                { text: t('logout'), style: 'destructive', onPress: logout },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatar}>
                        <Ionicons name="person" size={48} color={colors.white} />
                    </View>
                    <Text style={styles.name}>{user?.name || 'Waste Worker'}</Text>
                    <Text style={styles.barangay}>
                        📍 {user?.barangay || 'Santa Rosa, Laguna'}
                    </Text>
                    <View style={styles.statusRow}>
                        <View style={[styles.statusDot, { backgroundColor: isOnline ? colors.success : colors.danger }]} />
                        <Text style={styles.statusText}>{isOnline ? 'Online' : t('offline')}</Text>
                    </View>
                </View>

                {/* Language Toggle */}
                <Card>
                    <TouchableOpacity style={styles.settingRow} onPress={toggleLanguage}>
                        <View style={styles.settingLeft}>
                            <View style={[styles.settingIcon, { backgroundColor: colors.accent + '15' }]}>
                                <Ionicons name="language" size={22} color={colors.accent} />
                            </View>
                            <View>
                                <Text style={styles.settingLabel}>{t('language')}</Text>
                                <Text style={styles.settingValue}>
                                    {lang === 'en' ? 'English' : 'Tagalog'}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.langBadge}>
                            <Text style={styles.langBadgeText}>{lang === 'en' ? 'EN' : 'TL'}</Text>
                        </View>
                    </TouchableOpacity>
                </Card>

                {/* Voice Prompts */}
                <Card>
                    <View style={styles.settingRow}>
                        <View style={styles.settingLeft}>
                            <View style={[styles.settingIcon, { backgroundColor: colors.secondary + '15' }]}>
                                <Ionicons name="volume-high" size={22} color={colors.secondary} />
                            </View>
                            <View>
                                <Text style={styles.settingLabel}>{t('voicePrompts')}</Text>
                                <Text style={styles.settingValue}>
                                    {voiceOn
                                        ? (lang === 'tl' ? 'Naka-on' : 'Enabled')
                                        : (lang === 'tl' ? 'Naka-off' : 'Disabled')}
                                </Text>
                            </View>
                        </View>
                        <Switch
                            value={voiceOn}
                            onValueChange={handleVoiceToggle}
                            trackColor={{ false: colors.border, true: colors.primaryLight }}
                            thumbColor={voiceOn ? colors.primary : colors.textMuted}
                        />
                    </View>
                </Card>

                {/* Sync Info */}
                <Card title={lang === 'tl' ? 'Impormasyon ng Sync' : 'Sync Info'} icon="sync-outline" iconColor={colors.primary}>
                    <View style={styles.syncRow}>
                        <Text style={styles.syncLabel}>{lang === 'tl' ? 'Katayuan' : 'Status'}</Text>
                        <View style={styles.syncStatus}>
                            <View style={[styles.statusDot, { backgroundColor: isOnline ? colors.success : colors.danger }]} />
                            <Text style={styles.syncValue}>{isOnline ? 'Online' : 'Offline'}</Text>
                        </View>
                    </View>
                    <View style={styles.syncRow}>
                        <Text style={styles.syncLabel}>{t('pendingSync')}</Text>
                        <Text style={[styles.syncValue, pendingCount > 0 && { color: colors.warning }]}>
                            {pendingCount} {lang === 'tl' ? 'bagay' : 'items'}
                        </Text>
                    </View>
                    <View style={styles.syncRow}>
                        <Text style={styles.syncLabel}>{lang === 'tl' ? 'Huling sync' : 'Last sync'}</Text>
                        <Text style={styles.syncValue}>
                            {lastSyncAt ? new Date(lastSyncAt).toLocaleTimeString() : (lang === 'tl' ? 'Wala pa' : 'Never')}
                        </Text>
                    </View>
                </Card>

                {/* Stats */}
                <Card title={lang === 'tl' ? 'Aking Stats' : 'My Stats'} icon="stats-chart" iconColor={colors.success}>
                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>47</Text>
                            <Text style={styles.statLabel}>{lang === 'tl' ? 'Koleksyon' : 'Collections'}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>128.5</Text>
                            <Text style={styles.statLabel}>kg</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>₱1.8k</Text>
                            <Text style={styles.statLabel}>{lang === 'tl' ? 'Kita' : 'Earned'}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>12</Text>
                            <Text style={styles.statLabel}>{lang === 'tl' ? 'Araw' : 'Days'}</Text>
                        </View>
                    </View>
                </Card>

                {/* Logout */}
                <Button
                    title={t('logout')}
                    icon="log-out-outline"
                    variant="danger"
                    onPress={handleLogout}
                    style={styles.logoutBtn}
                />

                <Text style={styles.version}>WasteLink PH v1.0.0</Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    scroll: { padding: spacing.md, paddingBottom: spacing.xxl },

    profileHeader: { alignItems: 'center', marginBottom: spacing.lg },
    avatar: {
        width: 96, height: 96, borderRadius: 48, backgroundColor: colors.primary,
        alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md, ...shadows.md,
    },
    name: { ...typography.h2, color: colors.textPrimary },
    barangay: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
    statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
    statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: spacing.xs },
    statusText: { ...typography.caption, color: colors.textMuted },

    settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    settingLeft: { flexDirection: 'row', alignItems: 'center' },
    settingIcon: { width: 44, height: 44, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
    settingLabel: { ...typography.bodyBold, color: colors.textPrimary },
    settingValue: { ...typography.caption, color: colors.textMuted },

    langBadge: { backgroundColor: colors.accent, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full },
    langBadgeText: { ...typography.bodyBold, color: colors.white, fontSize: 14 },

    syncRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
    syncLabel: { ...typography.body, color: colors.textSecondary },
    syncStatus: { flexDirection: 'row', alignItems: 'center' },
    syncValue: { ...typography.bodyBold, color: colors.textPrimary },

    statsGrid: { flexDirection: 'row', justifyContent: 'space-around' },
    statItem: { alignItems: 'center' },
    statNumber: { fontSize: 24, fontWeight: '800', color: colors.primary },
    statLabel: { ...typography.small, color: colors.textMuted, marginTop: 2 },

    logoutBtn: { marginTop: spacing.lg },
    version: { ...typography.small, color: colors.textMuted, textAlign: 'center', marginTop: spacing.lg },
});
