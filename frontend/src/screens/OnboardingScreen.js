import React, { useState, useRef } from 'react';
import {
    View, Text, StyleSheet, Image, TouchableOpacity, TextInput, ScrollView,
    KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import Button from '../components/Button';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { speak } from '../services/voice';

const BARANGAYS = [
    'Aplaya', 'Balibago', 'Caingin', 'Dila', 'Dita',
    'Don Jose', 'Ibaba', 'Kanluran', 'Labas', 'Macabling',
    'Malitlit', 'Malusak', 'Market Area', 'Pook', 'Pulong Santa Cruz',
    'Santo Domingo', 'Sinalhan', 'Tagapo', 'Poblacion',
];

export default function OnboardingScreen({ navigation }) {
    const { t, lang } = useLanguage();
    const { register } = useAuth();
    const [step, setStep] = useState(1);
    const [photoUri, setPhotoUri] = useState(null);
    const [selectedBarangay, setSelectedBarangay] = useState('');
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    const handleNext = () => {
        if (step < 3) {
            setStep(step + 1);
            const prompts = {
                2: t('onboardStep2'),
                3: t('onboardStep3'),
            };
            speak(prompts[step + 1], lang);
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleComplete = async () => {
        if (pin !== confirmPin) {
            Alert.alert(t('error'), t('pinMismatch'));
            return;
        }
        if (pin.length !== 4) {
            Alert.alert(t('error'), 'PIN must be 4 digits');
            return;
        }
        setLoading(true);
        try {
            await register({
                name: name || 'Waste Worker',
                phone,
                photoId: photoUri,
                barangay: selectedBarangay,
                pin,
            });
            speak(lang === 'tl' ? 'Matagumpay! Maligayang pagdating.' : 'Success! Welcome to WasteLink.', lang);
        } catch (e) {
            Alert.alert(t('error'), e.message);
        } finally {
            setLoading(false);
        }
    };

    const takePhoto = () => {
        // Simulate photo capture for MVP
        setPhotoUri('photo_captured');
        speak(lang === 'tl' ? 'Nakuha na ang litrato.' : 'Photo captured.', lang);
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={styles.scroll}>
                {/* Progress */}
                <View style={styles.progress}>
                    {[1, 2, 3].map((s) => (
                        <View key={s} style={styles.progressRow}>
                            <View style={[styles.dot, step >= s && styles.dotActive]}>
                                {step > s ? (
                                    <Ionicons name="checkmark" size={16} color={colors.white} />
                                ) : (
                                    <Text style={[styles.dotText, step >= s && styles.dotTextActive]}>{s}</Text>
                                )}
                            </View>
                            {s < 3 && <View style={[styles.line, step > s && styles.lineActive]} />}
                        </View>
                    ))}
                </View>

                {/* Step 1: Photo ID */}
                {step === 1 && (
                    <View style={styles.stepContent}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="camera" size={48} color={colors.primary} />
                        </View>
                        <Text style={styles.stepTitle}>{t('onboardStep1')}</Text>

                        <TextInput
                            style={styles.input}
                            placeholder={lang === 'tl' ? 'Pangalan' : 'Full Name'}
                            value={name}
                            onChangeText={setName}
                            placeholderTextColor={colors.textMuted}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder={lang === 'tl' ? 'Numero ng Telepono' : 'Phone Number'}
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            placeholderTextColor={colors.textMuted}
                        />

                        <TouchableOpacity style={styles.photoArea} onPress={takePhoto}>
                            {photoUri ? (
                                <View style={styles.photoCaptured}>
                                    <Ionicons name="checkmark-circle" size={48} color={colors.success} />
                                    <Text style={styles.photoText}>
                                        {lang === 'tl' ? 'Nakuha na ang litrato ✓' : 'Photo captured ✓'}
                                    </Text>
                                </View>
                            ) : (
                                <>
                                    <Ionicons name="camera-outline" size={48} color={colors.textMuted} />
                                    <Text style={styles.photoPlaceholder}>{t('takePhoto')}</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                )}

                {/* Step 2: Barangay Selection */}
                {step === 2 && (
                    <View style={styles.stepContent}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="location" size={48} color={colors.primary} />
                        </View>
                        <Text style={styles.stepTitle}>{t('onboardStep2')}</Text>
                        <Text style={styles.subtitle}>Santa Rosa, Laguna</Text>

                        <View style={styles.barangayGrid}>
                            {BARANGAYS.map((b) => (
                                <TouchableOpacity
                                    key={b}
                                    style={[
                                        styles.barangayChip,
                                        selectedBarangay === b && styles.barangayChipActive,
                                    ]}
                                    onPress={() => {
                                        setSelectedBarangay(b);
                                        speak(b, lang);
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.barangayText,
                                            selectedBarangay === b && styles.barangayTextActive,
                                        ]}
                                    >
                                        {b}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {/* Step 3: PIN Setup */}
                {step === 3 && (
                    <View style={styles.stepContent}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="lock-closed" size={48} color={colors.primary} />
                        </View>
                        <Text style={styles.stepTitle}>{t('onboardStep3')}</Text>

                        <Text style={styles.inputLabel}>{t('enterPin')}</Text>
                        <TextInput
                            style={styles.pinInput}
                            value={pin}
                            onChangeText={(v) => setPin(v.replace(/[^0-9]/g, '').slice(0, 4))}
                            keyboardType="number-pad"
                            maxLength={4}
                            secureTextEntry
                            placeholder="• • • •"
                            placeholderTextColor={colors.textMuted}
                        />

                        <Text style={styles.inputLabel}>{t('confirmPin')}</Text>
                        <TextInput
                            style={styles.pinInput}
                            value={confirmPin}
                            onChangeText={(v) => setConfirmPin(v.replace(/[^0-9]/g, '').slice(0, 4))}
                            keyboardType="number-pad"
                            maxLength={4}
                            secureTextEntry
                            placeholder="• • • •"
                            placeholderTextColor={colors.textMuted}
                        />

                        {pin && confirmPin && pin !== confirmPin && (
                            <Text style={styles.errorText}>{t('pinMismatch')}</Text>
                        )}
                    </View>
                )}
            </ScrollView>

            {/* Bottom Nav */}
            <View style={styles.bottomNav}>
                {step > 1 && (
                    <Button title={t('back')} variant="outline" onPress={handleBack} style={styles.navBtn} icon="arrow-back" />
                )}
                <View style={{ flex: 1 }} />
                {step < 3 ? (
                    <Button
                        title={t('next')}
                        onPress={handleNext}
                        style={styles.navBtn}
                        icon="arrow-forward"
                        disabled={step === 1 && !photoUri}
                    />
                ) : (
                    <Button
                        title={t('done')}
                        onPress={handleComplete}
                        loading={loading}
                        style={styles.navBtn}
                        icon="checkmark-circle"
                        disabled={!pin || pin !== confirmPin}
                    />
                )}
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    scroll: { padding: spacing.lg, paddingBottom: 120 },

    progress: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: spacing.xl },
    progressRow: { flexDirection: 'row', alignItems: 'center' },
    dot: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center',
    },
    dotActive: { backgroundColor: colors.primary },
    dotText: { ...typography.bodyBold, color: colors.textMuted },
    dotTextActive: { color: colors.white },
    line: { width: 48, height: 3, backgroundColor: colors.border, marginHorizontal: spacing.xs },
    lineActive: { backgroundColor: colors.primary },

    stepContent: { alignItems: 'center' },
    iconCircle: {
        width: 96, height: 96, borderRadius: 48,
        backgroundColor: colors.primaryBg, alignItems: 'center', justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    stepTitle: { ...typography.h2, color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.sm },
    subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },

    input: {
        width: '100%', backgroundColor: colors.white, borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md, paddingVertical: 14, marginBottom: spacing.md,
        ...typography.body, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border,
    },
    inputLabel: { ...typography.bodyBold, color: colors.textPrimary, alignSelf: 'flex-start', marginBottom: spacing.sm },

    photoArea: {
        width: '100%', height: 160, borderRadius: borderRadius.lg, borderWidth: 2,
        borderColor: colors.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center',
        backgroundColor: colors.white, marginTop: spacing.sm,
    },
    photoPlaceholder: { ...typography.body, color: colors.textMuted, marginTop: spacing.sm },
    photoCaptured: { alignItems: 'center' },
    photoText: { ...typography.bodyBold, color: colors.success, marginTop: spacing.sm },

    barangayGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: spacing.sm },
    barangayChip: {
        paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full,
        backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border,
        margin: 4, minHeight: 44,
        justifyContent: 'center',
    },
    barangayChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    barangayText: { ...typography.caption, color: colors.textPrimary },
    barangayTextActive: { color: colors.white, fontWeight: '700' },

    pinInput: {
        width: '100%', backgroundColor: colors.white, borderRadius: borderRadius.md,
        paddingHorizontal: spacing.lg, paddingVertical: 16, marginBottom: spacing.lg,
        fontSize: 28, fontWeight: '700', textAlign: 'center', letterSpacing: 12,
        color: colors.textPrimary, borderWidth: 1, borderColor: colors.border,
    },
    errorText: { ...typography.caption, color: colors.danger, marginTop: -spacing.sm, marginBottom: spacing.md },

    bottomNav: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        flexDirection: 'row', padding: spacing.md,
        backgroundColor: colors.white, ...shadows.lg, borderTopWidth: 1, borderTopColor: colors.border,
    },
    navBtn: { minWidth: 120 },
});
