import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import Button from '../components/Button';
import Card from '../components/Card';
import MaterialBadge from '../components/MaterialBadge';
import { useLanguage } from '../context/LanguageContext';
import { useOffline } from '../context/OfflineContext';

const MATERIALS = ['PET', 'HDPE', 'METAL', 'PAPER', 'ORGANIC', 'OTHER'];

export default function CollectionScreen({ navigation }) {
    const { t, lang } = useLanguage();
    const { localGet, localAdd } = useOffline();
    const [collections, setCollections] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [material, setMaterial] = useState('');
    const [weight, setWeight] = useState('');
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadCollections();
    }, []);

    const loadCollections = async () => {
        const data = await localGet('collections');
        setCollections(data.reverse());
    };

    const handleSave = async () => {
        if (!material || !weight) {
            Alert.alert(t('error'), lang === 'tl' ? 'Piliin ang materyales at timbang' : 'Select material and weight');
            return;
        }
        setSaving(true);
        try {
            await localAdd('collections', {
                materialType: material,
                weightKg: parseFloat(weight),
                notes,
                gpsLat: 14.314 + Math.random() * 0.01, // Santa Rosa area
                gpsLng: 121.111 + Math.random() * 0.01,
                timestamp: new Date().toISOString(),
            });
            setShowForm(false);
            setMaterial('');
            setWeight('');
            setNotes('');
            await loadCollections();
        } catch (e) {
            Alert.alert(t('error'), e.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>{t('collections')}</Text>
                    <Button
                        title={showForm ? t('cancel') : t('newCollection')}
                        icon={showForm ? 'close' : 'add-circle'}
                        variant={showForm ? 'outline' : 'primary'}
                        size="medium"
                        onPress={() => setShowForm(!showForm)}
                    />
                </View>

                {/* New Collection Form */}
                {showForm && (
                    <Card style={styles.formCard}>
                        <Text style={styles.formTitle}>{t('logPickup')}</Text>

                        {/* Material Selection */}
                        <Text style={styles.label}>{t('materialType')}</Text>
                        <View style={styles.materialGrid}>
                            {MATERIALS.map((m) => (
                                <TouchableOpacity
                                    key={m}
                                    style={[styles.materialBtn, material === m && styles.materialBtnActive]}
                                    onPress={() => setMaterial(m)}
                                >
                                    <MaterialBadge type={m} size="small" showLabel={false} />
                                    <Text style={[styles.materialLabel, material === m && styles.materialLabelActive]}>
                                        {t(m.toLowerCase())}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Weight */}
                        <Text style={styles.label}>{t('weight')}</Text>
                        <TextInput
                            style={styles.input}
                            value={weight}
                            onChangeText={setWeight}
                            keyboardType="decimal-pad"
                            placeholder="0.0"
                            placeholderTextColor={colors.textMuted}
                        />

                        {/* Notes */}
                        <TextInput
                            style={[styles.input, styles.notesInput]}
                            value={notes}
                            onChangeText={setNotes}
                            placeholder={lang === 'tl' ? 'Mga tala (opsyonal)' : 'Notes (optional)'}
                            placeholderTextColor={colors.textMuted}
                            multiline
                        />

                        <Button title={t('save')} icon="checkmark" onPress={handleSave} loading={saving} />
                    </Card>
                )}

                {/* Map Placeholder */}
                <Card title={t('myRoute')} icon="map-outline" iconColor={colors.accent}>
                    <View style={styles.mapPlaceholder}>
                        <Ionicons name="map" size={48} color={colors.textMuted} />
                        <Text style={styles.mapText}>{t('viewMap')}</Text>
                        <Text style={styles.mapSubtext}>Santa Rosa, Laguna</Text>
                    </View>
                </Card>

                {/* Collection History */}
                <Text style={styles.sectionTitle}>
                    {lang === 'tl' ? 'Kasaysayan' : 'History'} ({collections.length})
                </Text>
                {collections.length === 0 ? (
                    <Card>
                        <View style={styles.emptyState}>
                            <Ionicons name="cube-outline" size={48} color={colors.textMuted} />
                            <Text style={styles.emptyText}>
                                {lang === 'tl' ? 'Wala pang koleksyon' : 'No collections yet'}
                            </Text>
                        </View>
                    </Card>
                ) : (
                    collections.map((c, i) => (
                        <Card key={c._id || i}>
                            <View style={styles.collectionRow}>
                                <MaterialBadge type={c.materialType} size="small" />
                                <View style={styles.collectionInfo}>
                                    <Text style={styles.collectionWeight}>{c.weightKg} kg</Text>
                                    <Text style={styles.collectionTime}>
                                        {new Date(c.timestamp).toLocaleString(lang === 'tl' ? 'fil-PH' : 'en-US')}
                                    </Text>
                                </View>
                                <View style={styles.syncBadge}>
                                    <Ionicons
                                        name={c._synced ? 'cloud-done' : 'cloud-upload-outline'}
                                        size={16}
                                        color={c._synced ? colors.success : colors.warning}
                                    />
                                </View>
                            </View>
                        </Card>
                    ))
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    scroll: { padding: spacing.md, paddingBottom: spacing.xxl },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
    title: { ...typography.h2, color: colors.textPrimary },

    formCard: { borderColor: colors.primary, borderWidth: 1 },
    formTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.md },
    label: { ...typography.bodyBold, color: colors.textPrimary, marginBottom: spacing.sm },

    materialGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
    materialBtn: {
        paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.md,
        borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.white,
        flexDirection: 'row', alignItems: 'center', minHeight: 44,
    },
    materialBtnActive: { borderColor: colors.primary, backgroundColor: colors.primaryBg },
    materialLabel: { ...typography.caption, color: colors.textPrimary, marginLeft: spacing.xs },
    materialLabelActive: { color: colors.primary, fontWeight: '700' },

    input: {
        backgroundColor: colors.white, borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md, paddingVertical: 14, marginBottom: spacing.md,
        ...typography.body, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border,
    },
    notesInput: { minHeight: 80, textAlignVertical: 'top' },

    mapPlaceholder: {
        height: 160, backgroundColor: colors.bg, borderRadius: borderRadius.md,
        alignItems: 'center', justifyContent: 'center',
    },
    mapText: { ...typography.bodyBold, color: colors.textMuted, marginTop: spacing.sm },
    mapSubtext: { ...typography.caption, color: colors.textMuted },

    sectionTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.md, marginTop: spacing.sm },

    emptyState: { alignItems: 'center', paddingVertical: spacing.xl },
    emptyText: { ...typography.body, color: colors.textMuted, marginTop: spacing.sm },

    collectionRow: { flexDirection: 'row', alignItems: 'center' },
    collectionInfo: { flex: 1, marginLeft: spacing.md },
    collectionWeight: { ...typography.bodyBold, color: colors.textPrimary },
    collectionTime: { ...typography.small, color: colors.textMuted },
    syncBadge: { padding: spacing.xs },
});
