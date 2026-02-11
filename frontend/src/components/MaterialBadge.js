import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../theme';

const MATERIAL_CONFIG = {
    PET: { icon: 'water-outline', color: colors.pet, label: 'PET Plastic' },
    HDPE: { icon: 'cube-outline', color: colors.hdpe, label: 'HDPE Plastic' },
    METAL: { icon: 'construct-outline', color: colors.metal, label: 'Metal' },
    PAPER: { icon: 'newspaper-outline', color: colors.paper, label: 'Paper' },
    ORGANIC: { icon: 'leaf-outline', color: colors.organic, label: 'Organic' },
    OTHER: { icon: 'help-circle-outline', color: colors.other, label: 'Other' },
};

export default function MaterialBadge({ type, size = 'medium', showLabel = true }) {
    const config = MATERIAL_CONFIG[type?.toUpperCase()] || MATERIAL_CONFIG.OTHER;
    const iconSize = size === 'small' ? 16 : size === 'large' ? 28 : 22;

    return (
        <View style={[styles.badge, { backgroundColor: config.color + '15' }, styles[`badge_${size}`]]}>
            <Ionicons name={config.icon} size={iconSize} color={config.color} />
            {showLabel && (
                <Text style={[styles.label, { color: config.color }, styles[`label_${size}`]]}>
                    {config.label}
                </Text>
            )}
        </View>
    );
}

export { MATERIAL_CONFIG };

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: borderRadius.full,
        alignSelf: 'flex-start',
    },
    badge_small: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
    },
    badge_medium: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
    },
    badge_large: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
    },
    label: {
        marginLeft: spacing.xs,
        fontWeight: '600',
    },
    label_small: { fontSize: 11 },
    label_medium: { fontSize: 13 },
    label_large: { fontSize: 16 },
});
