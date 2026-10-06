import React, { useState } from 'react';
import { Settings, Save, Key, Globe, Layout, CheckCircle } from 'lucide-react';
import { localeAPI } from '@/services/api';
import { toast } from 'react-hot-toast';

interface TranslationSettingsPanelProps {
    projectId: string;
    config: any;
    onUpdate: () => void;
}

export const TranslationSettingsPanel: React.FC<TranslationSettingsPanelProps> = ({
    projectId,
    config,
    onUpdate
}) => {
    const [apiKey, setApiKey] = useState('');
    const [autoTranslate, setAutoTranslate] = useState(config.autoTranslate || false);
    const [fields, setFields] = useState<string[]>(config.autoTranslateFields || ['title', 'name', 'body']);
    const [saving, setSaving] = useState(false);

    const availableFields = ['title', 'name', 'slug', 'description', 'body', 'content', 'excerpt'];

    const handleSave = async () => {
        try {
            setSaving(true);
            
            // 1. Save API Key if provided
            if (apiKey) {
                await localeAPI.saveApiKey(apiKey);
            }

            // 2. Update toggle and fields
            await localeAPI.updateConfig(projectId, {
                autoTranslate,
                autoTranslateFields: fields
            });

            toast.success('Translation settings updated');
            onUpdate();
            setApiKey(''); // Clear key for security
        } catch (error: any) {
            console.error('Failed to save translation settings:', error);
            toast.error(error.response?.data?.message || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const toggleField = (field: string) => {
        if (fields.includes(field)) {
            setFields(fields.filter(f => f !== field));
        } else {
            setFields([...fields, field]);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                        <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Auto-Translation Settings</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Configure Google Cloud Translation for your content</p>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-8">
                {/* Auto Translate Toggle */}
                <div className="flex items-center justify-between p-4 bg-indigo-50/30 dark:bg-indigo-900/10 rounded-xl border border-indigo-100/50 dark:border-indigo-900/20">
                    <div className="space-y-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">Enable Auto-Translation</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Automatically translate content when it is published</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={autoTranslate}
                            onChange={(e) => setAutoTranslate(e.target.checked)}
                            className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                    </label>
                </div>

                {/* API Key */}
                <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                        <Key className="w-4 h-4 text-gray-400" />
                        Google Cloud API Key
                    </label>
                    <div className="relative">
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="••••••••••••••••••••••••••••••••"
                            className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <Settings className="w-5 h-5 text-gray-400" />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Required for automated translation. Your key is encrypted and stored securely.
                    </p>
                </div>

                {/* Fields to Translate */}
                <div className="space-y-4">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                        <Layout className="w-4 h-4 text-gray-400" />
                        Translatable Fields
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {availableFields.map((field) => (
                            <button
                                key={field}
                                onClick={() => toggleField(field)}
                                className={`flex items-center justify-between p-3 rounded-xl border text-sm transition-all ${
                                    fields.includes(field)
                                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                                        : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                                }`}
                            >
                                <span className="capitalize">{field}</span>
                                {fields.includes(field) && <CheckCircle className="w-4 h-4" />}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                        Select which component fields should be sent to Google Translate. IDs, URLs, and numbers are always skipped.
                    </p>
                </div>

                {/* Save Button */}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0"
                    >
                        <Save className="w-5 h-5" />
                        {saving ? 'Saving Settings...' : 'Save Translation Configuration'}
                    </button>
                </div>
            </div>
        </div>
    );
};
