import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';

// Context Providers
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { OfflineProvider } from './src/context/OfflineContext';
import { LanguageProvider, useLanguage } from './src/context/LanguageContext';

// Screens
import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import CollectionScreen from './src/screens/CollectionScreen';
import ScanScreen from './src/screens/ScanScreen';
import MarketplaceScreen from './src/screens/MarketplaceScreen';
import EarningsScreen from './src/screens/EarningsScreen';
import HealthScreen from './src/screens/HealthScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// Theme
import { colors, typography, spacing, borderRadius } from './src/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ─── Tab Navigator (Main App) ───
function MainTabs() {
    const { t } = useLanguage();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    const icons = {
                        Home: focused ? 'home' : 'home-outline',
                        Scan: focused ? 'scan-circle' : 'scan-circle-outline',
                        Market: focused ? 'storefront' : 'storefront-outline',
                        Earnings: focused ? 'wallet' : 'wallet-outline',
                        Profile: focused ? 'person-circle' : 'person-circle-outline',
                    };
                    return <Ionicons name={icons[route.name]} size={route.name === 'Scan' ? 32 : 26} color={color} />;
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarStyle: styles.tabBar,
                tabBarLabelStyle: styles.tabLabel,
                tabBarItemStyle: styles.tabItem,
                headerShown: false,
            })}
        >
            <Tab.Screen name="Home" component={HomeStack} options={{ tabBarLabel: t('tabHome') }} />
            <Tab.Screen name="Market" component={MarketplaceScreen} options={{ tabBarLabel: t('tabMarket') }} />
            <Tab.Screen
                name="Scan"
                component={ScanScreen}
                options={{
                    tabBarLabel: t('tabScan'),
                    tabBarItemStyle: styles.scanTabItem,
                }}
            />
            <Tab.Screen name="Earnings" component={EarningsScreen} options={{ tabBarLabel: t('tabEarnings') }} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: t('tabProfile') }} />
        </Tab.Navigator>
    );
}

// ─── Home Stack (for nested navigation) ───
function HomeStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="HomeMain" component={HomeScreen} />
            <Stack.Screen name="Collection" component={CollectionScreen} />
            <Stack.Screen name="Health" component={HealthScreen} />
        </Stack.Navigator>
    );
}

// ─── Root Navigator ───
function RootNavigator() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={styles.loadingScreen}>
                <View style={styles.loadingLogo}>
                    <Ionicons name="leaf" size={64} color={colors.primary} />
                </View>
                <Text style={styles.loadingTitle}>WasteLink PH</Text>
                <Text style={styles.loadingSubtitle}>Loading...</Text>
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {isAuthenticated ? (
                    <Stack.Screen name="Main" component={MainTabs} />
                ) : (
                    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

// ─── App Root ───
export default function App() {
    return (
        <LanguageProvider>
            <AuthProvider>
                <OfflineProvider>
                    <StatusBar style="dark" />
                    <RootNavigator />
                </OfflineProvider>
            </AuthProvider>
        </LanguageProvider>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        height: 70,
        paddingBottom: 8,
        paddingTop: 8,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    tabLabel: {
        fontSize: 11,
        fontWeight: '600',
    },
    tabItem: {
        minHeight: 52,
    },
    scanTabItem: {
        marginTop: -12,
    },
    loadingScreen: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.bg,
    },
    loadingLogo: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: colors.primaryBg,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    loadingTitle: {
        ...typography.h1,
        color: colors.primary,
        marginBottom: spacing.xs,
    },
    loadingSubtitle: {
        ...typography.body,
        color: colors.textMuted,
    },
});
