import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Edit, Trash2, Star, Globe, Check, X, Languages, RefreshCw, Zap } from 'lucide-react';
import { localeAPI } from '@/services/api';
import { TranslationSettingsPanel } from './TranslationSettingsPanel';
import { toast } from 'react-hot-toast';
import { LocalesSkeleton } from '@/components/skeletons';

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
        if (!confirm('Are you sure you want to delete this locale? This action cannot be undone.')) {
            return;
        }

        try {
            await localeAPI.remove(code);
            setLocales(locales.filter(l => l.code !== code));
            toast.success(`Locale ${code} removed`);
        } catch (error) {
            console.error('Failed to delete locale:', error);
            toast.error('Failed to delete locale');
        }
    };

    const handleSetDefault = async (code: string) => {
        if (!projectId) return;

        try {
            await localeAPI.update(code, { isDefault: true });
            await loadData();
            toast.success(`${code} set as default locale`);
        } catch (error) {
            console.error('Failed to set default locale:', error);
            toast.error('Failed to set default locale');
        }
    };

    const handleBulkTranslate = async () => {
        if (!confirm('This will translate all published content into your enabled languages. Depending on your content volume, this may take a while and incur Google API costs. Continue?')) {
            return;
        }
        
        try {
            setTranslating(true);
            const response = await localeAPI.translateAll();
            toast.success(response.data.message || 'Bulk translation started');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Bulk translation failed');
        } finally {
            setTranslating(false);
        }
    };

    if (loading) {
        return <LocalesSkeleton />;
    }

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 pb-20">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-600 rounded-xl">
                                <Languages className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Locales & Translation</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Manage languages and automated content workflows</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleBulkTranslate}
                                disabled={translating || !config?.autoTranslate}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 transition-all disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 ${translating ? 'animate-spin' : ''}`} />
                                Bulk Translate
                            </button>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none rounded-xl text-sm font-bold hover:bg-indigo-700 hover:-translate-y-0.5 transition-all"
                            >
                                <Plus className="w-5 h-5" />
                                Add Locale
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Locales Grid */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Globe className="w-5 h-5 text-indigo-500" />
                            Active Locales
                        </h2>
                        
                        {locales.length === 0 ? (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-12 text-center">
                                <Globe className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No locales found</h3>
                                <p className="text-gray-500 mb-6">Start by adding a language for your content project.</p>
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
                                >
                                    Add Your First Locale
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {locales.map((locale) => (
                                    <div
                                        key={locale.code}
                                        className={`group bg-white dark:bg-gray-800 rounded-2xl border p-5 transition-all hover:shadow-md ${
                                            locale.isDefault ? 'border-indigo-500 ring-1 ring-indigo-500/20' : 'border-gray-200 dark:border-gray-700'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg text-lg font-bold text-indigo-600 dark:text-indigo-400 capitalize">
                                                    {locale.code.substring(0, 2)}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                                                        {locale.name}
                                                        {locale.isDefault && <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />}
                                                    </h3>
                                                    <span className="text-xs text-gray-500 font-mono tracking-wider">{locale.code.toUpperCase()}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setEditingLocale(locale)}
                                                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-indigo-600"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                {!locale.isDefault && (
                                                    <button
                                                        onClick={() => handleDelete(locale.code)}
                                                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors text-gray-400 hover:text-red-600"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                    locale.isEnabled 
                                                        ? 'bg-green-100 dark:bg-green-900/20 text-green-600' 
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                                                }`}>
                                                    {locale.isEnabled ? 'Active' : 'Disabled'}
                                                </span>
                                                {config?.autoTranslate && config?.translationApiKey && !locale.isDefault && (
                                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 rounded-full text-[10px] font-bold text-blue-600 uppercase">
                                                        <Zap className="w-2.5 h-2.5" />
                                                        Auto
                                                    </span>
                                                )}
                                            </div>

                                            {!locale.isDefault && locale.isEnabled && (
                                                <button
                                                    onClick={() => handleSetDefault(locale.code)}
                                                    className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                                                >
                                                    Set as Default
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
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">
                    {locale ? 'Modify Locale' : 'New Content Language'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Quick Select from Curated List */}
                    {!locale && (
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-gray-500 tracking-widest">
                                Pick from Curated List
                            </label>
                            <select
                                onChange={(e) => {
                                    const selected = supportedLanguages.find(l => l.code === e.target.value);
                                    if (selected) {
                                        setFormData({ ...formData, code: selected.code, name: selected.name });
                                    }
                                }}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm outline-none"
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

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Code</label>
                            <input
                                type="text"
                                value={formData.code}
                                disabled={!!locale}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                placeholder="en"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all font-mono text-sm outline-none disabled:opacity-50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Label</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="English"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Fallback Path</label>
                        <select
                            value={formData.fallbackLocale}
                            onChange={(e) => setFormData({ ...formData, fallbackLocale: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm outline-none"
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

                    <div className="flex items-center gap-3 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : locale ? 'Update' : 'Register'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

