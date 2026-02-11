import React, { useState, useEffect, useRef } from 'react';

const RouteTracker = () => {
    const [tracking, setTracking] = useState(false);
    const [coords, setCoords] = useState([]);
    const [distance, setDistance] = useState(0);
    const watchId = useRef(null);

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3; // metres
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    };

    const startTracking = () => {
        if (!('geolocation' in navigator)) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        setTracking(true);
        setCoords([]);
        setDistance(0);

        watchId.current = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setCoords(prev => {
                    if (prev.length > 0) {
                        const last = prev[prev.length - 1];
                        const dist = calculateDistance(last.lat, last.lng, latitude, longitude);
                        setDistance(d => d + dist);
                    }
                    return [...prev, { lat: latitude, lng: longitude, time: new Date() }];
                });
            },
            (error) => console.error('Error tracking', error),
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    };

    const stopTracking = () => {
        setTracking(false);
        if (watchId.current) {
            navigator.geolocation.clearWatch(watchId.current);
            watchId.current = null;
        }
        // Save route to IndexedDB here if needed
        alert(`Route finished! Total distance: ${(distance / 1000).toFixed(2)} km`);
    };

    return (
        <div className="card" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', color: 'white' }}>📍 Route Tracker</h3>
                <div style={{ fontSize: '12px', color: tracking ? 'var(--success)' : 'var(--text-muted)' }}>
                    {tracking ? '● Live Tracking' : '● Inactive'}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>
                        {(distance / 1000).toFixed(2)}
                    </div>
                    <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Kilometers</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>
                        {coords.length}
                    </div>
                    <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Waypoints</div>
                </div>
            </div>

            {!tracking ? (
                <button
                    onClick={startTracking}
                    className="btn"
                    style={{ background: 'var(--primary)', color: 'white', height: '44px' }}>
                    Start Collection Route
                </button>
            ) : (
                <button
                    onClick={stopTracking}
                    className="btn"
                    style={{ background: '#ef4444', color: 'white', height: '44px' }}>
                    Stop Tracking
                </button>
            )}
        </div>
    );
};

export default RouteTracker;
