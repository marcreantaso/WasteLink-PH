import React from 'react';

const Dashboard = () => {
    return (
        <div className="dashboard">
            <h1>WasteLink PH</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
                Tackling waste together. Track your collections and earn rewards, even offline.
            </p>

            <div className="card">
                <h3 style={{ margin: '0 0 12px 0' }}>Today's Summary</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary-dark)' }}>12.5 kg</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Collected</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--success)' }}>₱185.00</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Est. Earnings</div>
                    </div>
                </div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
                <p style={{ margin: 0, fontWeight: '500' }}>
                    💡 Tip: You can log your pickups without internet. Use the "Collection" tab to start.
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
