import { openDB } from 'idb';

const DB_NAME = 'wastelink-db';
const DB_VERSION = 2;

let dbPromise;

function getDB() {
    if (!dbPromise) {
        dbPromise = openDB(DB_NAME, DB_VERSION, {
            upgrade(db, oldVersion) {
                // Store 1: Pickups (collection logs)
                if (!db.objectStoreNames.contains('pickups')) {
                    db.createObjectStore('pickups', { keyPath: 'id', autoIncrement: true });
                }
                // Store 2: Routes (GPS tracks)
                if (!db.objectStoreNames.contains('routes')) {
                    db.createObjectStore('routes', { keyPath: 'id', autoIncrement: true });
                }
                // Store 3: Transactions (wallet)
                if (!db.objectStoreNames.contains('transactions')) {
                    db.createObjectStore('transactions', { keyPath: 'id', autoIncrement: true });
                }
                // Store 4: Safety (hazard/injury reports)
                if (!db.objectStoreNames.contains('safety')) {
                    db.createObjectStore('safety', { keyPath: 'id', autoIncrement: true });
                }
                // Store 5: Scans (AI history)
                if (!db.objectStoreNames.contains('scans')) {
                    db.createObjectStore('scans', { keyPath: 'id', autoIncrement: true });
                }
            },
        });
    }
    return dbPromise;
}

// ─── PICKUPS ───
export async function savePickup(pickup) {
    const db = await getDB();
    return db.add('pickups', {
        ...pickup,
        createdAt: new Date().toISOString(),
        synced: false,
    });
}

export async function getPendingPickups() {
    const db = await getDB();
    const all = await db.getAll('pickups');
    return all.filter(p => !p.synced);
}

export async function getAllPickups() {
    const db = await getDB();
    return db.getAll('pickups');
}

export async function markSynced(id) {
    const db = await getDB();
    const pickup = await db.get('pickups', id);
    if (pickup) {
        pickup.synced = true;
        return db.put('pickups', pickup);
    }
}

// ─── ROUTES ───
export async function saveRoute(route) {
    const db = await getDB();
    return db.add('routes', {
        ...route,
        createdAt: new Date().toISOString(),
    });
}

export async function getAllRoutes() {
    const db = await getDB();
    return db.getAll('routes');
}

// ─── TRANSACTIONS ───
export async function saveTransaction(tx) {
    const db = await getDB();
    return db.add('transactions', {
        ...tx,
        createdAt: new Date().toISOString(),
    });
}

export async function getAllTransactions() {
    const db = await getDB();
    return db.getAll('transactions');
}

export async function getBalance() {
    const db = await getDB();
    const all = await db.getAll('transactions');
    return all.reduce((sum, tx) => {
        if (tx.type === 'SALE') return sum + tx.amount;
        if (tx.type === 'COMMISSION') return sum - tx.amount;
        if (tx.type === 'WITHDRAWAL') return sum - tx.amount;
        return sum;
    }, 0);
}

// ─── SAFETY ───
export async function saveSafetyReport(report) {
    const db = await getDB();
    return db.add('safety', {
        ...report,
        createdAt: new Date().toISOString(),
    });
}

export async function getAllSafetyReports() {
    const db = await getDB();
    return db.getAll('safety');
}

// ─── SCANS ───
export async function saveScan(scan) {
    const db = await getDB();
    return db.add('scans', {
        ...scan,
        createdAt: new Date().toISOString(),
    });
}

export async function getAllScans() {
    const db = await getDB();
    return db.getAll('scans');
}
