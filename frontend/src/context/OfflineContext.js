import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Platform, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SYNC_QUEUE_KEY = 'wastelink_sync_queue';
const LOCAL_DB_PREFIX = 'wastelink_db_';

const OfflineContext = createContext();

export function OfflineProvider({ children }) {
    const [isOnline, setIsOnline] = useState(true);
    const [syncQueue, setSyncQueue] = useState([]);
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSyncAt, setLastSyncAt] = useState(null);

    // Monitor network status
    useEffect(() => {
        if (Platform.OS === 'web') {
            const handleOnline = () => setIsOnline(true);
            const handleOffline = () => setIsOnline(false);
            window.addEventListener('online', handleOnline);
            window.addEventListener('offline', handleOffline);
            setIsOnline(navigator.onLine);
            return () => {
                window.removeEventListener('online', handleOnline);
                window.removeEventListener('offline', handleOffline);
            };
        }
    }, []);

    // Load sync queue
    useEffect(() => {
        loadSyncQueue();
    }, []);

    // Auto-sync when coming online
    useEffect(() => {
        if (isOnline && syncQueue.length > 0 && !isSyncing) {
            syncNow();
        }
    }, [isOnline]);

    const loadSyncQueue = async () => {
        try {
            const raw = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
            if (raw) setSyncQueue(JSON.parse(raw));
        } catch (e) {
            console.error('Failed to load sync queue:', e);
        }
    };

    // Add item to sync queue (called when offline)
    const queueAction = useCallback(async (action) => {
        const entry = {
            id: `sq_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            ...action,
            timestamp: Date.now(),
            retries: 0,
        };
        const updated = [...syncQueue, entry];
        setSyncQueue(updated);
        await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(updated));
        return entry;
    }, [syncQueue]);

    // Sync all queued actions
    const syncNow = useCallback(async () => {
        if (isSyncing || syncQueue.length === 0) return;
        setIsSyncing(true);

        const remaining = [];
        for (const item of syncQueue) {
            try {
                // In production, this calls the API
                // For now, mark as synced after simulated delay
                console.log(`[Sync] Processing: ${item.type}`, item.id);
                // TODO: Replace with actual API calls
                // await api.sync(item);
            } catch (e) {
                if (item.retries < 3) {
                    remaining.push({ ...item, retries: item.retries + 1 });
                } else {
                    console.error(`[Sync] Dropped after 3 retries:`, item.id);
                }
            }
        }

        setSyncQueue(remaining);
        await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(remaining));
        setLastSyncAt(new Date().toISOString());
        setIsSyncing(false);
    }, [isSyncing, syncQueue]);

    // Local CRUD operations
    const localGet = useCallback(async (collection) => {
        try {
            const raw = await AsyncStorage.getItem(`${LOCAL_DB_PREFIX}${collection}`);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }, []);

    const localSave = useCallback(async (collection, data) => {
        await AsyncStorage.setItem(`${LOCAL_DB_PREFIX}${collection}`, JSON.stringify(data));
    }, []);

    const localAdd = useCallback(async (collection, item) => {
        const existing = await localGet(collection);
        const newItem = {
            ...item,
            _id: item._id || `local_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            _createdAt: new Date().toISOString(),
            _synced: false,
        };
        existing.push(newItem);
        await localSave(collection, existing);

        // Queue for sync
        await queueAction({
            type: 'CREATE',
            collection,
            data: newItem,
        });

        return newItem;
    }, [localGet, localSave, queueAction]);

    const localUpdate = useCallback(async (collection, id, updates) => {
        const existing = await localGet(collection);
        const idx = existing.findIndex((i) => i._id === id);
        if (idx !== -1) {
            existing[idx] = { ...existing[idx], ...updates, _synced: false, _updatedAt: new Date().toISOString() };
            await localSave(collection, existing);
            await queueAction({
                type: 'UPDATE',
                collection,
                data: { _id: id, ...updates },
            });
        }
        return existing[idx];
    }, [localGet, localSave, queueAction]);

    const localDelete = useCallback(async (collection, id) => {
        const existing = await localGet(collection);
        const filtered = existing.filter((i) => i._id !== id);
        await localSave(collection, filtered);
        await queueAction({
            type: 'DELETE',
            collection,
            data: { _id: id },
        });
    }, [localGet, localSave, queueAction]);

    return (
        <OfflineContext.Provider
            value={{
                isOnline,
                syncQueue,
                isSyncing,
                lastSyncAt,
                pendingCount: syncQueue.length,
                queueAction,
                syncNow,
                localGet,
                localSave,
                localAdd,
                localUpdate,
                localDelete,
            }}
        >
            {children}
        </OfflineContext.Provider>
    );
}

export const useOffline = () => useContext(OfflineContext);
