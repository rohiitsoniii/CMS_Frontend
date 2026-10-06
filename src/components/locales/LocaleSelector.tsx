import { useState, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { localeService, Locale } from '@/services/localeService';

interface LocaleSelectorProps {
    projectId: string;
    selectedLocale?: string;
    onLocaleChange: (localeCode: string) => void;
    className?: string;
}

export function LocaleSelector({ projectId, selectedLocale, onLocaleChange, className = '' }: LocaleSelectorProps) {
    const [locales, setLocales] = useState<Locale[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        loadLocales();
    }, [projectId]);

    const loadLocales = async () => {
        try {
            setLoading(true);
            const data = await localeService.getLocales(projectId);
            const enabledLocales = data.filter(l => l.enabled);
            setLocales(enabledLocales);

            // Set default if no locale selected
            if (!selectedLocale) {
                const defaultLocale = enabledLocales.find(l => l.isDefault);
                if (defaultLocale) {
                    onLocaleChange(defaultLocale.code);
                }
            }
        } catch (error) {
            console.error('Failed to load locales:', error);
        } finally {
            setLoading(false);
        }
    };

    const currentLocale = locales.find(l => l.code === selectedLocale) || locales.find(l => l.isDefault);

    if (loading || locales.length === 0) {
        return null;
    }

    return (
        <div className={`relative ${className}`}>
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
                <Globe className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {currentLocale?.name || 'Select Language'}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                    ({currentLocale?.code})
                </span>
            </button>

            {showDropdown && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowDropdown(false)}
                    />

                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-20 overflow-hidden">
                        <div className="p-2">
                            <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                Select Language
                            </div>
                            {locales.map((locale) => (
                                <button
                                    key={locale._id}
                                    onClick={() => {
                                        onLocaleChange(locale.code);
                                        setShowDropdown(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${locale.code === selectedLocale
                                            ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{locale.name}</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                            {locale.code}
                                        </span>
                                    </div>
                                    {locale.code === selectedLocale && (
                                        <Check className="w-4 h-4" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
