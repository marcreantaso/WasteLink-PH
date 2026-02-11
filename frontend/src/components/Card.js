import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, borderRadius, shadows, spacing } from '../theme';

export default function Card({ title, icon, iconColor, children, style, headerRight }) {
    return (
        <View style={[styles.card, style]}>
            {(title || icon) && (
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        {icon && (
                            <View style={[styles.iconBg, { backgroundColor: (iconColor || colors.primary) + '15' }]}>
                                <Ionicons name={icon} size={20} color={iconColor || colors.primary} />
                            </View>
                        )}
                        {title && <Text style={styles.title}>{title}</Text>}
                    </View>
                    {headerRight && <View>{headerRight}</View>}
                </View>
            )}
            <View style={styles.body}>{children}</View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.card,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        ...shadows.md,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBg: {
        width: 36,
        height: 36,
        borderRadius: borderRadius.sm,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
    },
    title: {
        ...typography.h3,
        color: colors.textPrimary,
    },
    body: {},
});
