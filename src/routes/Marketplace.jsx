import React from 'react';

const buyers = [
    { id: 1, name: "EcoJunk Santa Rosa", material: "Plastic (PET)", price: "₱15.00/kg", icon: "🧴" },
    { id: 2, name: "MetalRecycle PH", material: "Metal / Cans", price: "₱25.00/kg", icon: "🥫" },
    { id: 3, name: "Green Earth Paper", material: "Paper / Cardboard", price: "₱8.00/kg", icon: "📄" },
];

const Marketplace = () => {
    return (
        <div className="marketplace">
            <h1>Marketplace</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Find the best prices for your materials.</p>

            {buyers.map(buyer => (
                <div key={buyer.id} className="card">
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px' }}>
                        <div style={{ fontSize: '32px', background: 'rgba(16, 185, 129, 0.15)', width: '64px', height: '64px', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {buyer.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '800', fontSize: '18px', color: 'white' }}>{buyer.name}</div>
                            <div style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '16px' }}>{buyer.price}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{buyer.material}</div>
                        </div>
                    </div>
                    <button className="btn btn-outline" style={{ height: '48px', borderRadius: '16px', fontSize: '14px' }}>Offer Pickup</button>
                </div>
            ))}
        </div>
    );
};

export default Marketplace;
