import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import { saveScan } from '../indexeddb';

// Material mapping from MobileNet predictions
const MATERIAL_MAP = {
    // PET / Plastic
    'water bottle': 'PET', 'bottle': 'PET', 'pop bottle': 'PET', 'plastic bag': 'PET',
    'water jug': 'PET', 'bucket': 'PET', 'pitcher': 'PET', 'measuring cup': 'PET',
    'pill bottle': 'PET', 'soap dispenser': 'PET', 'shaker': 'PET',
    // Metal
    'can': 'METAL', 'beer glass': 'METAL', 'tin can': 'METAL', 'pop can': 'METAL',
    'aluminum': 'METAL', 'iron': 'METAL', 'steel drum': 'METAL', 'safety pin': 'METAL',
    'nail': 'METAL', 'screw': 'METAL', 'chain': 'METAL',
    // Paper
    'paper towel': 'PAPER', 'toilet tissue': 'PAPER', 'envelope': 'PAPER',
    'book jacket': 'PAPER', 'notebook': 'PAPER', 'carton': 'PAPER',
    'cardboard': 'PAPER', 'binder': 'PAPER', 'comic book': 'PAPER',
    // Glass
    'wine bottle': 'GLASS', 'beer bottle': 'GLASS', 'glass': 'GLASS',
    'goblet': 'GLASS', 'vase': 'GLASS', 'jar': 'GLASS', 'cocktail shaker': 'GLASS',
    // Organic
    'banana': 'ORGANIC', 'apple': 'ORGANIC', 'orange': 'ORGANIC', 'food': 'ORGANIC',
    'mushroom': 'ORGANIC', 'leaf': 'ORGANIC', 'flower': 'ORGANIC',
};

function matchMaterial(className) {
    const lower = className.toLowerCase();
    for (const [keyword, material] of Object.entries(MATERIAL_MAP)) {
        if (lower.includes(keyword)) return material;
    }
    return null;
}

const Scanner = ({ onScan, onClose }) => {
    const webcamRef = useRef(null);
    const [model, setModel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [prediction, setPrediction] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        const loadModel = async () => {
            try {
                await tf.ready();
                const m = await mobilenet.load({ version: 2, alpha: 0.5 });
                if (!cancelled) {
                    setModel(m);
                    setLoading(false);
                }
            } catch (err) {
                console.error('Model load failed:', err);
                if (!cancelled) {
                    setError('Failed to load AI model. Check your connection.');
                    setLoading(false);
                }
            }
        };
        loadModel();
        return () => { cancelled = true; };
    }, []);

    const capture = useCallback(async () => {
        if (!model || !webcamRef.current) return;
        const screenshot = webcamRef.current.getScreenshot();
        if (!screenshot) return;

        const img = new Image();
        img.src = screenshot;
        img.onload = async () => {
            const predictions = await model.classify(img);
            if (predictions && predictions.length > 0) {
                const top = predictions[0];
                const material = matchMaterial(top.className);
                const result = {
                    label: top.className,
                    confidence: Math.round(top.probability * 100),
                    material: material,
                };
                setPrediction(result);

                // Save scan to IndexedDB
                await saveScan({
                    label: top.className,
                    confidence: result.confidence,
                    material: material || 'UNKNOWN',
                    allPredictions: predictions.map(p => ({
                        label: p.className,
                        confidence: Math.round(p.probability * 100)
                    })),
                });
            }
        };
    }, [model]);

    const usePrediction = () => {
        if (prediction && prediction.material) {
            onScan(prediction.material, prediction.label, prediction.confidence);
        }
        onClose();
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: '#000', zIndex: 2000,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>
            {/* Header */}
            <div style={{
                width: '100%', padding: '16px 20px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'rgba(0,0,0,0.6)', zIndex: 1,
            }}>
                <h3 style={{ margin: 0, color: 'white', fontSize: '18px' }}>🤖 AI Scanner</h3>
                <button onClick={onClose} style={{
                    background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
                    width: '36px', height: '36px', borderRadius: '18px', fontSize: '18px', cursor: 'pointer'
                }}>✕</button>
            </div>

            {/* Camera */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', position: 'relative' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', color: 'white' }}>
                        <div style={{
                            border: '4px solid rgba(255,255,255,0.2)', borderLeftColor: '#10b981',
                            width: '48px', height: '48px', borderRadius: '50%',
                            animation: 'spin 1s linear infinite', margin: '0 auto 16px'
                        }} />
                        <p style={{ fontSize: '14px', opacity: 0.8 }}>Loading AI Model...</p>
                        <p style={{ fontSize: '12px', opacity: 0.5 }}>First load may take 10-15s</p>
                    </div>
                ) : error ? (
                    <div style={{ textAlign: 'center', color: '#ef4444', padding: '20px' }}>
                        <p style={{ fontSize: '16px' }}>⚠️ {error}</p>
                        <button onClick={onClose} className="btn" style={{ background: '#ef4444', color: 'white', marginTop: '16px', width: 'auto', padding: '0 32px' }}>Close</button>
                    </div>
                ) : (
                    <>
                        <Webcam
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={{ facingMode: 'environment', width: 640, height: 480 }}
                            style={{ width: '100%', maxHeight: '60vh', objectFit: 'cover' }}
                        />
                        {/* Scanning crosshair overlay */}
                        <div style={{
                            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                            width: '200px', height: '200px', border: '2px solid rgba(16, 185, 129, 0.6)',
                            borderRadius: '20px', pointerEvents: 'none'
                        }} />
                    </>
                )}
            </div>

            {/* Prediction result */}
            {prediction && (
                <div style={{
                    width: '100%', padding: '16px 20px',
                    background: 'rgba(30, 41, 59, 0.95)', borderTop: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ color: 'white', fontWeight: '700' }}>{prediction.label}</span>
                        <span style={{
                            padding: '4px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: '700',
                            background: prediction.confidence > 60 ? '#064e3b' : '#451a03',
                            color: prediction.confidence > 60 ? '#34d399' : '#fbbf24'
                        }}>{prediction.confidence}%</span>
                    </div>
                    {prediction.material && (
                        <div style={{ fontSize: '13px', color: '#10b981', marginBottom: '12px' }}>
                            Matched → <strong>{prediction.material}</strong>
                        </div>
                    )}
                    <button onClick={usePrediction} className="btn" style={{
                        background: prediction.material ? '#10b981' : 'rgba(255,255,255,0.1)',
                        color: 'white', height: '48px'
                    }}>
                        {prediction.material ? `Use ${prediction.material}` : 'No Match — Try Again'}
                    </button>
                </div>
            )}

            {/* Capture button */}
            {!loading && !error && (
                <div style={{ padding: '20px', width: '100%', display: 'flex', justifyContent: 'center', background: 'rgba(0,0,0,0.6)' }}>
                    <button onClick={capture} style={{
                        width: '72px', height: '72px', borderRadius: '50%',
                        border: '4px solid white', background: 'rgba(16, 185, 129, 0.3)',
                        cursor: 'pointer', boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)'
                    }} />
                </div>
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default Scanner;
