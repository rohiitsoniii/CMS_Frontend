/**
 * Example Plugin: Color Picker Field
 * 
 * This plugin adds a custom color picker field type to the CMS.
 */

import { useState } from 'react';
import { FieldPlugin, FieldComponentProps } from '../core/PluginSystem';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

// Color Picker Component
function ColorPickerField({
    value,
    onChange,
    label,
    description,
    required,
    disabled,
    error,
}: FieldComponentProps) {
    const [color, setColor] = useState(value || '#000000');

    const handleChange = (newColor: string) => {
        setColor(newColor);
        onChange(newColor);
    };

    return (
        <div className="space-y-2">
            <Label>
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {description && (
                <p className="text-sm text-gray-500">{description}</p>
            )}

            <div className="flex items-center gap-4">
                {/* Color Preview */}
                <div
                    className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                    style={{ backgroundColor: color }}
                    onClick={() => !disabled && document.getElementById('color-input')?.click()}
                />

                {/* Color Input */}
                <input
                    id="color-input"
                    type="color"
                    value={color}
                    onChange={(e) => handleChange(e.target.value)}
                    disabled={disabled}
                    className="hidden"
                />

                {/* Hex Input */}
                <Input
                    type="text"
                    value={color}
                    onChange={(e) => handleChange(e.target.value)}
                    disabled={disabled}
                    placeholder="#000000"
                    className="w-32"
                />
            </div>

            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}
        </div>
    );
}

// Plugin Definition
export const colorPickerPlugin: FieldPlugin = {
    metadata: {
        id: 'color-picker',
        name: 'Color Picker',
        version: '1.0.0',
        author: 'CMS Team',
        description: 'A custom color picker field for selecting colors',
        type: 'field',
        icon: '🎨',
    },

    fieldType: 'color',
    defaultValue: '#000000',

    validate: (value: string) => {
        const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        if (!hexRegex.test(value)) {
            return 'Please enter a valid hex color code';
        }
        return true;
    },

    transform: (value: string) => {
        return value.toUpperCase();
    },

    component: ColorPickerField,

    config: {
        enabled: true,
        settings: {
            allowAlpha: false,
            presetColors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'],
        },
    },

    hooks: {
        onInstall: async () => {
            console.log('Color Picker plugin installed');
        },
        onEnable: async () => {
            console.log('Color Picker plugin enabled');
        },
    },
};
