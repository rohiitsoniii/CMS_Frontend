import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, DEFAULT_LANGUAGE, SupportedLanguage } from './translations';

interface I18nContextType {
    language: SupportedLanguage;
    setLanguage: (lang: SupportedLanguage) => void;
    t: (key: string, defaultValue?: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const STORAGE_KEY = 'cms_language';

export function I18nProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<SupportedLanguage>(() => {
        // Get from localStorage or browser language or default
        const stored = localStorage.getItem(STORAGE_KEY) as SupportedLanguage;
        if (stored && translations[stored]) {
            return stored;
        }

        const browserLang = navigator.language.split('-')[0] as SupportedLanguage;
        if (translations[browserLang]) {
            return browserLang;
        }

        return DEFAULT_LANGUAGE;
    });

    const setLanguage = (lang: SupportedLanguage) => {
        setLanguageState(lang);
        localStorage.setItem(STORAGE_KEY, lang);
        // Update HTML lang attribute
        document.documentElement.lang = lang;
    };

    // Translation function with nested key support
    const t = (key: string, defaultValue?: string): string => {
        const keys = key.split('.');
        let value: any = translations[language];

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                // Fallback to English
                value = translations.en;
                for (const k of keys) {
                    if (value && typeof value === 'object' && k in value) {
                        value = value[k];
                    } else {
                        return defaultValue || key;
                    }
                }
                return value;
            }
        }

        return typeof value === 'string' ? value : defaultValue || key;
    };

    useEffect(() => {
        document.documentElement.lang = language;
    }, [language]);

    return (
        <I18nContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useTranslation() {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useTranslation must be used within I18nProvider');
    }
    return context;
}

// Convenience hook for just the t function
export function useT() {
    const { t } = useTranslation();
    return t;
}
