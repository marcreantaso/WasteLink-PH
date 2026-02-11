// WasteLink PH — TensorFlow.js AI Service
// Classifies recyclable materials from camera images

const LABELS = ['PET', 'HDPE', 'METAL', 'PAPER', 'ORGANIC', 'OTHER'];

// Average market prices per kg in PHP (Philippine Peso)
const PRICES_PER_KG = {
    PET: 15,
    HDPE: 12,
    METAL: 25,
    PAPER: 8,
    ORGANIC: 2,
    OTHER: 1,
};

// Estimated weight ranges by material type (kg)
const WEIGHT_ESTIMATES = {
    PET: { min: 0.02, max: 0.5 },
    HDPE: { min: 0.05, max: 1.0 },
    METAL: { min: 0.1, max: 2.0 },
    PAPER: { min: 0.05, max: 0.5 },
    ORGANIC: { min: 0.1, max: 1.5 },
    OTHER: { min: 0.05, max: 1.0 },
};

let model = null;
let tf = null;

/**
 * Initialize TensorFlow.js and load the model
 */
export async function initModel() {
    try {
        // Dynamic import for tree-shaking
        tf = require('@tensorflow/tfjs');

        // Try loading a custom model; fall back to demo mode
        try {
            model = await tf.loadLayersModel('asset:///ai-models/model.json');
            console.log('[AI] Model loaded successfully');
        } catch (e) {
            console.log('[AI] Custom model not found, running in demo mode');
            model = null;
        }
    } catch (e) {
        console.error('[AI] TF.js initialization failed:', e);
    }
}

/**
 * Classify a recyclable material from an image
 * @param {string} imageUri - URI of the captured image
 * @returns {Object} Classification result
 */
export async function classifyImage(imageUri) {
    if (!model) {
        // Demo mode: generate realistic mock classification
        return generateDemoResult();
    }

    try {
        // Load and preprocess image
        const response = await fetch(imageUri);
        const imageBlob = await response.blob();

        // Create image tensor (224x224 for MobileNetV2)
        const imageTensor = tf.browser
            .fromPixels(imageBlob)
            .resizeNearestNeighbor([224, 224])
            .expandDims(0)
            .div(255.0);

        // Run inference
        const predictions = model.predict(imageTensor);
        const probabilities = await predictions.data();

        // Get top prediction
        const maxIdx = probabilities.indexOf(Math.max(...probabilities));
        const confidence = probabilities[maxIdx];
        const materialType = LABELS[maxIdx];

        // Cleanup tensors
        imageTensor.dispose();
        predictions.dispose();

        return buildResult(materialType, confidence);
    } catch (e) {
        console.error('[AI] Classification error:', e);
        return generateDemoResult();
    }
}

/**
 * Build structured result from classification
 */
function buildResult(materialType, confidence) {
    const weightRange = WEIGHT_ESTIMATES[materialType];
    const estimatedWeight = +(
        weightRange.min +
        Math.random() * (weightRange.max - weightRange.min)
    ).toFixed(2);
    const pricePerKg = PRICES_PER_KG[materialType];
    const estimatedPrice = +(estimatedWeight * pricePerKg).toFixed(2);

    return {
        materialType,
        confidence: +(confidence * 100).toFixed(1),
        estimatedWeight,
        pricePerKg,
        estimatedPrice,
        allPredictions: LABELS.map((label, i) => ({
            label,
            probability: label === materialType ? confidence : (1 - confidence) / (LABELS.length - 1),
        })),
        timestamp: new Date().toISOString(),
    };
}

/**
 * Demo mode: generate realistic classification
 */
function generateDemoResult() {
    const idx = Math.floor(Math.random() * LABELS.length);
    const materialType = LABELS[idx];
    const confidence = 0.75 + Math.random() * 0.2; // 75-95%
    return buildResult(materialType, confidence);
}

export { LABELS, PRICES_PER_KG, WEIGHT_ESTIMATES };
