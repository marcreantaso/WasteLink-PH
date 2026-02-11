import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import Card from '../components/Card';
import Button from '../components/Button';
import MaterialBadge from '../components/MaterialBadge';
import { useLanguage } from '../context/LanguageContext';

// Mock marketplace data
const MOCK_LISTINGS = [
    {
        id: '1', seller: 'Maria Santos', material: 'PET', quantity: 25, pricePerKg: 18,
        location: 'Balibago', posted: '2h ago', bids: 3,
    },
    {
        id: '2', seller: 'Juan dela Cruz', material: 'METAL', quantity: 15, pricePerKg: 28,
        location: 'Macabling', posted: '4h ago', bids: 5,
    },
    {
        id: '3', seller: 'Rosa Jimenez', material: 'PAPER', quantity: 50, pricePerKg: 9,
        location: 'Dita', posted: '6h ago', bids: 1,
    },
    {
        id: '4', seller: 'Pedro Ramos', material: 'HDPE', quantity: 10, pricePerKg: 14,
        location: 'Tagapo', posted: '8h ago', bids: 2,
    },
    {
        id: '5', seller: 'Ana Reyes', material: 'ORGANIC', quantity: 30, pricePerKg: 3,
        location: 'Sinalhan', posted: '1d ago', bids: 0,
    },
];

const MATERIAL_FILTERS = ['ALL', 'PET', 'HDPE', 'METAL', 'PAPER', 'ORGANIC'];

export default function MarketplaceScreen({ navigation }) {
    const { t, lang } = useLanguage();
    const [filter, setFilter] = useState('ALL');
    const [listings, setListings] = useState(MOCK_LISTINGS);

    const filtered = filter === 'ALL' ? listings : listings.filter((l) => l.material === filter);

    const handleAccept = (id) => {
        setListings((prev) =>
            prev.map((l) => (l.id === id ? { ...l, accepted: true } : l))
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <Text style={styles.title}>{t('marketplace')}</Text>
                <Text style={styles.subtitle}>
                    {lang === 'tl' ? 'Mga alok ngayon mula sa mga mamimili' : 'Live offers from buyers & co-ops'}
                </Text>

                {/* Filter Chips */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
                    {MATERIAL_FILTERS.map((m) => (
                        <TouchableOpacity
                            key={m}
                            style={[styles.filterChip, filter === m && styles.filterChipActive]}
                            onPress={() => setFilter(m)}
                        >
                            <Text style={[styles.filterText, filter === m && styles.filterTextActive]}>
                                {m === 'ALL' ? (lang === 'tl' ? 'Lahat' : 'All') : t(m.toLowerCase())}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Listings */}
                {filtered.map((listing) => (
                    <Card key={listing.id} style={listing.accepted ? styles.acceptedCard : undefined}>
                        <View style={styles.listingHeader}>
                            <MaterialBadge type={listing.material} size="medium" />
                            <View style={styles.bidsBadge}>
                                <Ionicons name="hand-left-outline" size={14} color={colors.accent} />
                                <Text style={styles.bidsText}>{listing.bids} bids</Text>
                            </View>
                        </View>

                        <View style={styles.listingDetails}>
                            <View style={styles.detailRow}>
                                <Ionicons name="person-outline" size={16} color={colors.textMuted} />
                                <Text style={styles.detailText}>{listing.seller}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Ionicons name="location-outline" size={16} color={colors.textMuted} />
                                <Text style={styles.detailText}>{listing.location}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Ionicons name="time-outline" size={16} color={colors.textMuted} />
                                <Text style={styles.detailText}>{listing.posted}</Text>
                            </View>
                        </View>

                        <View style={styles.priceRow}>
                            <View>
                                <Text style={styles.quantity}>{listing.quantity} kg</Text>
                                <Text style={styles.pricePerKg}>₱{listing.pricePerKg}/kg</Text>
                            </View>
                            <Text style={styles.totalPrice}>
                                ₱{(listing.quantity * listing.pricePerKg).toLocaleString()}
                            </Text>
                        </View>

                        {listing.accepted ? (
                            <View style={styles.acceptedBanner}>
                                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                                <Text style={styles.acceptedText}>
                                    {lang === 'tl' ? 'Tinanggap na' : 'Accepted'}
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.actionRow}>
                                <Button
                                    title={t('acceptBid')}
                                    icon="checkmark"
                                    size="medium"
                                    onPress={() => handleAccept(listing.id)}
                                    style={{ flex: 1, marginRight: spacing.sm }}
                                />
                                <Button
                                    title={t('rejectBid')}
                                    icon="close"
                                    variant="outline"
                                    size="medium"
                                    style={{ flex: 1 }}
                                    onPress={() => setListings((prev) => prev.filter((l) => l.id !== listing.id))}
                                />
                            </View>
                        )}
                    </Card>
                ))}

                {filtered.length === 0 && (
                    <Card>
                        <View style={styles.emptyState}>
                            <Ionicons name="storefront-outline" size={48} color={colors.textMuted} />
                            <Text style={styles.emptyText}>
                                {lang === 'tl' ? 'Walang listahan' : 'No listings found'}
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

    title: { ...typography.h2, color: colors.textPrimary },
    subtitle: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.md },

    filterRow: { marginBottom: spacing.lg, flexGrow: 0 },
    filterChip: {
        paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full,
        backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, marginRight: spacing.sm,
        minHeight: 40, justifyContent: 'center',
    },
    filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    filterText: { ...typography.caption, color: colors.textPrimary, fontWeight: '600' },
    filterTextActive: { color: colors.white },

    listingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
    bidsBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.accentLight + '30', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.full },
    bidsText: { ...typography.small, color: colors.accent, marginLeft: 4, fontWeight: '600' },

    listingDetails: { marginBottom: spacing.md },
    detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
    detailText: { ...typography.caption, color: colors.textSecondary, marginLeft: spacing.sm },

    priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: spacing.md, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
    quantity: { ...typography.bodyBold, color: colors.textPrimary },
    pricePerKg: { ...typography.caption, color: colors.textMuted },
    totalPrice: { fontSize: 24, fontWeight: '800', color: colors.primary },

    actionRow: { flexDirection: 'row' },

    acceptedCard: { borderLeftWidth: 3, borderLeftColor: colors.success },
    acceptedBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.sm, backgroundColor: colors.success + '10', borderRadius: borderRadius.sm },
    acceptedText: { ...typography.bodyBold, color: colors.success, marginLeft: spacing.sm },

    emptyState: { alignItems: 'center', paddingVertical: spacing.xl },
    emptyText: { ...typography.body, color: colors.textMuted, marginTop: spacing.sm },
});
