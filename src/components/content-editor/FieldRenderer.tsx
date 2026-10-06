import { useState } from 'react';
import { Calendar, Link as LinkIcon, Code, Image as ImageIcon, Sparkles, Wand2, Loader2 } from 'lucide-react';
import type { FieldDefinition } from '@/services/contentTypeService';
import { MediaPickerModal } from '@/components/media/MediaPickerModal';
import { ReferencePickerModal } from '@/components/media/ReferencePickerModal';
import { aiAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';


interface FieldRendererProps {
    field: FieldDefinition;
    value: any;
    onChange: (value: any) => void;
    error?: string;
    projectId?: string;
}

export function FieldRenderer({ field, value, onChange, error, projectId }: FieldRendererProps) {

    const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
    const [refPickerOpen, setRefPickerOpen] = useState(false);
    
    // AI Generation state
    const [aiDialogOpen, setAiDialogOpen] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleAIGenerate = async () => {
        if (!aiPrompt.trim()) return;
        setIsGenerating(true);
        try {
            // For now use a generic content generation prompt
            const prompt = `Generate content for a field named "${field.label || field.name}" which is a ${field.type} field.
User description of what to write: "${aiPrompt}"
Respond with ONLY the generated content, nothing else.`;
            
            const response = await aiAPI.improveContent(prompt); // Reusing improveContent as generic generator
            onChange(response.data.data.improvedContent);
            setAiDialogOpen(false);
            setAiPrompt('');
            toast.success('Generated content with AI!');
        } catch (error) {
            console.error('AI Generation error:', error);
            toast.error('Failed to generate content');
        } finally {
            setIsGenerating(false);
        }
    };


    const renderField = () => {
        switch (field.type) {
            case 'string':
            case 'email':
            case 'url':
                return (
                    <input
                        type={field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : 'text'}
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}

                        placeholder={`Enter ${field.label || field.name}...`}
                        className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${error ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                            }`}
                    />
                );

            case 'text':
                return (
                    <textarea
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}

                        placeholder={`Enter ${field.label || field.name}...`}
                        rows={5}
                        className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none ${error ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                            }`}
                    />
                );

            case 'richtext':
                return (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                        <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-2 flex items-center gap-2">
                            <button className="px-3 py-1 text-sm hover:bg-gray-200 dark:hover:bg-gray-800 rounded">
                                <strong>B</strong>
                            </button>
                            <button className="px-3 py-1 text-sm hover:bg-gray-200 dark:hover:bg-gray-800 rounded">
                                <em>I</em>
                            </button>
                            <button className="px-3 py-1 text-sm hover:bg-gray-200 dark:hover:bg-gray-800 rounded">
                                <u>U</u>
                            </button>
                            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
                            <button className="px-3 py-1 text-sm hover:bg-gray-200 dark:hover:bg-gray-800 rounded">
                                <LinkIcon className="w-4 h-4" />
                            </button>
                            <button className="px-3 py-1 text-sm hover:bg-gray-200 dark:hover:bg-gray-800 rounded">
                                <ImageIcon className="w-4 h-4" />
                            </button>
                        </div>
                        <textarea
                            value={value || ''}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder={`Enter ${field.label || field.name}...`}
                            rows={10}
                            className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border-0 focus:ring-0 resize-none"
                        />
                    </div>
                );

            case 'number':
                return (
                    <input
                        type="number"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}

                        placeholder={`Enter ${field.label || field.name}...`}
                        min={field.validation?.min}
                        max={field.validation?.max}
                        className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${error ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                            }`}
                    />
                );

            case 'boolean':
                return (
                    <label className="flex items-center gap-3 cursor-pointer">
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={value || false}
                                onChange={(e) => onChange(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                            {value ? 'Yes' : 'No'}
                        </span>
                    </label>
                );

            case 'date':
                return (
                    <div className="relative">
                        <input
                            type="date"
                            value={value || ''}
                            onChange={(e) => onChange(e.target.value)}

                            className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${error ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                                }`}
                        />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                );

            case 'datetime':
                return (
                    <div className="relative">
                        <input
                            type="datetime-local"
                            value={value || ''}
                            onChange={(e) => onChange(e.target.value)}

                            className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${error ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                                }`}
                        />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                );

            case 'enum':
                return (
                    <select
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}

                        className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${error ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                            }`}
                    >
                        <option value="">Select {field.label || field.name}...</option>
                        {field.options?.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );

            case 'media':
                return (
                    <div className="space-y-3">
                        {value && (
                            <div className="relative group">
                                <img
                                    src={value}
                                    alt="Preview"
                                    className="w-full h-48 object-cover rounded-xl border border-gray-200 dark:border-gray-700 bg-white"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                                <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full truncate max-w-[calc(100%-4rem)]">
                                    {typeof value === 'string' ? value.split('/').pop() : 'Media File'}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onChange(null)}
                                    className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                >
                                    Remove
                                </button>
                            </div>

                        )}
                        <button
                            type="button"
                            onClick={() => setMediaPickerOpen(true)}
                            className="w-full px-4 py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-indigo-500 transition-colors flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                        >
                            <ImageIcon className="w-7 h-7" />
                            <span className="text-sm font-medium">
                                {value ? 'Change Media' : 'Choose from Media Library'}
                            </span>
                        </button>
                        <MediaPickerModal
                            isOpen={mediaPickerOpen}
                            onClose={() => setMediaPickerOpen(false)}
                            onSelect={(url) => { onChange(url); setMediaPickerOpen(false); }}
                            accept="image"
                        />
                    </div>
                );

            case 'json':
                return (
                    <div className="relative">
                        <Code className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <textarea
                            value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                            onChange={(e) => {
                                try {
                                    const parsed = JSON.parse(e.target.value);
                                    onChange(parsed);
                                } catch {
                                    onChange(e.target.value);
                                }
                            }}
                            placeholder='{"key": "value"}'
                            rows={8}
                            className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none font-mono text-sm ${error ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                                }`}
                        />
                    </div>
                );

            case 'relation':
                return (
                    <div className="space-y-2">
                        {value && (
                            <div className="flex items-center justify-between px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-xl">
                                <span className="text-sm text-indigo-700 dark:text-indigo-300 truncate">
                                    Selected ID: <span className="font-mono text-xs">{value}</span>
                                </span>
                                <button
                                    type="button"
                                    onClick={() => onChange(null)}
                                    className="text-indigo-400 hover:text-red-500 ml-2 flex-shrink-0 text-xs"
                                >
                                    Remove
                                </button>
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={() => setRefPickerOpen(true)}
                            className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border rounded-xl text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                                error ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                            }`}
                        >
                            <span className="text-gray-500 dark:text-gray-400 text-sm">
                                {value ? 'Change reference...' : `Select ${field.label || field.name}...`}
                            </span>
                        </button>
                        <ReferencePickerModal
                            isOpen={refPickerOpen}
                            onClose={() => setRefPickerOpen(false)}
                            onSelect={(id) => { onChange(id); setRefPickerOpen(false); }}
                            projectId={projectId || ''}
                            title={`Select ${field.label || field.name}`}
                        />
                    </div>
                );

            case 'array':
                return (
                    <div className="space-y-2">
                        {(value || []).map((item: any, index: number) => (
                            <div key={index} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={item}
                                    onChange={(e) => {
                                        const newValue = [...(value || [])];
                                        newValue[index] = e.target.value;
                                        onChange(newValue);
                                    }}
                                    className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newValue = (value || []).filter((_: any, i: number) => i !== index);
                                        onChange(newValue);
                                    }}
                                    className="px-3 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => onChange([...(value || []), ''])}
                            className="w-full px-4 py-2.5 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-indigo-500 transition-colors text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                        >
                            + Add Item
                        </button>
                    </div>
                );

            default:
                return (
                    <div className="px-4 py-8 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-center text-gray-500 dark:text-gray-400">
                        Field type "{field.type}" not yet implemented
                    </div>
                );
        }
    };

    return (
        <div className="space-y-2">
            <label className="flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
                <span>
                    {field.label || field.name}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                </span>
                
                {(field.type === 'text' || field.type === 'string' || field.type === 'richtext') && (
                    <button
                        type="button"
                        onClick={() => setAiDialogOpen(true)}
                        className="text-indigo-500 hover:text-indigo-600 flex items-center gap-1 text-xs transition-colors"
                    >
                        <Sparkles className="w-3 h-3" />
                        AI Generate
                    </button>
                )}
            </label>

            {renderField()}

            {/* AI Prompt Dialog */}
            <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-indigo-500" />
                            AI Content Generator
                        </DialogTitle>
                        <DialogDescription>
                            Tell the AI what to write for this "{field.label || field.name}" field.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="ai-content-prompt">What should the AI write?</Label>
                        <Textarea
                            id="ai-content-prompt"
                            placeholder="e.g., A professional welcome message for new users."
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            rows={4}
                            className="mt-2"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAiDialogOpen(false)} disabled={isGenerating}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleAIGenerate} 
                            disabled={!aiPrompt.trim() || isGenerating}
                            className="bg-gradient-to-r from-indigo-500 to-purple-500"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Writing...
                                </>
                            ) : (
                                <>
                                    <Wand2 className="w-4 h-4 mr-2" />
                                    Generate
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {error && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <span>⚠</span> {error}
                </p>
            )}

            {!error && field.validation && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    {field.validation.minLength && `Min length: ${field.validation.minLength}`}
                    {field.validation.maxLength && ` • Max length: ${field.validation.maxLength}`}
                    {field.validation.min !== undefined && `Min: ${field.validation.min}`}
                    {field.validation.max !== undefined && ` • Max: ${field.validation.max}`}
                </p>
            )}
        </div>
    );
}

