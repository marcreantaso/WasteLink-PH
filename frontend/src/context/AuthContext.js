import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_KEY = 'wastelink_auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Load saved auth on boot
    useEffect(() => {
        loadAuth();
    }, []);

    const loadAuth = async () => {
        try {
            const saved = await AsyncStorage.getItem(AUTH_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                setUser(parsed.user);
                setIsAuthenticated(true);
            }
        } catch (e) {
            console.error('Auth load error:', e);
        } finally {
            setIsLoading(false);
        }
    };

    const login = useCallback(async (userData, token) => {
        const authData = { user: userData, token };
        await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(authData));
        setUser(userData);
        setIsAuthenticated(true);
    }, []);

    const logout = useCallback(async () => {
        await AsyncStorage.removeItem(AUTH_KEY);
        setUser(null);
        setIsAuthenticated(false);
    }, []);

    const getToken = useCallback(async () => {
        try {
            const saved = await AsyncStorage.getItem(AUTH_KEY);
            if (saved) {
                return JSON.parse(saved).token;
            }
        } catch (e) {
            return null;
        }
        return null;
    }, []);

    const register = useCallback(async (registrationData) => {
        // Offline-first: store locally, sync later
        const offlineUser = {
            id: `offline_${Date.now()}`,
            ...registrationData,
            createdAt: new Date().toISOString(),
            synced: false,
        };
        await login(offlineUser, `offline_token_${Date.now()}`);
        // Queue for sync
        const queue = JSON.parse((await AsyncStorage.getItem('wastelink_sync_queue')) || '[]');
        queue.push({ type: 'REGISTER', data: registrationData, timestamp: Date.now() });
        await AsyncStorage.setItem('wastelink_sync_queue', JSON.stringify(queue));
        return offlineUser;
    }, [login]);

    return (
        <AuthContext.Provider
            value={{ user, isLoading, isAuthenticated, login, logout, register, getToken }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
