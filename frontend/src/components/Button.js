import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, borderRadius, shadows, spacing } from '../theme';

export default function Button({
    title,
    onPress,
    icon,
    variant = 'primary', // primary | secondary | outline | danger
    size = 'large', // large | medium | small
    loading = false,
    disabled = false,
    style,
}) {
    const btnStyles = [
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        disabled && styles.disabled,
        style,
    ];

    const textStyles = [
        styles.text,
        styles[`text_${variant}`],
        styles[`textSize_${size}`],
    ];

    return (
        <TouchableOpacity
            style={btnStyles}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'outline' ? colors.primary : colors.white} />
            ) : (
                <View style={styles.content}>
                    {icon && (
                        <Ionicons
                            name={icon}
                            size={size === 'small' ? 18 : 22}
                            color={variant === 'outline' ? colors.primary : colors.white}
                            style={styles.icon}
                        />
                    )}
                    <Text style={textStyles}>{title}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: borderRadius.md,
        ...shadows.sm,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginRight: spacing.sm,
    },

    // Variants
    primary: {
        backgroundColor: colors.primary,
    },
    secondary: {
        backgroundColor: colors.secondary,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.primary,
    },
    danger: {
        backgroundColor: colors.danger,
    },

    // Sizes — large for low-literacy
    size_large: {
        paddingVertical: 16,
        paddingHorizontal: 28,
        minHeight: 56,
    },
    size_medium: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        minHeight: 48,
    },
    size_small: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        minHeight: 40,
    },

    disabled: {
        opacity: 0.5,
    },

    text: {
        ...typography.button,
        textAlign: 'center',
    },
    text_primary: { color: colors.white },
    text_secondary: { color: colors.white },
    text_outline: { color: colors.primary },
    text_danger: { color: colors.white },

    textSize_large: { fontSize: 18 },
    textSize_medium: { fontSize: 16 },
    textSize_small: { fontSize: 14 },
});
