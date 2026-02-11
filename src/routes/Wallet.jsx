import React from 'react';

const Wallet = () => {
    return (
        <div className="wallet">
            <h1>My Wallet</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Manage your earnings and payouts.</p>

            <div className="card" style={{ textAlign: 'center', background: 'var(--primary)', color: 'white' }}>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>Current Balance</div>
                <div style={{ fontSize: '42px', fontWeight: '800', margin: '8px 0' }}>₱1,240.50</div>
                <button className="btn" style={{ background: 'white', color: 'var(--primary)', marginTop: '16px' }}>
                    Withdraw via GCash
                </button>
            </div>

            <h2 style={{ fontSize: '18px', margin: '24px 0 12px 0' }}>Recent Transactions</h2>

            <div className="card" style={{ padding: '12px 16px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontWeight: '600' }}>Sale: Plastic PET</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Feb 11, 2026</div>
                    </div>
                    <div style={{ color: 'var(--success)', fontWeight: '700' }}>+₱150.00</div>
                </div>
            </div>

            <div className="card" style={{ padding: '12px 16px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontWeight: '600' }}>Withdrawal</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Feb 10, 2026</div>
                    </div>
                    <div style={{ color: '#ef4444', fontWeight: '700' }}>-₱500.00</div>
                </div>
            </div>

            <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', marginTop: '24px' }}>
                Maya and Bank Transfer integrations coming soon.
            </p>
        </div>
    );
};

export default Wallet;
