import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import translations from '../i18n/translations';

// ─── Language Context ───
const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [lang, setLang] = useState('en');

    useEffect(() => {
        AsyncStorage.getItem('wastelink_lang').then((saved) => {
            if (saved) setLang(saved);
        });
    }, []);

    const toggleLanguage = useCallback(async () => {
        const next = lang === 'en' ? 'tl' : 'en';
        setLang(next);
        await AsyncStorage.setItem('wastelink_lang', next);
    }, [lang]);

    const t = useCallback(
        (key) => translations[lang]?.[key] || translations.en[key] || key,
        [lang]
    );

    return (
        <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => useContext(LanguageContext);
