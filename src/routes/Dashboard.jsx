import React from 'react';

const Dashboard = () => {
    return (
        <div className="dashboard">
            <h1>WasteLink PH</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
                Tackling waste together. Track your collections and earn rewards, even offline.
            </p>

            <div className="card">
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700' }}>Today's Summary</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary)' }}>12.5 kg</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Collected</div>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--success)' }}>₱185.00</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Earnings</div>
                    </div>
                </div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid var(--primary)', background: 'rgba(16, 185, 129, 0.1)' }}>
                <p style={{ margin: 0, fontWeight: '600', color: 'var(--primary)' }}>
                    Tech Tip: Offline logging enabled. Your data syncs automatically when online.
                </p>
            </div>

            <div className="card">
                <h3 style={{ margin: '0 0 12px 0' }}>Recent Sync</h3>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>
                    Last synced: Today, 10:45 AM
                </p>
            </div>
        </div>
    );
};

export default Dashboard;
