import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllPickups, getAllRoutes, getAllTransactions, getBalance } from '../indexeddb';

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalKg: 0, totalEarnings: 0, totalRoutes: 0,
        todayKg: 0, todayEarnings: 0, totalCommission: 0,
    });
    const [materials, setMaterials] = useState({});
    const [recentPickups, setRecentPickups] = useState([]);

    useEffect(() => { loadStats(); }, []);

    const loadStats = async () => {
        const pickups = await getAllPickups();
        const routes = await getAllRoutes();
        const transactions = await getAllTransactions();
        const balance = await getBalance();

        const today = new Date().toDateString();

        const totalKg = pickups.reduce((s, p) => s + p.weight, 0);
        const todayPickups = pickups.filter(p => new Date(p.createdAt).toDateString() === today);
        const todayKg = todayPickups.reduce((s, p) => s + p.weight, 0);

        const sales = transactions.filter(t => t.type === 'SALE');
        const totalEarnings = sales.reduce((s, t) => s + t.amount, 0);
        const todayEarnings = sales
            .filter(t => new Date(t.createdAt).toDateString() === today)
            .reduce((s, t) => s + t.amount, 0);
        const totalCommission = transactions
            .filter(t => t.type === 'COMMISSION')
            .reduce((s, t) => s + t.amount, 0);

        // Material breakdown
        const matMap = {};
        pickups.forEach(p => { matMap[p.material] = (matMap[p.material] || 0) + p.weight; });
        setMaterials(matMap);

        setStats({
            totalKg, totalEarnings, totalRoutes: routes.length,
            todayKg, todayEarnings, totalCommission, balance,
        });

        setRecentPickups(pickups.slice(-5).reverse());
    };

    const materialIcons = {
        PET: '🧴', HDPE: '🪣', METAL: '🥫', PAPER: '📄', GLASS: '🧪', ORGANIC: '🍃'
    };

    const totalMaterialKg = Object.values(materials).reduce((s, v) => s + v, 0) || 1;

    return (
        <div>
            <h1>WasteLink PH</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '14px' }}>
                Track collections, earn rewards, stay safe — even offline.
            </p>

            {/* Today's Summary */}
            <div style={{
                background: 'var(--card-bg)', backdropFilter: 'blur(12px) saturate(180%)',
                borderRadius: '20px', padding: '24px', border: '1px solid var(--border)', marginBottom: '16px'
            }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700' }}>Today's Activity</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ background: 'rgba(16,185,129,0.08)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(16,185,129,0.15)' }}>
                        <div style={{ fontSize: '28px', fontWeight: '800', color: '#10b981' }}>{stats.todayKg.toFixed(1)}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>kg collected</div>
                    </div>
                    <div style={{ background: 'rgba(16,185,129,0.08)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(16,185,129,0.15)' }}>
                        <div style={{ fontSize: '28px', fontWeight: '800', color: '#10b981' }}>₱{stats.todayEarnings.toFixed(0)}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>earned today</div>
                    </div>
                </div>
            </div>

            {/* Lifetime Stats */}
            <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '16px'
            }}>
                {[
                    { label: 'Total Kg', value: stats.totalKg.toFixed(1), icon: '♻️' },
                    { label: 'Total Earned', value: `₱${stats.totalEarnings.toFixed(0)}`, icon: '💰' },
                    { label: 'Routes', value: stats.totalRoutes, icon: '📍' },
                ].map((s, i) => (
                    <div key={i} style={{
                        background: 'var(--card-bg)', borderRadius: '16px', padding: '14px',
                        border: '1px solid var(--border)', textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '20px', marginBottom: '4px' }}>{s.icon}</div>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: 'white' }}>{s.value}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Material Breakdown */}
            {Object.keys(materials).length > 0 && (
                <div style={{
                    background: 'var(--card-bg)', borderRadius: '20px', padding: '20px',
                    border: '1px solid var(--border)', marginBottom: '16px'
                }}>
                    <h3 style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: '700' }}>Material Breakdown</h3>
                    {Object.entries(materials).sort((a, b) => b[1] - a[1]).map(([mat, kg]) => (
                        <div key={mat} style={{ marginBottom: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                                <span style={{ color: 'white', fontWeight: '600' }}>{materialIcons[mat] || '♻️'} {mat}</span>
                                <span style={{ color: 'var(--text-muted)' }}>{kg.toFixed(1)} kg ({Math.round(kg / totalMaterialKg * 100)}%)</span>
                            </div>
                            <div style={{ width: '100%', height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.05)' }}>
                                <div style={{
                                    width: `${(kg / totalMaterialKg * 100)}%`, height: '100%',
                                    borderRadius: '3px', background: 'linear-gradient(to right, #10b981, #34d399)',
                                    transition: 'width 0.5s ease'
                                }} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                <button onClick={() => navigate('/collection')} className="btn" style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', height: '52px', fontSize: '14px'
                }}>
                    ♻️ Start Collecting
                </button>
                <button onClick={() => navigate('/safety')} className="btn" style={{
                    background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444',
                    color: '#ef4444', height: '52px', fontSize: '14px'
                }}>
                    🚨 Report Hazard
                </button>
            </div>

            {/* Recent Pickups */}
            {recentPickups.length > 0 && (
                <div style={{
                    background: 'var(--card-bg)', borderRadius: '20px', padding: '20px',
                    border: '1px solid var(--border)'
                }}>
                    <h3 style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: '700' }}>Recent Pickups</h3>
                    {recentPickups.map(p => (
                        <div key={p.id} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '8px 0', borderBottom: '1px solid var(--border)'
                        }}>
                            <span style={{ fontSize: '13px', color: 'white' }}>
                                {materialIcons[p.material] || '♻️'} {p.material}
                            </span>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: '#10b981' }}>{p.weight} kg</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
