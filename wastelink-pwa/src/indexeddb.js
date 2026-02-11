import { openDB } from 'idb';

const DB_NAME = 'wastelink-db';
const STORE_NAME = 'pickups';

export async function initDB() {
    return openDB(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
        },
    });
}

export async function savePickup(pickup) {
    const db = await initDB();
    return db.add(STORE_NAME, {
        ...pickup,
        createdAt: new Date().toISOString(),
        synced: false,
    });
}

export async function getPendingPickups() {
    const db = await initDB();
    const all = await db.getAll(STORE_NAME);
    return all.filter(p => !p.synced);
}

export async function getAllPickups() {
    const db = await initDB();
    return db.getAll(STORE_NAME);
}

export async function markSynced(id) {
    const db = await initDB();
    const pickup = await db.get(STORE_NAME, id);
    if (pickup) {
        pickup.synced = true;
        return db.put(STORE_NAME, pickup);
    }
}
