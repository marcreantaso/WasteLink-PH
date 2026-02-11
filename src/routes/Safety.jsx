import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveSafetyReport, getAllSafetyReports } from '../indexeddb';

const INCIDENT_TYPES = [
    { value: 'HAZARD', label: '☣️ Hazardous Waste', desc: 'Chemicals, medical waste, toxic materials' },
    { value: 'INJURY', label: '🤕 Injury / Accident', desc: 'Cuts, falls, or physical harm' },
    { value: 'SHARPS', label: '💉 Sharp Objects', desc: 'Glass shards, needles, metal edges' },
    { value: 'HARASSMENT', label: '🛑 Harassment', desc: 'Threats, conflicts, or unsafe encounters' },
];

// Reverse geocode using OpenStreetMap Nominatim (free, no API key)
async function reverseGeocode(lat, lng) {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        if (data && data.address) {
            const a = data.address;
            // Build a readable location string
            const parts = [];
            if (a.road) parts.push(a.road);
            if (a.suburb || a.neighbourhood || a.village) parts.push(a.suburb || a.neighbourhood || a.village);
            if (a.city || a.town || a.municipality) parts.push(a.city || a.town || a.municipality);
            if (a.state || a.region) parts.push(a.state || a.region);
            return parts.length > 0 ? parts.join(', ') : data.display_name?.split(',').slice(0, 3).join(',');
        }
        return null;
    } catch {
        return null;
    }
}

const Safety = () => {
    const navigate = useNavigate();
    const [type, setType] = useState('HAZARD');
    const [desc, setDesc] = useState('');
    const [location, setLocation] = useState(null);
    const [locationName, setLocationName] = useState(null);
    const [locating, setLocating] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState('');
    const [reports, setReports] = useState([]);

    useEffect(() => {
        loadReports();
        captureLocation();
    }, []);

    const loadReports = async () => {
        const all = await getAllSafetyReports();
        setReports(all.reverse().slice(0, 10));
    };

    const captureLocation = () => {
        if (!('geolocation' in navigator)) return;
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setLocation(coords);
                setLocating(false);

                // Get human-readable location name
                const name = await reverseGeocode(coords.lat, coords.lng);
                if (name) setLocationName(name);
            },
            () => setLocating(false),
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!desc.trim()) return;

        setSubmitting(true);
        await saveSafetyReport({
            type,
            description: desc,
            location: location,
            locationName: locationName,
            status: 'REPORTED',
        });

        setSubmitting(false);
        setStatus('✅ Report submitted successfully!');
        setDesc('');
        loadReports();
        setTimeout(() => setStatus(''), 3000);
    };

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <button onClick={() => navigate(-1)} style={{
                    background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                    color: 'white', width: '40px', height: '40px', borderRadius: '14px',
                    fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>←</button>
                <div>
                    <h1 style={{ margin: 0, fontSize: '24px' }}>Health & Safety</h1>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '13px' }}>Report incidents for LGU compliance</p>
                </div>
            </div>

            {/* Emergency Hotlines */}
            <div style={{
                background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: '20px', padding: '20px', marginBottom: '20px'
            }}>
                <h3 style={{ margin: '0 0 12px', color: '#ef4444', fontSize: '15px', fontWeight: '700' }}>🚨 Emergency Hotlines</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <a href="tel:911" style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        background: '#ef4444', color: 'white', borderRadius: '14px', padding: '14px',
                        textDecoration: 'none', fontWeight: '700', fontSize: '14px'
                    }}>🚑 911</a>
                    <a href="tel:117" style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        background: '#ef4444', color: 'white', borderRadius: '14px', padding: '14px',
                        textDecoration: 'none', fontWeight: '700', fontSize: '14px'
                    }}>👮 PNP 117</a>
                </div>
            </div>

            {/* Report Form */}
            <form onSubmit={handleSubmit} style={{
                background: 'var(--card-bg)', backdropFilter: 'blur(12px) saturate(180%)',
                borderRadius: '20px', padding: '24px', border: '1px solid var(--border)', marginBottom: '20px'
            }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700' }}>📋 Report Incident</h3>

                {/* GPS Location */}
                <div style={{
                    marginBottom: '16px', padding: '14px 16px', borderRadius: '14px',
                    background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '10px',
                            background: 'rgba(16,185,129,0.15)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0
                        }}>📍</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            {locating ? (
                                <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Detecting location...</div>
                            ) : location ? (
                                <>
                                    <div style={{ color: 'white', fontWeight: '600', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {locationName || 'Resolving address...'}
                                    </div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>
                                        {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                                    </div>
                                </>
                            ) : (
                                <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Location unavailable</div>
                            )}
                        </div>
                        {!locating && (
                            <button type="button" onClick={captureLocation} style={{
                                background: 'rgba(16,185,129,0.15)', border: 'none', color: '#10b981',
                                borderRadius: '8px', padding: '6px 10px', fontSize: '11px',
                                fontWeight: '600', cursor: 'pointer', flexShrink: 0
                            }}>Refresh</button>
                        )}
                    </div>
                </div>

                {/* Incident Type */}
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                        Incident Type
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {INCIDENT_TYPES.map(t => (
                            <button key={t.value} type="button" onClick={() => setType(t.value)} style={{
                                background: type === t.value ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.03)',
                                border: type === t.value ? '1px solid #10b981' : '1px solid var(--border)',
                                borderRadius: '14px', padding: '12px', cursor: 'pointer', textAlign: 'left', color: 'white'
                            }}>
                                <div style={{ fontSize: '14px', fontWeight: '600' }}>{t.label}</div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>{t.desc}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Description */}
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                        Description & Location Details
                    </label>
                    <textarea
                        rows="3" value={desc} onChange={(e) => setDesc(e.target.value)}
                        placeholder="Describe the incident and exact location..."
                        style={{
                            width: '100%', padding: '12px 16px', borderRadius: '14px',
                            background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                            color: 'white', fontSize: '14px', resize: 'vertical', fontFamily: 'inherit'
                        }}
                    />
                </div>

                <button type="submit" disabled={!desc.trim() || submitting} className="btn" style={{
                    background: desc.trim() ? '#ef4444' : 'rgba(255,255,255,0.1)',
                    color: 'white', height: '52px'
                }}>
                    {submitting ? 'Submitting...' : 'Submit Report'}
                </button>

                {status && (
                    <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '14px', color: '#10b981', fontWeight: '600' }}>
                        {status}
                    </div>
                )}
            </form>

            {/* Report History */}
            {reports.length > 0 && (
                <>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>Recent Reports</h3>
                    {reports.map(r => (
                        <div key={r.id} style={{
                            background: 'var(--card-bg)', borderRadius: '14px', padding: '14px 18px',
                            marginBottom: '8px', border: '1px solid var(--border)',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontWeight: '600', fontSize: '14px', color: 'white' }}>
                                    {INCIDENT_TYPES.find(t => t.value === r.type)?.label || r.type}
                                </div>
                                <span style={{
                                    padding: '4px 10px', borderRadius: '99px', fontSize: '11px',
                                    fontWeight: '600', background: '#064e3b', color: '#34d399'
                                }}>
                                    {r.status}
                                </span>
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                {new Date(r.createdAt).toLocaleDateString()} • {new Date(r.createdAt).toLocaleTimeString()}
                                {r.locationName && ` • 📍 ${r.locationName}`}
                            </div>
                        </div>
                    ))}
                </>
            )}
        </div>
    );
};

export default Safety;
