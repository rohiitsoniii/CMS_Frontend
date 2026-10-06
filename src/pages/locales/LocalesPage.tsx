import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Edit, Trash2, Star, Globe, Check, X, Languages, RefreshCw, Zap } from 'lucide-react';
import { localeAPI } from '@/services/api';
import { TranslationSettingsPanel } from './TranslationSettingsPanel';
import { toast } from 'react-hot-toast';
import { LocalesSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export interface Locale {
    _id?: string;
    code: string;
    name: string;
    isDefault?: boolean;
    fallbackLocale?: string;
    isEnabled?: boolean;
}

export function LocalesPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const [locales, setLocales] = useState<Locale[]>([]);
    const [config, setConfig] = useState<any>(null);
    const [supportedLanguages, setSupportedLanguages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [translating, setTranslating] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingLocale, setEditingLocale] = useState<Locale | null>(null);
    const [deleteTargetCode, setDeleteTargetCode] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, [projectId]);

    const loadData = async () => {
        if (!projectId) return;

        try {
            setLoading(true);
            const [configRes, languagesRes] = await Promise.all([
                localeAPI.getConfig(projectId),
                localeAPI.getSupportedLanguages()
            ]);
            
            const fetchedConfig = configRes.data.data.config;
            setConfig(fetchedConfig);
            setLocales(fetchedConfig.locales || []);
            setSupportedLanguages(languagesRes.data.data.languages || []);
        } catch (error) {
            console.error('Failed to load data:', error);
            toast.error('Failed to load locale configuration');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (code: string) => {
        try {
            await localeAPI.remove(code);
            toast.success('Locale removed');
            loadData();
        } catch (error) {
            console.error('Failed to delete locale:', error);
            toast.error('Failed to delete locale');
        }
    };

    const handleSetDefault = async (code: string) => {
        try {
            await localeAPI.setDefault(code);
            toast.success('Default locale updated');
            loadData();
        } catch (error) {
            console.error('Failed to set default locale:', error);
            toast.error('Failed to set default locale');
        }
    };

    const handleBulkTranslate = async () => {
        try {
            setTranslating(true);
            await localeAPI.bulkTranslate();
            toast.success('Bulk translation process completed');
        } catch (error) {
            console.error('Translation failed:', error);
            toast.error('Translation failed');
        } finally {
            setTranslating(false);
        }
    };

    if (loading) {
        return <LocalesSkeleton />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-sm">
                        <Languages className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Locales & Translation</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage project languages, fallbacks, and automated content translations</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={handleBulkTranslate}
                        disabled={translating || !config?.autoTranslate}
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${translating ? 'animate-spin' : ''}`} />
                        Bulk Translate
                    </Button>
                    <Button
                        onClick={() => setShowAddModal(true)}
                        className="shadow-sm"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Locale
                    </Button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Locales Grid */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Globe className="w-4 h-4 text-indigo-500" />
                        Active Locales ({locales.length})
                    </h2>
                    
                    {locales.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-12 text-center">
                            <Globe className="w-14 h-14 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No locales configured</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Start by adding a default language for your content model.</p>
                            <Button
                                onClick={() => setShowAddModal(true)}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Your First Locale
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {locales.map((locale) => (
                                <div
                                    key={locale.code}
                                    className={`group bg-white dark:bg-gray-800 rounded-xl border p-5 transition-all hover:shadow-md flex flex-col justify-between ${
                                        locale.isDefault
                                            ? 'border-indigo-500 ring-1 ring-indigo-500/20'
                                            : 'border-gray-200/80 dark:border-gray-800'
                                    }`}
                                >
                                    <div>
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-700/60 rounded-lg text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                                                    {locale.code.substring(0, 2)}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5 text-sm">
                                                        {locale.name}
                                                        {locale.isDefault && (
                                                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                                        )}
                                                    </h3>
                                                    <span className="text-xs text-gray-400 font-mono tracking-wider">{locale.code.toUpperCase()}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label={`Edit ${locale.name}`}
                                                    onClick={() => setEditingLocale(locale)}
                                                    className="h-8 w-8 hover:text-indigo-600 dark:hover:text-indigo-400"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                </Button>
                                                {!locale.isDefault && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        aria-label={`Delete ${locale.name}`}
                                                        onClick={() => setDeleteTargetCode(locale.code)}
                                                        className="h-8 w-8 hover:text-red-600 dark:hover:text-red-400"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <Badge
                                                variant={locale.isEnabled ? 'default' : 'secondary'}
                                                className={`text-[10px] px-1.5 py-0 font-normal ${
                                                    locale.isEnabled
                                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                                        : ''
                                                }`}
                                            >
                                                {locale.isEnabled ? 'Active' : 'Disabled'}
                                            </Badge>
                                            {config?.autoTranslate && config?.translationApiKey && !locale.isDefault && (
                                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-blue-600 dark:text-blue-400 border-blue-500/20">
                                                    <Zap className="w-2.5 h-2.5 mr-0.5" />
                                                    Auto
                                                </Badge>
                                            )}
                                        </div>

                                        {!locale.isDefault && locale.isEnabled && (
                                            <button
                                                onClick={() => handleSetDefault(locale.code)}
                                                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                                            >
                                                Set Default
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Settings Sidebar */}
                <div className="space-y-6">
                    <TranslationSettingsPanel 
                        projectId={projectId!}
                        config={config}
                        onUpdate={loadData}
                    />
                </div>
            </div>

            {/* Add/Edit Modal */}
            {(showAddModal || editingLocale) && (
                <LocaleModal
                    locale={editingLocale}
                    projectId={projectId!}
                    existingLocales={locales}
                    supportedLanguages={supportedLanguages}
                    onClose={() => {
                        setShowAddModal(false);
                        setEditingLocale(null);
                    }}
                    onSave={() => {
                        setShowAddModal(false);
                        setEditingLocale(null);
                        loadData();
                    }}
                />
            )}

            {/* Accessible Confirmation Dialog */}
            <ConfirmDialog
                open={!!deleteTargetCode}
                onOpenChange={(open) => !open && setDeleteTargetCode(null)}
                title={`Delete locale "${deleteTargetCode?.toUpperCase()}"?`}
                description="This will remove this locale configuration and prevent new localized entries in this language. This action cannot be undone."
                confirmText="Delete Locale"
                onConfirm={() => {
                    if (deleteTargetCode) {
                        handleDelete(deleteTargetCode);
                        setDeleteTargetCode(null);
                    }
                }}
            />
        </div>
    );
}

// Locale Modal Component
function LocaleModal({
    locale,
    projectId,
    existingLocales,
    supportedLanguages,
    onClose,
    onSave,
}: {
    locale: Locale | null;
    projectId: string;
    existingLocales: Locale[];
    supportedLanguages: any[];
    onClose: () => void;
    onSave: () => void;
}) {
    const [formData, setFormData] = useState({
        code: locale?.code || '',
        name: locale?.name || '',
        fallbackLocale: locale?.fallbackLocale || '',
        isEnabled: locale?.isEnabled ?? true,
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.code || !formData.name) {
            toast.error('Please fill in code and name');
            return;
        }

        try {
            setSaving(true);
            const payload = { ...formData, projectId };

            if (locale) {
                await localeAPI.update(locale.code, payload);
                toast.success('Locale updated');
            } else {
                await localeAPI.add(payload);
                toast.success('New locale added');
            }
            onSave();
        } catch (error) {
            console.error('Failed to save locale:', error);
            toast.error('Failed to save locale');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">
                    {locale ? 'Modify Locale' : 'New Content Language'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Quick Select from Curated List */}
                    {!locale && (
                        <div className="space-y-1.5">
                            <label htmlFor="curated-language-select" className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider">
                                Pick from Curated List
                            </label>
                            <select
                                id="curated-language-select"
                                onChange={(e) => {
                                    const selected = supportedLanguages.find(l => l.code === e.target.value);
                                    if (selected) {
                                        setFormData({ ...formData, code: selected.code, name: selected.name });
                                    }
                                }}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all text-sm outline-none text-gray-700 dark:text-gray-200"
                            >
                                <option value="">Select a language...</option>
                                {supportedLanguages.map((l) => (
                                    <option key={l.code} value={l.code}>
                                        {l.name} ({l.code})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label htmlFor="locale-code" className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider">Code</label>
                            <input
                                id="locale-code"
                                type="text"
                                value={formData.code}
                                disabled={!!locale}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                placeholder="en"
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all font-mono text-sm outline-none disabled:opacity-50 text-gray-900 dark:text-white"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label htmlFor="locale-label" className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider">Label</label>
                            <input
                                id="locale-label"
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="English"
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all text-sm outline-none text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="fallback-locale-select" className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider">Fallback Path</label>
                        <select
                            id="fallback-locale-select"
                            value={formData.fallbackLocale}
                            onChange={(e) => setFormData({ ...formData, fallbackLocale: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all text-sm outline-none text-gray-700 dark:text-gray-200"
                        >
                            <option value="">System Default (en)</option>
                            {existingLocales
                                .filter(l => l.code !== locale?.code)
                                .map((l) => (
                                    <option key={l.code} value={l.code}>
                                        {l.name} ({l.code})
                                    </option>
                                ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="isEnabled"
                            checked={formData.isEnabled}
                            onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 dark:bg-gray-900"
                        />
                        <label htmlFor="isEnabled" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                            Enable this language for content editors
                        </label>
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={saving}
                            className="flex-1"
                        >
                            {saving ? 'Saving...' : locale ? 'Update' : 'Register'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default LocalesPage;
