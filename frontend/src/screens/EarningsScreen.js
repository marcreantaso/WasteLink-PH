import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import Card from '../components/Card';
import Button from '../components/Button';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const MOCK_TRANSACTIONS = [
    { id: '1', type: 'sale', material: 'PET', weight: 5.2, amount: 93, date: '2026-02-11' },
    { id: '2', type: 'sale', material: 'METAL', weight: 3.1, amount: 77, date: '2026-02-11' },
    { id: '3', type: 'payout', method: 'GCash', amount: -500, date: '2026-02-10' },
    { id: '4', type: 'sale', material: 'PAPER', weight: 10, amount: 80, date: '2026-02-10' },
    { id: '5', type: 'sale', material: 'HDPE', weight: 2.5, amount: 30, date: '2026-02-09' },
    { id: '6', type: 'commission', amount: -14, date: '2026-02-09' },
];

export default function EarningsScreen({ navigation }) {
    const { t, lang } = useLanguage();
    const [period, setPeriod] = useState('daily');
    const [showPayoutModal, setShowPayoutModal] = useState(false);

    const balance = 1847;
    const todayEarnings = 245;
    const weeklyEarnings = 1680;

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <Text style={styles.title}>{t('earnings')}</Text>

                {/* Balance Card */}
                <View style={styles.balanceCard}>
                    <Text style={styles.balanceLabel}>{t('balance')}</Text>
                    <Text style={styles.balanceAmount}>₱{balance.toLocaleString()}</Text>
                    <View style={styles.balanceRow}>
                        <View style={styles.balanceStat}>
                            <Ionicons name="arrow-up-circle" size={20} color="#A5D6A7" />
                            <Text style={styles.balanceStatText}>+₱{todayEarnings} {lang === 'tl' ? 'ngayon' : 'today'}</Text>
                        </View>
                        <View style={styles.balanceStat}>
                            <Ionicons name="trending-up" size={20} color="#A5D6A7" />
                            <Text style={styles.balanceStatText}>₱{weeklyEarnings}/week</Text>
                        </View>
                    </View>

                    <Button
                        title={t('requestPayout')}
                        icon="wallet-outline"
                        variant="secondary"
                        onPress={() => setShowPayoutModal(true)}
                        style={styles.payoutBtn}
                    />
                </View>

                {/* Period Toggle */}
                <View style={styles.periodToggle}>
                    {['daily', 'weekly'].map((p) => (
                        <TouchableOpacity
                            key={p}
                            style={[styles.periodTab, period === p && styles.periodTabActive]}
                            onPress={() => setPeriod(p)}
                        >
                            <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
                                {p === 'daily' ? t('dailySummary') : t('weeklySummary')}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Payout Methods */}
                <Card title={lang === 'tl' ? 'Paraan ng Bayad' : 'Payout Methods'} icon="card-outline" iconColor={colors.accent}>
                    <TouchableOpacity style={styles.paymentMethod}>
                        <View style={[styles.paymentIcon, { backgroundColor: '#0050B3' }]}>
                            <Text style={styles.paymentIconText}>G</Text>
                        </View>
                        <View style={styles.paymentInfo}>
                            <Text style={styles.paymentName}>GCash</Text>
                            <Text style={styles.paymentNumber}>****7890</Text>
                        </View>
                        <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.paymentMethod}>
                        <View style={[styles.paymentIcon, { backgroundColor: '#4CAF50' }]}>
                            <Text style={styles.paymentIconText}>M</Text>
                        </View>
                        <View style={styles.paymentInfo}>
                            <Text style={styles.paymentName}>Maya</Text>
                            <Text style={styles.paymentNumber}>
                                {lang === 'tl' ? 'Hindi pa naka-link' : 'Not linked'}
                            </Text>
                        </View>
                        <Ionicons name="add-circle-outline" size={24} color={colors.textMuted} />
                    </TouchableOpacity>
                </Card>

                {/* Transaction History */}
                <Card title={lang === 'tl' ? 'Mga Transaksyon' : 'Transactions'} icon="receipt-outline" iconColor={colors.secondary}>
                    {MOCK_TRANSACTIONS.map((tx) => (
                        <View key={tx.id} style={styles.txRow}>
                            <View style={[styles.txIcon, {
                                backgroundColor: tx.amount > 0 ? colors.success + '15' : colors.danger + '15'
                            }]}>
                                <Ionicons
                                    name={tx.type === 'sale' ? 'arrow-down' : tx.type === 'payout' ? 'arrow-up' : 'remove-circle-outline'}
                                    size={18}
                                    color={tx.amount > 0 ? colors.success : colors.danger}
                                />
                            </View>
                            <View style={styles.txInfo}>
                                <Text style={styles.txTitle}>
                                    {tx.type === 'sale'
                                        ? `${tx.material} - ${tx.weight}kg`
                                        : tx.type === 'payout'
                                            ? `${t('requestPayout')} (${tx.method})`
                                            : t('commission')}
                                </Text>
                                <Text style={styles.txDate}>{tx.date}</Text>
                            </View>
                            <Text style={[styles.txAmount, { color: tx.amount > 0 ? colors.success : colors.danger }]}>
                                {tx.amount > 0 ? '+' : ''}₱{Math.abs(tx.amount)}
                            </Text>
                        </View>
                    ))}
                </Card>

                {/* Commission Info */}
                <View style={styles.commissionInfo}>
                    <Ionicons name="information-circle-outline" size={18} color={colors.textMuted} />
                    <Text style={styles.commissionText}>
                        {lang === 'tl'
                            ? '5% komisyon sa bawat transaksyon para sa pagpapanatili ng platform'
                            : '5% commission per transaction for platform maintenance'}
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    scroll: { padding: spacing.md, paddingBottom: spacing.xxl },

    title: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.lg },

    balanceCard: {
        backgroundColor: colors.primaryDark, borderRadius: borderRadius.xl, padding: spacing.lg,
        marginBottom: spacing.lg, ...shadows.lg,
    },
    balanceLabel: { ...typography.caption, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1 },
    balanceAmount: { fontSize: 44, fontWeight: '800', color: colors.white, marginVertical: spacing.sm },
    balanceRow: { flexDirection: 'row', marginBottom: spacing.lg },
    balanceStat: { flexDirection: 'row', alignItems: 'center', marginRight: spacing.lg },
    balanceStatText: { ...typography.caption, color: 'rgba(255,255,255,0.85)', marginLeft: spacing.xs },
    payoutBtn: { marginTop: spacing.sm },

    periodToggle: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: borderRadius.md, marginBottom: spacing.lg, padding: 4 },
    periodTab: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderRadius: borderRadius.sm },
    periodTabActive: { backgroundColor: colors.primary },
    periodText: { ...typography.bodyBold, color: colors.textMuted },
    periodTextActive: { color: colors.white },

    paymentMethod: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
    paymentIcon: { width: 40, height: 40, borderRadius: borderRadius.sm, alignItems: 'center', justifyContent: 'center' },
    paymentIconText: { fontSize: 18, fontWeight: '800', color: colors.white },
    paymentInfo: { flex: 1, marginLeft: spacing.md },
    paymentName: { ...typography.bodyBold, color: colors.textPrimary },
    paymentNumber: { ...typography.small, color: colors.textMuted },

    txRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
    txIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    txInfo: { flex: 1, marginLeft: spacing.md },
    txTitle: { ...typography.body, color: colors.textPrimary },
    txDate: { ...typography.small, color: colors.textMuted },
    txAmount: { ...typography.bodyBold, fontSize: 16 },

    commissionInfo: { flexDirection: 'row', alignItems: 'flex-start', padding: spacing.md, marginTop: spacing.sm },
    commissionText: { ...typography.small, color: colors.textMuted, marginLeft: spacing.sm, flex: 1, lineHeight: 18 },
});
