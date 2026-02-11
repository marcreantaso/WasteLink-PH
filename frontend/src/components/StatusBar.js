import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { useOffline } from '../../context/OfflineContext';
import { useLanguage } from '../../context/LanguageContext';

export default function StatusBar() {
    const { isOnline, pendingCount, isSyncing, syncNow } = useOffline();
    const { t } = useLanguage();

    if (isOnline && pendingCount === 0) return null;

    return (
        <View style={[styles.bar, isOnline ? styles.syncingBar : styles.offlineBar]}>
            <View style={styles.left}>
                <Ionicons
                    name={isOnline ? 'cloud-upload-outline' : 'cloud-offline-outline'}
                    size={18}
                    color={colors.white}
                />
                <Text style={styles.text}>
                    {isSyncing
                        ? t('syncing')
                        : isOnline
                            ? `${pendingCount} ${t('pendingSync')}`
                            : t('offline')}
                </Text>
            </View>
            {isOnline && pendingCount > 0 && !isSyncing && (
                <TouchableOpacity onPress={syncNow} style={styles.syncBtn}>
                    <Text style={styles.syncText}>{t('retry')}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    bar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },
    offlineBar: {
        backgroundColor: colors.danger,
    },
    syncingBar: {
        backgroundColor: colors.secondary,
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    text: {
        ...typography.caption,
        color: colors.white,
        marginLeft: spacing.sm,
        fontWeight: '600',
    },
    syncBtn: {
        backgroundColor: 'rgba(255,255,255,0.25)',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    syncText: {
        ...typography.small,
        color: colors.white,
        fontWeight: '700',
    },
});
