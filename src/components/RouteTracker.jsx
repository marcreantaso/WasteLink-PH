import React, { useState, useRef, useEffect } from 'react';
import { saveRoute } from '../indexeddb';

// Haversine formula — real distance between two GPS coordinates
function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const toRad = (d) => d * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDuration(ms) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    if (h > 0) return `${h}h ${m % 60}m`;
    if (m > 0) return `${m}m ${s % 60}s`;
    return `${s}s`;
}

const RouteTracker = ({ onRouteUpdate }) => {
    const [tracking, setTracking] = useState(false);
    const [distance, setDistance] = useState(0);
    const [waypointCount, setWaypointCount] = useState(0);
    const [startTime, setStartTime] = useState(null);
    const [elapsed, setElapsed] = useState(0);
    const [error, setError] = useState(null);
    const [currentPos, setCurrentPos] = useState(null);

    const watchIdRef = useRef(null);
    const coordsRef = useRef([]);
    const timerRef = useRef(null);

    // Elapsed time ticker
    useEffect(() => {
        if (tracking && startTime) {
            timerRef.current = setInterval(() => {
                setElapsed(Date.now() - startTime);
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [tracking, startTime]);

    const startTracking = () => {
        if (!('geolocation' in navigator)) {
            setError('GPS not available on this device');
            return;
        }

        setTracking(true);
        setDistance(0);
        setWaypointCount(0);
        setError(null);
        coordsRef.current = [];
        const now = Date.now();
        setStartTime(now);
        setElapsed(0);

        watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude, longitude, accuracy } = pos.coords;
                const point = { lat: latitude, lng: longitude, accuracy, time: Date.now() };

                setCurrentPos({ lat: latitude, lng: longitude });

                // Only add meaningful waypoints (accuracy < 50m, moved > 5m from last)
                const prev = coordsRef.current;
                if (prev.length > 0) {
                    const last = prev[prev.length - 1];
                    const dist = haversine(last.lat, last.lng, latitude, longitude);
                    if (dist < 3 || accuracy > 50) return; // Ignore noise
                    setDistance(d => d + dist);
                }

                coordsRef.current.push(point);
                setWaypointCount(coordsRef.current.length);

                if (onRouteUpdate) onRouteUpdate({ distance, waypointCount: coordsRef.current.length, currentPos: point });
            },
            (err) => {
                console.error('GPS error:', err);
                if (err.code === 1) setError('Location permission denied');
                else if (err.code === 2) setError('GPS unavailable');
                else setError('GPS timeout — move to open area');
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const stopTracking = async () => {
        setTracking(false);
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        clearInterval(timerRef.current);

        // Save route to IndexedDB
        if (coordsRef.current.length > 1) {
            await saveRoute({
                waypoints: coordsRef.current,
                distance: distance,
                duration: Date.now() - startTime,
                startTime: new Date(startTime).toISOString(),
                endTime: new Date().toISOString(),
            });
        }
    };

    return (
        <div style={{
            background: tracking
                ? 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))'
                : 'var(--card-bg)',
            backdropFilter: 'blur(12px) saturate(180%)',
            border: tracking ? '1px solid rgba(16,185,129,0.3)' : '1px solid var(--border)',
            borderRadius: '20px', padding: '20px', marginBottom: '20px',
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '12px',
                        background: tracking ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px'
                    }}>📍</div>
                    <div>
                        <div style={{ fontWeight: '700', fontSize: '15px', color: 'white' }}>Route Tracker</div>
                        <div style={{ fontSize: '11px', color: tracking ? '#10b981' : 'var(--text-muted)' }}>
                            {tracking ? '● Live GPS Tracking' : 'Start a collection route'}
                        </div>
                    </div>
                </div>
                {tracking && (
                    <div style={{
                        padding: '4px 10px', borderRadius: '99px', fontSize: '12px',
                        background: '#064e3b', color: '#34d399', fontWeight: '600',
                        animation: 'pulse 2s infinite'
                    }}>
                        {formatDuration(elapsed)}
                    </div>
                )}
            </div>

            {/* Stats */}
            {tracking && (
                <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '16px'
                }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '14px', textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: '800', color: 'white' }}>
                            {(distance / 1000).toFixed(2)}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>km</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '14px', textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: '800', color: 'white' }}>{waypointCount}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Points</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '14px', textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: '800', color: 'white' }}>
                            {currentPos ? `${currentPos.lat.toFixed(4)}` : '—'}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Lat</div>
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '12px', textAlign: 'center' }}>
                    ⚠️ {error}
                </div>
            )}

            {/* Button */}
            {!tracking ? (
                <button onClick={startTracking} className="btn" style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', height: '48px'
                }}>
                    Start Collection Route
                </button>
            ) : (
                <button onClick={stopTracking} className="btn" style={{
                    background: '#ef4444', color: 'white', height: '48px'
                }}>
                    Stop & Save Route
                </button>
            )}

            <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }`}</style>
        </div>
    );
};

export default RouteTracker;
