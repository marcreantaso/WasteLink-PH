import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

const Scanner = ({ onScan, onClose }) => {
    const webcamRef = useRef(null);
    const [model, setModel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [prediction, setPrediction] = useState(null);

    useEffect(() => {
        const loadModel = async () => {
            try {
                console.log('Loading MobileNet...');
                await tf.ready();
                const loadedModel = await mobilenet.load({
                    version: 2,
                    alpha: 0.50 // Lightweight version
                });
                setModel(loadedModel);
                setLoading(false);
                console.log('MobileNet loaded');
            } catch (err) {
                console.error('Failed to load model', err);
                setLoading(false);
            }
        };
        loadModel();
    }, []);

    const capture = React.useCallback(async () => {
        if (!model || !webcamRef.current) return;

        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
            const img = new Image();
            img.src = imageSrc;
            img.onload = async () => {
                const predictions = await model.classify(img);
                if (predictions && predictions.length > 0) {
                    setPrediction(predictions[0]);
                    // Auto-close after short delay if confidence is high
                    /* 
                    if (predictions[0].probability > 0.6) {
                        setTimeout(() => onScan(predictions[0].className), 1500);
                    } 
                    */
                }
            };
        }
    }, [webcamRef, model]);

    return (
        <div className="scanner-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.9)', zIndex: 2000,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{ position: 'absolute', top: 20, right: 20 }}>
                <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '24px' }}>✕</button>
            </div>

            <h3 style={{ color: 'white', marginBottom: '20px' }}>
                {loading ? 'Loading AI...' : 'Scan Waste Item'}
            </h3>

            {loading ? (
                <div className="spinner"></div> // Add CSS for spinner later
            ) : (
                <div style={{ position: 'relative', width: '100%', maxWidth: '350px', borderRadius: '20px', overflow: 'hidden' }}>
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{ facingMode: "environment" }}
                        style={{ width: '100%', borderRadius: '20px' }}
                    />
                    <div style={{
                        position: 'absolute', bottom: 20, left: 0, right: 0,
                        display: 'flex', justifyContent: 'center'
                    }}>
                        <button onClick={capture} style={{
                            width: '60px', height: '60px', borderRadius: '30px',
                            background: 'white', border: '4px solid var(--primary)',
                            cursor: 'pointer'
                        }}></button>
                    </div>
                </div>
            )}

            {prediction && (
                <div style={{
                    marginTop: '20px', padding: '16px', borderRadius: '12px',
                    background: 'var(--card-bg)', border: '1px solid var(--border)',
                    textAlign: 'center', maxWidth: '300px'
                }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>AI Identified:</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--primary)', textTransform: 'capitalize' }}>
                        {prediction.className}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Confidence: {(prediction.probability * 100).toFixed(1)}%
                    </div>
                    <button
                        onClick={() => onScan(prediction.className)}
                        className="btn btn-primary"
                        style={{ marginTop: '12px', height: '40px', fontSize: '14px' }}>
                        Use This Item
                    </button>
                </div>
            )}
        </div>
    );
};

export default Scanner;
