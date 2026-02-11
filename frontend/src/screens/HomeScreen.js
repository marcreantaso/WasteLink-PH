import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import Card from '../components/Card';
import StatusBar from '../components/StatusBar';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';
import { speak } from '../services/voice';

export default function HomeScreen({ navigation }) {
    const { t, lang } = useLanguage();
    const { user } = useAuth();
    const { isOnline, pendingCount, localGet } = useOffline();
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        todayEarnings: 245,
        totalCollected: 128.5,
        totalItems: 47,
        weeklyEarnings: 1680,
    });
    const [recentCollections, setRecentCollections] = useState([]);

    useEffect(() => {
        loadData();
        speak(`${t('greeting')} ${user?.name || ''}! ${t('todayEarnings')}: ${stats.todayEarnings} pesos.`, lang);
    }, []);

    const loadData = async () => {
        const collections = await localGet('collections');
        setRecentCollections(collections.slice(-5).reverse());
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const quickActions = [
        { icon: 'scan-outline', label: t('scan'), color: colors.primary, screen: 'Scan' },
        { icon: 'add-circle-outline', label: t('logPickup'), color: colors.secondary, screen: 'Collection' },
        { icon: 'storefront-outline', label: t('marketplace'), color: colors.accent, screen: 'Marketplace' },
        { icon: 'medkit-outline', label: t('health'), color: colors.danger, screen: 'Health' },
    ];

    return (
        <View style={styles.container}>
            <StatusBar />
            <ScrollView
                contentContainerStyle={styles.scroll}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
            >
                {/* Greeting */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>
                            {t('greeting')}, {user?.name || 'Worker'} 👋
                        </Text>
                        <Text style={styles.date}>
                            {new Date().toLocaleDateString(lang === 'tl' ? 'fil-PH' : 'en-US', {
                                weekday: 'long', month: 'long', day: 'numeric',
                            })}
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('Profile')}>
                        <Ionicons name="person-circle" size={44} color={colors.primary} />
                    </TouchableOpacity>
                </View>

                {/* Earnings Hero Card */}
                <View style={styles.heroCard}>
                    <View style={styles.heroGradient}>
                        <Text style={styles.heroLabel}>{t('todayEarnings')}</Text>
                        <Text style={styles.heroAmount}>₱{stats.todayEarnings.toLocaleString()}</Text>
                        <View style={styles.heroStats}>
                            <View style={styles.heroStat}>
                                <Ionicons name="scale-outline" size={18} color="rgba(255,255,255,0.8)" />
                                <Text style={styles.heroStatText}>{stats.totalCollected} kg</Text>
                            </View>
                            <View style={styles.heroDivider} />
                            <View style={styles.heroStat}>
                                <Ionicons name="cube-outline" size={18} color="rgba(255,255,255,0.8)" />
                                <Text style={styles.heroStatText}>{stats.totalItems} items</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Quick Actions */}
                <Text style={styles.sectionTitle}>{t('quickActions')}</Text>
                <View style={styles.actionsGrid}>
                    {quickActions.map((action) => (
                        <TouchableOpacity
                            key={action.screen}
                            style={styles.actionCard}
                            onPress={() => navigation.navigate(action.screen)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: action.color + '15' }]}>
                                <Ionicons name={action.icon} size={28} color={action.color} />
                            </View>
                            <Text style={styles.actionLabel}>{action.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Weekly Overview */}
                <Card title={t('weeklySummary')} icon="trending-up-outline" iconColor={colors.success}>
                    <View style={styles.weekRow}>
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                            const heights = [35, 55, 45, 70, 60, 80, 40];
                            return (
                                <View key={day} style={styles.weekDay}>
                                    <View style={[styles.weekBar, { height: heights[i], backgroundColor: i < 3 ? colors.primary : colors.primaryLight }]} />
                                    <Text style={styles.weekLabel}>{day}</Text>
                                </View>
                            );
                        })}
                    </View>
                    <View style={styles.weekTotal}>
                        <Text style={styles.weekTotalLabel}>{t('weeklySummary')}</Text>
                        <Text style={styles.weekTotalAmount}>₱{stats.weeklyEarnings.toLocaleString()}</Text>
                    </View>
                </Card>

                {/* Pending Sync */}
                {pendingCount > 0 && (
                    <Card title={t('pendingSync')} icon="cloud-upload-outline" iconColor={colors.warning}>
                        <View style={styles.pendingRow}>
                            <Text style={styles.pendingCount}>{pendingCount}</Text>
                            <Text style={styles.pendingText}>
                                {lang === 'tl' ? 'bagay ang hindi pa na-sync' : 'items waiting to sync'}
                            </Text>
                        </View>
                    </Card>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    scroll: { padding: spacing.md, paddingBottom: spacing.xxl },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
    greeting: { ...typography.h2, color: colors.textPrimary },
    date: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
    profileBtn: { padding: spacing.xs },

    heroCard: {
        borderRadius: borderRadius.xl, overflow: 'hidden', marginBottom: spacing.lg, ...shadows.lg,
    },
    heroGradient: {
        backgroundColor: colors.primary, padding: spacing.lg, paddingVertical: spacing.xl,
    },
    heroLabel: { ...typography.caption, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: 1 },
    heroAmount: { fontSize: 40, fontWeight: '800', color: colors.white, marginVertical: spacing.sm },
    heroStats: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
    heroStat: { flexDirection: 'row', alignItems: 'center' },
    heroStatText: { ...typography.caption, color: 'rgba(255,255,255,0.9)', marginLeft: spacing.xs },
    heroDivider: { width: 1, height: 16, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: spacing.md },

    sectionTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.md },

    actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.lg, gap: spacing.sm },
    actionCard: {
        width: '48%', backgroundColor: colors.card, borderRadius: borderRadius.lg,
        padding: spacing.md, alignItems: 'center', ...shadows.sm, minHeight: 100, justifyContent: 'center',
    },
    actionIcon: {
        width: 56, height: 56, borderRadius: borderRadius.md,
        alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm,
    },
    actionLabel: { ...typography.bodyBold, color: colors.textPrimary, textAlign: 'center' },

    weekRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 100, marginBottom: spacing.sm },
    weekDay: { alignItems: 'center' },
    weekBar: { width: 24, borderRadius: 4, marginBottom: spacing.xs },
    weekLabel: { ...typography.small, color: colors.textMuted },
    weekTotal: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
    weekTotalLabel: { ...typography.body, color: colors.textSecondary },
    weekTotalAmount: { ...typography.h3, color: colors.primary },

    pendingRow: { flexDirection: 'row', alignItems: 'center' },
    pendingCount: { fontSize: 36, fontWeight: '800', color: colors.warning, marginRight: spacing.md },
    pendingText: { ...typography.body, color: colors.textSecondary, flex: 1 },
});
