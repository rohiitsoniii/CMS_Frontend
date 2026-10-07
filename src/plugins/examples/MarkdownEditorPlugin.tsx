/**
 * Example Plugin: Markdown Editor Field
 * 
 * This plugin adds a markdown editor field type with preview.
 */

import { useState } from 'react';
import { FieldPlugin, FieldComponentProps } from '../core/PluginSystem';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Eye } from 'lucide-react';
import { sanitizeHtml } from '@/lib/sanitize';

// Simple markdown to HTML converter (basic implementation)
function markdownToHtml(markdown: string): string {
    let html = markdown;

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>');

    // Line breaks
    html = html.replace(/\n/gim, '<br>');

    return html;
}

// Markdown Editor Component
function MarkdownEditorField({
    value,
    onChange,
    label,
    description,
    required,
    disabled,
    error,
}: FieldComponentProps) {
    const [markdown, setMarkdown] = useState(value || '');

    const handleChange = (newValue: string) => {
        setMarkdown(newValue);
        onChange(newValue);
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

            <Tabs defaultValue="edit" className="w-full">
                <TabsList>
                    <TabsTrigger value="edit" className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Edit
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Preview
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="edit">
                    <Textarea
                        value={markdown}
                        onChange={(e) => handleChange(e.target.value)}
                        disabled={disabled}
                        rows={10}
                        placeholder="Enter markdown content..."
                        className="font-mono"
                    />
                    <div className="mt-2 text-xs text-gray-500">
                        Supports: **bold**, *italic*, # headers, [links](url)
                    </div>
                </TabsContent>

                <TabsContent value="preview">
                    <div
                        className="prose max-w-none p-4 border rounded-lg min-h-[240px] bg-gray-50 dark:bg-gray-900"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(markdownToHtml(markdown)) }}
                    />
                </TabsContent>
            </Tabs>

            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}
        </div>
    );
}

// Plugin Definition
export const markdownEditorPlugin: FieldPlugin = {
    metadata: {
        id: 'markdown-editor',
        name: 'Markdown Editor',
        version: '1.0.0',
        author: 'CMS Team',
        description: 'A markdown editor field with live preview',
        type: 'field',
        icon: '📝',
    },

    fieldType: 'markdown',
    defaultValue: '',

    validate: (value: string) => {
        if (value.length > 50000) {
            return 'Markdown content is too long (max 50,000 characters)';
        }
        return true;
    },

    component: MarkdownEditorField,

    config: {
        enabled: true,
        settings: {
            enablePreview: true,
            maxLength: 50000,
        },
    },

    hooks: {
        onInstall: async () => {
            console.log('Markdown Editor plugin installed');
        },
        onEnable: async () => {
            console.log('Markdown Editor plugin enabled');
        },
    },
};
