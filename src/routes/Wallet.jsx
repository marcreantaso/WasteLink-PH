import React, { useState, useEffect } from 'react';
import { getAllTransactions, getBalance, saveTransaction } from '../indexeddb';

const Wallet = () => {
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [grossEarnings, setGrossEarnings] = useState(0);
    const [totalCommission, setTotalCommission] = useState(0);

    useEffect(() => { loadWallet(); }, []);

    const loadWallet = async () => {
        const bal = await getBalance();
        setBalance(bal);

        const all = await getAllTransactions();
        setTransactions(all.reverse());

        const gross = all.filter(t => t.type === 'SALE').reduce((s, t) => s + (t.gross || t.amount), 0);
        const comm = all.filter(t => t.type === 'COMMISSION').reduce((s, t) => s + t.amount, 0);
        setGrossEarnings(gross);
        setTotalCommission(comm);
    };

    const handleWithdraw = async () => {
        if (balance <= 0) return;
        const amount = balance;
        await saveTransaction({
            type: 'WITHDRAWAL',
            amount: amount,
            method: 'GCash',
        });
        loadWallet();
    };

    const txIcons = { SALE: '💰', COMMISSION: '📊', WITHDRAWAL: '📤' };
    const txColors = { SALE: '#10b981', COMMISSION: '#f59e0b', WITHDRAWAL: '#ef4444' };

    return (
        <div>
            <h1>My Wallet</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '14px' }}>
                Real earnings from marketplace sales.
            </p>

            {/* Balance Card */}
            <div style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                borderRadius: '24px', padding: '28px', marginBottom: '20px',
                color: 'white', position: 'relative', overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute', top: '-30px', right: '-30px',
                    width: '120px', height: '120px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)'
                }} />
                <div style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.85 }}>
                    Available Balance
                </div>
                <div style={{ fontSize: '40px', fontWeight: '900', margin: '8px 0' }}>
                    ₱{balance.toFixed(2)}
                </div>

                <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                        <span style={{ opacity: 0.85 }}>Gross Earnings</span>
                        <span style={{ fontWeight: '600' }}>₱{grossEarnings.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span style={{ opacity: 0.85 }}>Platform Fee (5%)</span>
                        <span style={{ fontWeight: '600' }}>-₱{totalCommission.toFixed(2)}</span>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px' }}>
                    <a href="https://m.gcash.com" target="_blank" rel="noopener noreferrer" style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'white', color: '#059669', borderRadius: '14px', padding: '14px',
                        textDecoration: 'none', fontWeight: '700', fontSize: '14px'
                    }}>GCash</a>
                    <a href="https://www.maya.ph" target="_blank" rel="noopener noreferrer" style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(255,255,255,0.2)', color: 'white', borderRadius: '14px', padding: '14px',
                        textDecoration: 'none', fontWeight: '700', fontSize: '14px', border: '1px solid rgba(255,255,255,0.3)'
                    }}>Maya</a>
                </div>
            </div>

            {/* Transaction History */}
            <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>Transaction History</h2>

            {transactions.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: '32px', color: 'var(--text-muted)',
                    background: 'var(--card-bg)', borderRadius: '20px', border: '1px solid var(--border)'
                }}>
                    No transactions yet. Sell materials on the Marketplace to earn!
                </div>
            ) : (
                transactions.map(tx => (
                    <div key={tx.id} style={{
                        background: 'var(--card-bg)', borderRadius: '14px', padding: '14px 18px',
                        marginBottom: '8px', border: '1px solid var(--border)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '10px',
                                background: `${txColors[tx.type]}15`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px'
                            }}>{txIcons[tx.type]}</div>
                            <div>
                                <div style={{ fontWeight: '600', fontSize: '14px', color: 'white' }}>
                                    {tx.type === 'SALE' && `Sale: ${tx.material} (${tx.weight}kg)`}
                                    {tx.type === 'COMMISSION' && 'Platform Fee'}
                                    {tx.type === 'WITHDRAWAL' && `Withdrawal (${tx.method})`}
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                    {new Date(tx.createdAt).toLocaleDateString()} • {new Date(tx.createdAt).toLocaleTimeString()}
                                    {tx.buyer && ` • ${tx.buyer}`}
                                </div>
                            </div>
                        </div>
                        <div style={{
                            fontWeight: '700', fontSize: '15px',
                            color: tx.type === 'SALE' ? '#10b981' : '#ef4444'
                        }}>
                            {tx.type === 'SALE' ? '+' : '-'}₱{tx.amount.toFixed(2)}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default Wallet;
