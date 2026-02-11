import React, { useState, useEffect } from 'react';
import { savePickup, getPendingPickups, markSynced } from '../indexeddb';
import Scanner from '../components/Scanner';
import RouteTracker from '../components/RouteTracker';

const Collection = () => {
    const [material, setMaterial] = useState('PET');
    const [weight, setWeight] = useState('');
    const [pending, setPending] = useState([]);
    const [syncing, setSyncing] = useState(false);
    const [status, setStatus] = useState('');
    const [showScanner, setShowScanner] = useState(false);
    const [scanInfo, setScanInfo] = useState(null);

    useEffect(() => { loadPending(); }, []);

    const loadPending = async () => {
        const data = await getPendingPickups();
        setPending(data);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!weight || parseFloat(weight) <= 0) return;

        await savePickup({
            material,
            weight: parseFloat(weight),
            source: scanInfo ? 'AI_SCAN' : 'MANUAL',
        });
        setWeight('');
        setScanInfo(null);
        setStatus('✅ Pickup saved offline!');
        loadPending();
        setTimeout(() => setStatus(''), 3000);
    };

    const handleSync = async () => {
        if (pending.length === 0) return;
        setSyncing(true);
        setTimeout(async () => {
            for (const item of pending) {
                await markSynced(item.id);
            }
            setSyncing(false);
            setStatus('🚀 All data synced!');
            loadPending();
            setTimeout(() => setStatus(''), 3000);
        }, 1500);
    };

    const handleScanResult = (matchedMaterial, label, confidence) => {
        setShowScanner(false);
        if (matchedMaterial) {
            setMaterial(matchedMaterial);
            setScanInfo({ label, confidence });
            setStatus(`🤖 AI: ${label} → ${matchedMaterial} (${confidence}%)`);
        } else {
            setStatus(`🤖 Could not match — try manual selection`);
        }
        setTimeout(() => setStatus(''), 5000);
    };

    const materialIcons = {
        PET: '🧴', HDPE: '🪣', METAL: '🥫', PAPER: '📄', GLASS: '🧪', ORGANIC: '🍃'
    };

    return (
        <div>
            {showScanner && <Scanner onScan={handleScanResult} onClose={() => setShowScanner(false)} />}

            {/* GPS Route Tracker */}
            <RouteTracker />

            <h1 style={{ marginTop: '8px' }}>New Collection</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '14px' }}>
                Log recyclable pickups. Scan with AI or enter manually.
            </p>

            {/* Collection Form */}
            <form onSubmit={handleSave} style={{
                background: 'var(--card-bg)', backdropFilter: 'blur(12px) saturate(180%)',
                borderRadius: '20px', padding: '24px', border: '1px solid var(--border)', marginBottom: '20px'
            }}>
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Material Type
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <select
                            value={material}
                            onChange={(e) => { setMaterial(e.target.value); setScanInfo(null); }}
                            style={{
                                flex: 1, padding: '12px 16px', borderRadius: '14px',
                                background: '#1e293b', border: '1px solid var(--border)',
                                color: 'white', fontSize: '15px', cursor: 'pointer',
                                WebkitAppearance: 'none', appearance: 'none',
                                backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' fill=\'%2394a3b8\' viewBox=\'0 0 16 16\'%3E%3Cpath d=\'M8 11L3 6h10l-5 5z\'/%3E%3C/svg%3E")',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 14px center',
                                paddingRight: '40px'
                            }}
                        >
                            <option value="PET" style={{ background: '#1e293b', color: 'white', padding: '8px' }}>🧴 Plastic (PET)</option>
                            <option value="HDPE" style={{ background: '#1e293b', color: 'white', padding: '8px' }}>🪣 Rigid Plastic (HDPE)</option>
                            <option value="METAL" style={{ background: '#1e293b', color: 'white', padding: '8px' }}>🥫 Metal / Cans</option>
                            <option value="PAPER" style={{ background: '#1e293b', color: 'white', padding: '8px' }}>📄 Paper / Cardboard</option>
                            <option value="GLASS" style={{ background: '#1e293b', color: 'white', padding: '8px' }}>🧪 Glass Bottles</option>
                            <option value="ORGANIC" style={{ background: '#1e293b', color: 'white', padding: '8px' }}>🍃 Organic Waste</option>
                        </select>
                        <button
                            type="button"
                            onClick={() => setShowScanner(true)}
                            style={{
                                width: '52px', height: '52px', borderRadius: '14px',
                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                border: 'none', fontSize: '22px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
                            }}
                        >📷</button>
                    </div>
                    {scanInfo && (
                        <div style={{
                            marginTop: '8px', fontSize: '12px', color: '#10b981',
                            display: 'flex', alignItems: 'center', gap: '6px'
                        }}>
                            <span style={{ padding: '2px 8px', borderRadius: '99px', background: '#064e3b', color: '#34d399', fontWeight: '600' }}>
                                AI {scanInfo.confidence}%
                            </span>
                            {scanInfo.label}
                        </div>
                    )}
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Weight (kg)
                    </label>
                    <input
                        type="number" step="0.1" min="0.1" placeholder="0.0"
                        value={weight} onChange={(e) => setWeight(e.target.value)}
                        style={{
                            width: '100%', padding: '12px 16px', borderRadius: '14px',
                            background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                            color: 'white', fontSize: '15px'
                        }}
                    />
                </div>

                <button type="submit" className="btn" style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', height: '52px'
                }}>
                    Save Pickup
                </button>

                {status && (
                    <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '14px', color: '#10b981', fontWeight: '600' }}>
                        {status}
                    </div>
                )}
            </form>

            {/* Pending List */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h2 style={{ fontSize: '16px', margin: 0, fontWeight: '700' }}>Pending Sync ({pending.length})</h2>
                {pending.length > 0 && (
                    <button onClick={handleSync} disabled={syncing} style={{
                        background: 'transparent', border: 'none', color: '#10b981',
                        fontWeight: '600', cursor: 'pointer', fontSize: '14px'
                    }}>
                        {syncing ? 'Syncing...' : 'Sync Now'}
                    </button>
                )}
            </div>

            {pending.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: '32px', color: 'var(--text-muted)',
                    background: 'var(--card-bg)', borderRadius: '20px', border: '1px solid var(--border)'
                }}>
                    ✅ All synced!
                </div>
            ) : (
                pending.map(item => (
                    <div key={item.id} style={{
                        background: 'var(--card-bg)', borderRadius: '16px', padding: '16px 20px',
                        marginBottom: '10px', border: '1px solid var(--border)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '12px',
                                background: 'rgba(16,185,129,0.15)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', fontSize: '20px'
                            }}>
                                {materialIcons[item.material] || '♻️'}
                            </div>
                            <div>
                                <div style={{ fontWeight: '700', fontSize: '15px', color: 'white' }}>{item.material}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                    {new Date(item.createdAt).toLocaleTimeString()}
                                    {item.source === 'AI_SCAN' && ' • 🤖 AI'}
                                </div>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: '800', fontSize: '18px', color: '#10b981' }}>{item.weight} kg</div>
                            <span style={{ padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: '600', background: '#451a03', color: '#fbbf24' }}>
                                PENDING
                            </span>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default Collection;
