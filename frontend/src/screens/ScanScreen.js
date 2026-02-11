import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import Button from '../components/Button';
import MaterialBadge from '../components/MaterialBadge';
import { useLanguage } from '../context/LanguageContext';
import { useOffline } from '../context/OfflineContext';
import { classifyImage, PRICES_PER_KG } from '../services/ai';
import { speak } from '../services/voice';

export default function ScanScreen({ navigation }) {
    const { t, lang } = useLanguage();
    const { localAdd } = useOffline();
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState(null);
    const [saving, setSaving] = useState(false);
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        speak(t('pointCamera'), lang);
    }, []);

    // Pulse animation for scan button
    useEffect(() => {
        if (!result) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
                ])
            ).start();
        }
    }, [result]);

    const handleScan = async () => {
        setScanning(true);
        setResult(null);
        speak(t('analyzing'), lang);

        // Simulate camera capture + TF.js inference
        setTimeout(async () => {
            const classification = await classifyImage('camera://capture');
            setResult(classification);
            setScanning(false);
            speak(
                `${classification.materialType}. ${classification.confidence}% ${t('confidence')}. ` +
                `${lang === 'tl' ? 'Tinatayang presyo' : 'Estimated price'}: ${classification.estimatedPrice} pesos.`,
                lang
            );
        }, 2000);
    };

    const handleSaveResult = async () => {
        if (!result) return;
        setSaving(true);
        try {
            await localAdd('collections', {
                materialType: result.materialType,
                weightKg: result.estimatedWeight,
                confidence: result.confidence,
                priceEstimate: result.estimatedPrice,
                source: 'ai_scan',
                timestamp: new Date().toISOString(),
            });
            speak(lang === 'tl' ? 'Na-save na!' : 'Saved!', lang);
            setResult(null);
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Camera Preview Area */}
            <View style={styles.cameraArea}>
                <View style={styles.cameraPlaceholder}>
                    {scanning ? (
                        <View style={styles.scanningOverlay}>
                            <ActivityIndicator size="large" color={colors.white} />
                            <Text style={styles.scanningText}>{t('analyzing')}</Text>
                            <View style={styles.scanLine} />
                        </View>
                    ) : (
                        <>
                            <Ionicons name="camera" size={64} color="rgba(255,255,255,0.5)" />
                            <Text style={styles.cameraHint}>{t('pointCamera')}</Text>
                        </>
                    )}
                </View>

                {/* Corner guides */}
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />
            </View>

            {/* Scan Button */}
            {!result && !scanning && (
                <View style={styles.scanBtnContainer}>
                    <Animated.View style={[styles.scanPulse, { transform: [{ scale: pulseAnim }] }]} />
                    <TouchableOpacity style={styles.scanBtn} onPress={handleScan}>
                        <Ionicons name="scan" size={36} color={colors.white} />
                    </TouchableOpacity>
                </View>
            )}

            {/* Result Panel */}
            {result && (
                <View style={styles.resultPanel}>
                    <View style={styles.resultHeader}>
                        <MaterialBadge type={result.materialType} size="large" />
                        <View style={styles.confidenceBadge}>
                            <Text style={styles.confidenceText}>{result.confidence}%</Text>
                        </View>
                    </View>

                    <View style={styles.resultGrid}>
                        <View style={styles.resultItem}>
                            <Ionicons name="scale-outline" size={24} color={colors.primary} />
                            <Text style={styles.resultLabel}>{t('estimatedWeight')}</Text>
                            <Text style={styles.resultValue}>{result.estimatedWeight} kg</Text>
                        </View>
                        <View style={styles.resultDivider} />
                        <View style={styles.resultItem}>
                            <Ionicons name="cash-outline" size={24} color={colors.success} />
                            <Text style={styles.resultLabel}>{t('estimatedPrice')}</Text>
                            <Text style={styles.resultValue}>₱{result.estimatedPrice}</Text>
                        </View>
                        <View style={styles.resultDivider} />
                        <View style={styles.resultItem}>
                            <Ionicons name="pricetag-outline" size={24} color={colors.secondary} />
                            <Text style={styles.resultLabel}>{t('pricePerKg')}</Text>
                            <Text style={styles.resultValue}>₱{result.pricePerKg}/kg</Text>
                        </View>
                    </View>

                    {/* All predictions */}
                    <View style={styles.allPredictions}>
                        {result.allPredictions
                            .sort((a, b) => b.probability - a.probability)
                            .map((p) => (
                                <View key={p.label} style={styles.predRow}>
                                    <MaterialBadge type={p.label} size="small" />
                                    <View style={styles.predBar}>
                                        <View
                                            style={[
                                                styles.predFill,
                                                { width: `${p.probability * 100}%` },
                                            ]}
                                        />
                                    </View>
                                    <Text style={styles.predPercent}>{(p.probability * 100).toFixed(0)}%</Text>
                                </View>
                            ))}
                    </View>

                    <View style={styles.resultActions}>
                        <Button
                            title={t('save')}
                            icon="checkmark-circle"
                            onPress={handleSaveResult}
                            loading={saving}
                            style={{ flex: 1, marginRight: spacing.sm }}
                        />
                        <Button
                            title={t('retry')}
                            icon="refresh"
                            variant="outline"
                            onPress={() => { setResult(null); handleScan(); }}
                            style={{ flex: 1 }}
                        />
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#111' },

    cameraArea: {
        flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative',
    },
    cameraPlaceholder: {
        width: '85%', aspectRatio: 3 / 4, backgroundColor: '#222',
        borderRadius: borderRadius.lg, alignItems: 'center', justifyContent: 'center',
    },
    cameraHint: { ...typography.body, color: 'rgba(255,255,255,0.6)', marginTop: spacing.md },

    corner: { position: 'absolute', width: 32, height: 32, borderColor: colors.primary, borderWidth: 3 },
    cornerTL: { top: '12%', left: '8%', borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 12 },
    cornerTR: { top: '12%', right: '8%', borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 12 },
    cornerBL: { bottom: '25%', left: '8%', borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 12 },
    cornerBR: { bottom: '25%', right: '8%', borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 12 },

    scanningOverlay: { alignItems: 'center' },
    scanningText: { ...typography.bodyBold, color: colors.white, marginTop: spacing.md },

    scanBtnContainer: { position: 'absolute', bottom: 48, alignSelf: 'center' },
    scanPulse: {
        position: 'absolute', width: 80, height: 80, borderRadius: 40,
        backgroundColor: colors.primary + '33', alignSelf: 'center',
        top: -4, left: -4,
    },
    scanBtn: {
        width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primary,
        alignItems: 'center', justifyContent: 'center', ...shadows.lg,
    },

    resultPanel: {
        backgroundColor: colors.white, borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl, padding: spacing.lg, paddingBottom: spacing.xxl,
        ...shadows.lg, maxHeight: '55%',
    },
    resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
    confidenceBadge: {
        backgroundColor: colors.success + '15', paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
    },
    confidenceText: { ...typography.bodyBold, color: colors.success },

    resultGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.lg },
    resultItem: { flex: 1, alignItems: 'center' },
    resultDivider: { width: 1, backgroundColor: colors.border },
    resultLabel: { ...typography.small, color: colors.textMuted, marginTop: spacing.xs, textAlign: 'center' },
    resultValue: { ...typography.h3, color: colors.textPrimary, marginTop: 2 },

    allPredictions: { marginBottom: spacing.lg },
    predRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
    predBar: { flex: 1, height: 6, backgroundColor: colors.bg, borderRadius: 3, marginHorizontal: spacing.sm },
    predFill: { height: 6, backgroundColor: colors.primary, borderRadius: 3 },
    predPercent: { ...typography.small, color: colors.textMuted, width: 36, textAlign: 'right' },

    resultActions: { flexDirection: 'row' },
});
