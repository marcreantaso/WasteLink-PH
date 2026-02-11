import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Safety = () => {
    const navigate = useNavigate();
    const [type, setType] = useState('HAZARD');
    const [desc, setDesc] = useState('');
    const [status, setStatus] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus('Sending report to LGU...');

        setTimeout(() => {
            setStatus('✅ Report Sent! Stay safe.');
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        }, 1500);
    };

    return (
        <div className="safety-page" style={{ paddingBottom: '80px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '24px', marginRight: '16px' }}>←</button>
                <h1>Health & Safety</h1>
            </div>

            <div className="card" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444' }}>
                <h3 style={{ margin: '0 0 12px 0', color: '#ef4444' }}>⚠️ Emergency Hotline</h3>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn" style={{ flex: 1, background: '#ef4444', color: 'white' }}>
                        🚑 Medical (911)
                    </button>
                    <button className="btn" style={{ flex: 1, background: '#ef4444', color: 'white' }}>
                        👮 Police (117)
                    </button>
                </div>
            </div>

            <form className="card" onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
                <h3>Report Incident / Hazard</h3>

                <div className="form-group">
                    <label>Incident Type</label>
                    <select value={type} onChange={(e) => setType(e.target.value)}>
                        <option value="HAZARD">☣️ Hazardous Waste (Chemicals, Medical)</option>
                        <option value="INJURY">🤕 Injury / Accident</option>
                        <option value="SHARPS">💉 Sharp Objects (Glass, Needles)</option>
                        <option value="HARASSMENT">🛑 Harassment / Conflict</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Description (Location & Details)</label>
                    <textarea
                        rows="4"
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                        placeholder="Describe the hazard and location..."
                        style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg)', border: '1px solid var(--border)', color: 'white' }}
                    ></textarea>
                </div>

                <button type="submit" className="btn btn-primary" disabled={!desc}> Submit Report</button>

                {status && <div style={{ marginTop: '16px', color: 'var(--success)', textAlign: 'center', fontWeight: 'bold' }}>{status}</div>}
            </form>
        </div>
    );
};

export default Safety;
