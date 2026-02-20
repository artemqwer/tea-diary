'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Locale, translations } from './translations';

const STORAGE_KEY = 'tea-diary-locale';

type TType = typeof translations.uk | typeof translations.en;

interface LocaleContextType {
    locale: Locale;
    setLocale: (l: Locale) => void;
    t: TType;
}

const LocaleContext = createContext<LocaleContextType>({
    locale: 'uk',
    setLocale: () => { },
    t: translations.uk,
});

export const LocaleProvider = ({ children }: { children: React.ReactNode }) => {
    const [locale, setLocaleState] = useState<Locale>('uk');

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
        if (saved === 'uk' || saved === 'en') {
            setLocaleState(saved);
        }
    }, []);

    const setLocale = useCallback((l: Locale) => {
        setLocaleState(l);
        localStorage.setItem(STORAGE_KEY, l);
    }, []);

    return (
        <LocaleContext.Provider value={{ locale, setLocale, t: translations[locale] }}>
            {children}
        </LocaleContext.Provider>
    );
};

export const useLocale = () => useContext(LocaleContext);
