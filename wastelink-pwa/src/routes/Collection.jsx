import React, { useState, useEffect } from 'react';
import { savePickup, getPendingPickups, markSynced } from '../indexeddb';

const Collection = () => {
    const [material, setMaterial] = useState('PET');
    const [weight, setWeight] = useState('');
    const [pending, setPending] = useState([]);
    const [syncing, setSyncing] = useState(false);
    const [status, setStatus] = useState('');

    useEffect(() => {
        loadPending();
    }, []);

    const loadPending = async () => {
        const data = await getPendingPickups();
        setPending(data);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!weight) return;

        await savePickup({ material, weight: parseFloat(weight) });
        setWeight('');
        setStatus('✅ Pickup saved offline!');
        loadPending();
        setTimeout(() => setStatus(''), 3000);
    };

    const handleSync = async () => {
        if (pending.length === 0) return;
        setSyncing(true);

        // Simulate API call
        setTimeout(async () => {
            for (const item of pending) {
                await markSynced(item.id);
            }
            setSyncing(false);
            setStatus('🚀 All data synced with server!');
            loadPending();
            setTimeout(() => setStatus(''), 5000);
        }, 2000);
    };

    return (
        <div className="collection">
            <h1>New Collection</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Log your recyclable pickups here.</p>

            <form className="card" onSubmit={handleSave}>
                <div className="form-group">
                    <label>Material Type</label>
                    <select value={material} onChange={(e) => setMaterial(e.target.value)}>
                        <option value="PET">🧴 Plastic (PET)</option>
                        <option value="HDPE">🧴 Rigid Plastic (HDPE)</option>
                        <option value="METAL">🥫 Metal / Cans</option>
                        <option value="PAPER">📄 Paper / Cardboard</option>
                        <option value="GLASS">🧪 Glass Bottles</option>
                        <option value="ORGANIC">🍃 Organic Waste</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Estimated Weight (kg)</label>
                    <input
                        type="number"
                        step="0.1"
                        placeholder="0.0"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                    />
                </div>

                <button type="submit" className="btn btn-primary">Save Pickup</button>
                {status && <div className="status-msg">{status}</div>}
            </form>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h2 style={{ fontSize: '18px', margin: 0 }}>Pending Sync ({pending.length})</h2>
                {pending.length > 0 && (
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--primary-dark)',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        {syncing ? 'Syncing...' : 'Sync Now'}
                    </button>
                )}
            </div>

            {pending.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    No pending data. Everything is synced!
                </div>
            ) : (
                pending.map(item => (
                    <div key={item.id} className="card" style={{ padding: '12px 16px', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: '600' }}>{item.material}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(item.createdAt).toLocaleTimeString()}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: '700' }}>{item.weight} kg</div>
                                <span className="badge badge-pending">Pending</span>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default Collection;
