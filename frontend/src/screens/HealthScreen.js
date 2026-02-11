import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import Card from '../components/Card';
import Button from '../components/Button';
import { useLanguage } from '../context/LanguageContext';
import { useOffline } from '../context/OfflineContext';
import { speak } from '../services/voice';

const INCIDENT_TYPES = [
    { key: 'cuts', icon: 'bandage-outline', color: colors.danger },
    { key: 'fumes', icon: 'cloud-outline', color: colors.warning },
    { key: 'heat', icon: 'sunny-outline', color: colors.secondary },
    { key: 'chemical', icon: 'flask-outline', color: '#9C27B0' },
];

const SEVERITY_LEVELS = [
    { key: 'low', label: 'Low', labelTl: 'Mababa', color: colors.success },
    { key: 'medium', label: 'Medium', labelTl: 'Katamtaman', color: colors.warning },
    { key: 'high', label: 'High', labelTl: 'Mataas', color: colors.danger },
    { key: 'critical', label: 'Critical', labelTl: 'Kritikal', color: '#B71C1C' },
];

export default function HealthScreen({ navigation }) {
    const { t, lang } = useLanguage();
    const { localGet, localAdd } = useOffline();
    const [incidents, setIncidents] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [selectedType, setSelectedType] = useState('');
    const [severity, setSeverity] = useState('');
    const [description, setDescription] = useState('');
    const [saving, setSaving] = useState(false);
    const [alertSent, setAlertSent] = useState(false);

    useEffect(() => {
        loadIncidents();
    }, []);

    const loadIncidents = async () => {
        const data = await localGet('health_incidents');
        setIncidents(data.reverse());
    };

    const handleSave = async () => {
        if (!selectedType || !severity) {
            Alert.alert(t('error'), lang === 'tl' ? 'Piliin ang uri at kalubhaan' : 'Select type and severity');
            return;
        }
        setSaving(true);
        try {
            const incident = await localAdd('health_incidents', {
                type: selectedType,
                severity,
                description,
                timestamp: new Date().toISOString(),
                alerted: severity === 'critical',
            });

            if (severity === 'critical') {
                // Auto-alert for critical incidents
                setAlertSent(true);
                speak(t('emergencyAlert'), lang);
                setTimeout(() => setAlertSent(false), 5000);
            }

            setShowForm(false);
            setSelectedType('');
            setSeverity('');
            setDescription('');
            await loadIncidents();
        } catch (e) {
            Alert.alert(t('error'), e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleEmergencyAlert = () => {
        Alert.alert(
            lang === 'tl' ? 'Padala ng Emergency Alert?' : 'Send Emergency Alert?',
            lang === 'tl'
                ? 'Ipapadala ang alerto sa pinakamalapit na klinika at barangay hall.'
                : 'This will alert the nearest clinic and barangay hall via SMS.',
            [
                { text: t('cancel'), style: 'cancel' },
                {
                    text: t('confirm'),
                    style: 'destructive',
                    onPress: () => {
                        setAlertSent(true);
                        speak(t('emergencyAlert'), lang);
                        setTimeout(() => setAlertSent(false), 5000);
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <Text style={styles.title}>{t('health')}</Text>

                {/* Emergency Alert Sent Banner */}
                {alertSent && (
                    <View style={styles.alertBanner}>
                        <Ionicons name="alert-circle" size={28} color={colors.white} />
                        <Text style={styles.alertText}>{t('emergencyAlert')}</Text>
                    </View>
                )}

                {/* Emergency Button */}
                <TouchableOpacity style={styles.emergencyBtn} onPress={handleEmergencyAlert}>
                    <View style={styles.emergencyIconBg}>
                        <Ionicons name="warning" size={32} color={colors.danger} />
                    </View>
                    <View style={styles.emergencyInfo}>
                        <Text style={styles.emergencyTitle}>{t('alertClinic')}</Text>
                        <Text style={styles.emergencySubtitle}>
                            {lang === 'tl' ? 'I-tap para sa agarang tulong' : 'Tap for immediate help'}
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color={colors.danger} />
                </TouchableOpacity>

                {/* Log Incident Button */}
                <Button
                    title={showForm ? t('cancel') : t('logIncident')}
                    icon={showForm ? 'close' : 'add-circle'}
                    variant={showForm ? 'outline' : 'secondary'}
                    onPress={() => setShowForm(!showForm)}
                    style={styles.logBtn}
                />

                {/* Incident Form */}
                {showForm && (
                    <Card style={styles.formCard}>
                        <Text style={styles.formTitle}>{t('logIncident')}</Text>

                        {/* Type Selection */}
                        <Text style={styles.label}>{t('incidentType')}</Text>
                        <View style={styles.typeGrid}>
                            {INCIDENT_TYPES.map((type) => (
                                <TouchableOpacity
                                    key={type.key}
                                    style={[
                                        styles.typeBtn,
                                        selectedType === type.key && { borderColor: type.color, backgroundColor: type.color + '10' },
                                    ]}
                                    onPress={() => setSelectedType(type.key)}
                                >
                                    <Ionicons name={type.icon} size={28} color={selectedType === type.key ? type.color : colors.textMuted} />
                                    <Text style={[styles.typeLabel, selectedType === type.key && { color: type.color, fontWeight: '700' }]}>
                                        {t(type.key)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Severity */}
                        <Text style={styles.label}>
                            {lang === 'tl' ? 'Kalubhaan' : 'Severity'}
                        </Text>
                        <View style={styles.severityRow}>
                            {SEVERITY_LEVELS.map((s) => (
                                <TouchableOpacity
                                    key={s.key}
                                    style={[
                                        styles.severityBtn,
                                        severity === s.key && { backgroundColor: s.color, borderColor: s.color },
                                    ]}
                                    onPress={() => setSeverity(s.key)}
                                >
                                    <Text style={[styles.severityText, severity === s.key && { color: colors.white }]}>
                                        {lang === 'tl' ? s.labelTl : s.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Description */}
                        <TextInput
                            style={[styles.input, styles.descInput]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder={lang === 'tl' ? 'Ilarawan ang insidente...' : 'Describe the incident...'}
                            placeholderTextColor={colors.textMuted}
                            multiline
                        />

                        <Button title={t('save')} icon="checkmark" onPress={handleSave} loading={saving} />
                    </Card>
                )}

                {/* Incident History */}
                <Text style={styles.sectionTitle}>
                    {lang === 'tl' ? 'Mga Naitala' : 'Logged Incidents'} ({incidents.length})
                </Text>
                {incidents.map((inc, i) => {
                    const typeConfig = INCIDENT_TYPES.find((it) => it.key === inc.type) || INCIDENT_TYPES[0];
                    const sevConfig = SEVERITY_LEVELS.find((s) => s.key === inc.severity) || SEVERITY_LEVELS[0];
                    return (
                        <Card key={inc._id || i}>
                            <View style={styles.incidentRow}>
                                <View style={[styles.incidentIcon, { backgroundColor: typeConfig.color + '15' }]}>
                                    <Ionicons name={typeConfig.icon} size={22} color={typeConfig.color} />
                                </View>
                                <View style={styles.incidentInfo}>
                                    <Text style={styles.incidentType}>{t(inc.type)}</Text>
                                    <Text style={styles.incidentTime}>
                                        {new Date(inc.timestamp).toLocaleString(lang === 'tl' ? 'fil-PH' : 'en-US')}
                                    </Text>
                                </View>
                                <View style={[styles.severityTag, { backgroundColor: sevConfig.color + '15' }]}>
                                    <Text style={[styles.severityTagText, { color: sevConfig.color }]}>
                                        {lang === 'tl' ? sevConfig.labelTl : sevConfig.label}
                                    </Text>
                                </View>
                            </View>
                            {inc.description ? (
                                <Text style={styles.incidentDesc}>{inc.description}</Text>
                            ) : null}
                            {inc.alerted && (
                                <View style={styles.alertedTag}>
                                    <Ionicons name="notifications" size={14} color={colors.danger} />
                                    <Text style={styles.alertedText}>
                                        {lang === 'tl' ? 'Na-alert na ang klinika' : 'Clinic alerted'}
                                    </Text>
                                </View>
                            )}
                        </Card>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    scroll: { padding: spacing.md, paddingBottom: spacing.xxl },

    title: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.lg },

    alertBanner: {
        backgroundColor: colors.danger, borderRadius: borderRadius.md, padding: spacing.md,
        flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg,
    },
    alertText: { ...typography.bodyBold, color: colors.white, marginLeft: spacing.md, flex: 1 },

    emergencyBtn: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white,
        borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.md,
        borderWidth: 2, borderColor: colors.danger + '40', ...shadows.md,
    },
    emergencyIconBg: {
        width: 56, height: 56, borderRadius: 28, backgroundColor: colors.danger + '10',
        alignItems: 'center', justifyContent: 'center',
    },
    emergencyInfo: { flex: 1, marginLeft: spacing.md },
    emergencyTitle: { ...typography.bodyBold, color: colors.danger },
    emergencySubtitle: { ...typography.small, color: colors.textMuted },

    logBtn: { marginBottom: spacing.lg },

    formCard: { borderColor: colors.secondary, borderWidth: 1 },
    formTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.md },
    label: { ...typography.bodyBold, color: colors.textPrimary, marginBottom: spacing.sm },

    typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
    typeBtn: {
        width: '48%', paddingVertical: spacing.md, borderRadius: borderRadius.md,
        borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', backgroundColor: colors.white,
        minHeight: 80, justifyContent: 'center',
    },
    typeLabel: { ...typography.caption, color: colors.textPrimary, marginTop: spacing.xs },

    severityRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
    severityBtn: {
        flex: 1, paddingVertical: spacing.sm, borderRadius: borderRadius.md,
        borderWidth: 1.5, borderColor: colors.border, alignItems: 'center',
        backgroundColor: colors.white, minHeight: 44, justifyContent: 'center',
    },
    severityText: { ...typography.caption, color: colors.textPrimary, fontWeight: '600' },

    input: {
        backgroundColor: colors.white, borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md, paddingVertical: 14, marginBottom: spacing.md,
        ...typography.body, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border,
    },
    descInput: { minHeight: 80, textAlignVertical: 'top' },

    sectionTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.md, marginTop: spacing.sm },

    incidentRow: { flexDirection: 'row', alignItems: 'center' },
    incidentIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    incidentInfo: { flex: 1, marginLeft: spacing.md },
    incidentType: { ...typography.bodyBold, color: colors.textPrimary },
    incidentTime: { ...typography.small, color: colors.textMuted },
    severityTag: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.full },
    severityTagText: { ...typography.small, fontWeight: '700' },

    incidentDesc: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.sm },
    alertedTag: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
    alertedText: { ...typography.small, color: colors.danger, marginLeft: spacing.xs, fontWeight: '600' },
});
