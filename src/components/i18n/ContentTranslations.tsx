import { useState } from 'react';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '@/i18n/translations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Globe, Plus, Check } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

interface ContentTranslationsProps {
    defaultLocale: string;
    supportedLocales: string[];
    currentLocale: string;
    onLocaleChange: (locale: string) => void;
    localizedData: Record<string, any>;
    onLocalizedDataChange: (locale: string, data: any) => void;
    fields: Array<{
        name: string;
        label: string;
        type: 'text' | 'textarea' | 'richtext';
    }>;
}

export function ContentTranslations({
    defaultLocale,
    supportedLocales,
    currentLocale,
    onLocaleChange,
    localizedData,
    onLocalizedDataChange,
    fields,
}: ContentTranslationsProps) {
    const [isAddingLocale, setIsAddingLocale] = useState(false);
    const [selectedNewLocale, setSelectedNewLocale] = useState<string>('');

    const availableLocales = Object.keys(SUPPORTED_LANGUAGES).filter(
        (locale) => !supportedLocales.includes(locale)
    );

    const handleAddLocale = () => {
        if (selectedNewLocale && !supportedLocales.includes(selectedNewLocale)) {
            // Initialize empty data for new locale
            onLocalizedDataChange(selectedNewLocale, {});
            setIsAddingLocale(false);
            setSelectedNewLocale('');
        }
    };

    const getTranslationStatus = (locale: string) => {
        if (locale === defaultLocale) return 'default';
        const data = localizedData[locale];
        if (!data) return 'empty';

        const translatedFields = fields.filter(
            (field) => data[field.name] && data[field.name].trim() !== ''
        );

        if (translatedFields.length === 0) return 'empty';
        if (translatedFields.length === fields.length) return 'complete';
        return 'partial';
    };

    const getStatusBadge = (locale: string) => {
        const status = getTranslationStatus(locale);

        switch (status) {
            case 'default':
                return <Badge variant="default">Default</Badge>;
            case 'complete':
                return <Badge className="bg-green-500"><Check className="w-3 h-3 mr-1" /> Complete</Badge>;
            case 'partial':
                return <Badge variant="secondary">Partial</Badge>;
            case 'empty':
                return <Badge variant="outline">Empty</Badge>;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    <h3 className="text-lg font-semibold">Translations</h3>
                </div>

                <Dialog open={isAddingLocale} onOpenChange={setIsAddingLocale}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Language
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Translation Language</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label>Select Language</Label>
                                <select
                                    className="w-full mt-2 p-2 border rounded-lg"
                                    value={selectedNewLocale}
                                    onChange={(e) => setSelectedNewLocale(e.target.value)}
                                >
                                    <option value="">Select a language...</option>
                                    {availableLocales.map((locale) => (
                                        <option key={locale} value={locale}>
                                            {SUPPORTED_LANGUAGES[locale as SupportedLanguage].flag}{' '}
                                            {SUPPORTED_LANGUAGES[locale as SupportedLanguage].nativeName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <Button onClick={handleAddLocale} disabled={!selectedNewLocale} className="w-full">
                                Add Language
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Tabs value={currentLocale} onValueChange={onLocaleChange}>
                <TabsList className="w-full justify-start overflow-x-auto">
                    {supportedLocales.map((locale) => (
                        <TabsTrigger key={locale} value={locale} className="flex items-center gap-2">
                            <span>{SUPPORTED_LANGUAGES[locale as SupportedLanguage]?.flag || '🌐'}</span>
                            <span>{SUPPORTED_LANGUAGES[locale as SupportedLanguage]?.nativeName || locale}</span>
                            {getStatusBadge(locale)}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {supportedLocales.map((locale) => (
                    <TabsContent key={locale} value={locale} className="space-y-4 mt-4">
                        {locale === defaultLocale ? (
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    This is the default language. Edit the main content fields above.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {fields.map((field) => (
                                    <div key={field.name}>
                                        <Label>{field.label}</Label>
                                        {field.type === 'text' && (
                                            <Input
                                                value={localizedData[locale]?.[field.name] || ''}
                                                onChange={(e) =>
                                                    onLocalizedDataChange(locale, {
                                                        ...localizedData[locale],
                                                        [field.name]: e.target.value,
                                                    })
                                                }
                                                placeholder={`Enter ${field.label.toLowerCase()} in ${SUPPORTED_LANGUAGES[locale as SupportedLanguage]?.nativeName
                                                    }`}
                                            />
                                        )}
                                        {field.type === 'textarea' && (
                                            <Textarea
                                                value={localizedData[locale]?.[field.name] || ''}
                                                onChange={(e) =>
                                                    onLocalizedDataChange(locale, {
                                                        ...localizedData[locale],
                                                        [field.name]: e.target.value,
                                                    })
                                                }
                                                rows={4}
                                                placeholder={`Enter ${field.label.toLowerCase()} in ${SUPPORTED_LANGUAGES[locale as SupportedLanguage]?.nativeName
                                                    }`}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
