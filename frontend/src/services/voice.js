// WasteLink PH — Voice Prompt Service
// Uses Web Speech API / expo-speech for low-literacy users

import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';

const VOICE_ENABLED_KEY = 'wastelink_voice_enabled';

let voiceEnabled = true;

export async function initVoice() {
    try {
        const saved = await AsyncStorage.getItem(VOICE_ENABLED_KEY);
        voiceEnabled = saved !== 'false';
    } catch (e) {
        voiceEnabled = true;
    }
}

export async function toggleVoice() {
    voiceEnabled = !voiceEnabled;
    await AsyncStorage.setItem(VOICE_ENABLED_KEY, String(voiceEnabled));
    return voiceEnabled;
}

export function isVoiceEnabled() {
    return voiceEnabled;
}

/**
 * Speak a text prompt
 * @param {string} text - Text to speak
 * @param {string} lang - Language code ('en' or 'tl')
 */
export function speak(text, lang = 'en') {
    if (!voiceEnabled || !text) return;

    // Stop any current speech
    Speech.stop();

    Speech.speak(text, {
        language: lang === 'tl' ? 'fil-PH' : 'en-US',
        rate: 0.85, // Slightly slower for clarity
        pitch: 1.0,
        onError: (e) => console.error('[Voice] Speech error:', e),
    });
}

/**
 * Speak with delay (for screen transitions)
 */
export function speakDelayed(text, lang = 'en', delayMs = 500) {
    if (!voiceEnabled) return;
    setTimeout(() => speak(text, lang), delayMs);
}

export function stopSpeaking() {
    Speech.stop();
}
