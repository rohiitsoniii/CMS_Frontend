import { useTranslation } from '../../i18n/I18nProvider';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../../i18n/translations';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
    const { language, setLanguage } = useTranslation();

    return (
        <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-500" />
            <Select value={language} onValueChange={(value) => setLanguage(value as SupportedLanguage)}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue>
                        <span className="flex items-center gap-2">
                            <span>{SUPPORTED_LANGUAGES[language].flag}</span>
                            <span>{SUPPORTED_LANGUAGES[language].nativeName}</span>
                        </span>
                    </SelectValue>
                </SelectTrigger>
                <SelectContent>
                    {Object.entries(SUPPORTED_LANGUAGES).map(([code, lang]: [string, any]) => (
                        <SelectItem key={code} value={code}>
                            <span className="flex items-center gap-2">
                                <span>{(lang as any).flag}</span>
                                <span>{(lang as any).nativeName}</span>
                                <span className="text-xs text-gray-500">({(lang as any).name})</span>
                            </span>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
