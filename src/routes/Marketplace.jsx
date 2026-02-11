import React, { useState, useEffect } from 'react';
import { getAllPickups, saveTransaction } from '../indexeddb';

const COMMISSION_RATE = 0.05; // 5% platform fee

const BASE_PRICES = {
    PET: 15, HDPE: 12, METAL: 25, PAPER: 8, GLASS: 3.5, ORGANIC: 2,
};

const BUYERS = [
    { id: 1, name: 'EcoJunk Santa Rosa', materials: ['PET', 'HDPE'], icon: '🧴', rating: 4.8 },
    { id: 2, name: 'MetalRecycle PH', materials: ['METAL'], icon: '🥫', rating: 4.6 },
    { id: 3, name: 'Green Earth Paper', materials: ['PAPER'], icon: '📄', rating: 4.9 },
    { id: 4, name: 'Glass4Good', materials: ['GLASS'], icon: '🧪', rating: 4.3 },
    { id: 5, name: 'BioCompost Co.', materials: ['ORGANIC'], icon: '🍃', rating: 4.5 },
];

function calculateDynamicPrice(baseMaterial, totalSupply) {
    const base = BASE_PRICES[baseMaterial] || 10;
    // More supply = slight price decrease, less supply = price increase
    const supplyFactor = Math.max(0.8, Math.min(1.3, 1 - (totalSupply / 200)));
    return parseFloat((base * supplyFactor).toFixed(2));
}

const Marketplace = () => {
    const [prices, setPrices] = useState({});
    const [supply, setSupply] = useState({});
    const [selling, setSelling] = useState(null);
    const [sellWeight, setSellWeight] = useState('');
    const [status, setStatus] = useState('');

    useEffect(() => {
        loadMarketData();
    }, []);

    const loadMarketData = async () => {
        const pickups = await getAllPickups();

        // Calculate real supply from actual pickups
        const materialTotals = {};
        pickups.forEach(p => {
            materialTotals[p.material] = (materialTotals[p.material] || 0) + p.weight;
        });
        setSupply(materialTotals);

        // Calculate dynamic prices based on real supply
        const dynamicPrices = {};
        Object.keys(BASE_PRICES).forEach(mat => {
            dynamicPrices[mat] = calculateDynamicPrice(mat, materialTotals[mat] || 0);
        });
        setPrices(dynamicPrices);
    };

    const handleSell = async (buyer) => {
        const weight = parseFloat(sellWeight);
        if (!weight || weight <= 0) return;

        const material = buyer.materials[0];
        const pricePerKg = prices[material] || BASE_PRICES[material];
        const gross = weight * pricePerKg;
        const commission = parseFloat((gross * COMMISSION_RATE).toFixed(2));
        const net = parseFloat((gross - commission).toFixed(2));

        // Save SALE transaction
        await saveTransaction({
            type: 'SALE',
            amount: net,
            gross: gross,
            material: material,
            weight: weight,
            buyer: buyer.name,
            pricePerKg: pricePerKg,
        });

        // Save COMMISSION transaction
        await saveTransaction({
            type: 'COMMISSION',
            amount: commission,
            reference: `5% on ₱${gross.toFixed(2)}`,
        });

        setStatus(`✅ Sold ${weight}kg ${material} → ₱${net.toFixed(2)} (after 5% fee)`);
        setSelling(null);
        setSellWeight('');
        loadMarketData(); // Refresh prices after selling
        setTimeout(() => setStatus(''), 5000);
    };

    return (
        <div>
            <h1>Marketplace</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '14px' }}>
                Real-time prices based on your collection data. 5% platform fee on sales.
            </p>

            {status && (
                <div style={{
                    background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
                    borderRadius: '14px', padding: '14px', marginBottom: '16px', textAlign: 'center',
                    color: '#10b981', fontWeight: '600', fontSize: '14px'
                }}>{status}</div>
            )}

            {BUYERS.map(buyer => {
                const mat = buyer.materials[0];
                const price = prices[mat] || BASE_PRICES[mat];
                const totalSupply = supply[mat] || 0;
                const basePrice = BASE_PRICES[mat];
                const trend = price > basePrice ? 'up' : price < basePrice ? 'down' : 'same';

                return (
                    <div key={buyer.id} style={{
                        background: 'var(--card-bg)', backdropFilter: 'blur(12px) saturate(180%)',
                        borderRadius: '20px', padding: '20px', border: '1px solid var(--border)',
                        marginBottom: '14px'
                    }}>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                            <div style={{
                                fontSize: '28px', width: '56px', height: '56px', borderRadius: '16px',
                                background: 'rgba(16,185,129,0.1)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center'
                            }}>{buyer.icon}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: '700', fontSize: '16px', color: 'white' }}>{buyer.name}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                    <span style={{ color: '#10b981', fontWeight: '800', fontSize: '20px' }}>
                                        ₱{price.toFixed(2)}
                                    </span>
                                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>/kg</span>
                                    <span style={{
                                        fontSize: '13px',
                                        color: trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : 'var(--text-muted)'
                                    }}>
                                        {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '—'}
                                    </span>
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                    {buyer.materials.join(', ')} • ⭐ {buyer.rating} • Supply: {totalSupply.toFixed(1)}kg
                                </div>
                            </div>
                        </div>

                        {selling === buyer.id ? (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="number" step="0.1" min="0.1" placeholder="kg"
                                    value={sellWeight}
                                    onChange={(e) => setSellWeight(e.target.value)}
                                    style={{
                                        flex: 1, padding: '12px 16px', borderRadius: '14px',
                                        background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                                        color: 'white', fontSize: '15px'
                                    }}
                                    autoFocus
                                />
                                <button onClick={() => handleSell(buyer)} className="btn" style={{
                                    width: 'auto', padding: '0 24px', height: '48px',
                                    background: '#10b981', color: 'white', fontSize: '14px'
                                }}>Sell</button>
                                <button onClick={() => { setSelling(null); setSellWeight(''); }} style={{
                                    background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                                    color: 'white', borderRadius: '14px', width: '48px', cursor: 'pointer', fontSize: '16px'
                                }}>✕</button>
                            </div>
                        ) : (
                            <button onClick={() => setSelling(buyer.id)} className="btn" style={{
                                background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981',
                                color: '#10b981', height: '48px', fontSize: '14px'
                            }}>
                                Sell Now
                            </button>
                        )}

                        {sellWeight && selling === buyer.id && parseFloat(sellWeight) > 0 && (
                            <div style={{
                                marginTop: '10px', fontSize: '12px', color: 'var(--text-muted)',
                                display: 'flex', justifyContent: 'space-between', padding: '0 4px'
                            }}>
                                <span>Gross: ₱{(parseFloat(sellWeight) * price).toFixed(2)}</span>
                                <span>Fee: -₱{(parseFloat(sellWeight) * price * COMMISSION_RATE).toFixed(2)}</span>
                                <span style={{ color: '#10b981', fontWeight: '700' }}>
                                    Net: ₱{(parseFloat(sellWeight) * price * (1 - COMMISSION_RATE)).toFixed(2)}
                                </span>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default Marketplace;
