import { useState, useEffect } from 'react';
import { Eye, EyeOff, Clock, Globe } from 'lucide-react';
import { FieldRenderer } from './FieldRenderer';
import type { ContentType } from '@/services/contentTypeService';
import type { Content } from '@/services/contentService';
import toast from 'react-hot-toast';

interface DynamicFormBuilderProps {
    contentType: ContentType;
    initialData?: Content;
    onSave: (data: Record<string, any>, status: 'draft' | 'published') => Promise<void>;
    onCancel: () => void;
}

export function DynamicFormBuilder({ contentType, initialData, onSave, onCancel }: DynamicFormBuilderProps) {
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [autoSaving, setAutoSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // Initialize form data
    useEffect(() => {
        if (initialData) {
            setFormData(initialData.data || {});
        } else {
            // Set default values
            const defaults: Record<string, any> = {};
            contentType.fields.forEach((field) => {
                if (field.defaultValue !== undefined) {
                    defaults[field.name] = field.defaultValue;
                }
            });
            setFormData(defaults);
        }
    }, [initialData, contentType]);

    // Auto-save functionality
    useEffect(() => {
        const timer = setTimeout(() => {
            if (Object.keys(formData).length > 0 && !saving) {
                handleAutoSave();
            }
        }, 3000); // Auto-save after 3 seconds of inactivity

        return () => clearTimeout(timer);
    }, [formData]);

    const handleAutoSave = async () => {
        try {
            setAutoSaving(true);
            await onSave(formData, 'draft');
            setLastSaved(new Date());
        } catch (error) {
            console.error('Auto-save failed:', error);
        } finally {
            setAutoSaving(false);
        }
    };

    const handleFieldChange = (fieldName: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [fieldName]: value,
        }));

        // Clear error for this field
        if (errors[fieldName]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[fieldName];
                return newErrors;
            });
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        contentType.fields.forEach((field) => {
            const value = formData[field.name];

            // Required validation
            if (field.required && (value === undefined || value === null || value === '')) {
                newErrors[field.name] = `${field.label || field.name} is required`;
                return;
            }

            // Skip validation if field is empty and not required
            if (!value) return;

            // Type-specific validation
            if (field.type === 'email' && value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    newErrors[field.name] = 'Invalid email address';
                }
            }

            if (field.type === 'url' && value) {
                try {
                    new URL(value);
                } catch {
                    newErrors[field.name] = 'Invalid URL';
                }
            }

            // Length validation
            if (field.validation?.minLength && value.length < field.validation.minLength) {
                newErrors[field.name] = `Minimum length is ${field.validation.minLength}`;
            }

            if (field.validation?.maxLength && value.length > field.validation.maxLength) {
                newErrors[field.name] = `Maximum length is ${field.validation.maxLength}`;
            }

            // Number validation
            if (field.type === 'number') {
                if (field.validation?.min !== undefined && value < field.validation.min) {
                    newErrors[field.name] = `Minimum value is ${field.validation.min}`;
                }

                if (field.validation?.max !== undefined && value > field.validation.max) {
                    newErrors[field.name] = `Maximum value is ${field.validation.max}`;
                }
            }

            // Pattern validation
            if (field.validation?.pattern && value) {
                const regex = new RegExp(field.validation.pattern);
                if (!regex.test(value)) {
                    newErrors[field.name] = 'Invalid format';
                }
            }

            // Enum validation
            if (field.validation?.enum && value) {
                if (!field.validation.enum.includes(value)) {
                    newErrors[field.name] = 'Invalid value';
                }
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async (status: 'draft' | 'published') => {
        if (status === 'published' && !validateForm()) {
            return;
        }

        try {
            setSaving(true);
            await onSave(formData, status);
        } catch (error) {
            console.error('Save failed:', error);
            toast.error('Failed to save content. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Auto-save indicator */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    {autoSaving ? (
                        <>
                            <Clock className="w-4 h-4 animate-spin" />
                            <span>Saving...</span>
                        </>
                    ) : lastSaved ? (
                        <>
                            <Clock className="w-4 h-4" />
                            <span>Last saved {lastSaved.toLocaleTimeString()}</span>
                        </>
                    ) : null}
                </div>

                {contentType.localization && (
                    <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <select className="px-3 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 gap-6">
                {contentType.fields.map((field) => (
                    <FieldRenderer
                        key={field.name}
                        field={field}
                        value={formData[field.name]}
                        onChange={(value) => handleFieldChange(field.name, value)}
                        error={errors[field.name]}
                    />
                ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                    Cancel
                </button>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => handleSave('draft')}
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <EyeOff className="w-5 h-5" />
                        Save as Draft
                    </button>

                    <button
                        type="button"
                        onClick={() => handleSave('published')}
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Eye className="w-5 h-5" />
                        {saving ? 'Publishing...' : 'Publish'}
                    </button>
                </div>
            </div>

            {/* Validation Summary */}
            {Object.keys(errors).length > 0 && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                        Please fix the following errors:
                    </h4>
                    <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300 space-y-1">
                        {Object.entries(errors).map(([field, error]) => (
                            <li key={field}>{error}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
