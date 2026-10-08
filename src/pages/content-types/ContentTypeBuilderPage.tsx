import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { contentTypeService } from '@/services/contentTypeService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Plus,
    Trash2,
    GripVertical,
    Save,
    ArrowLeft,
    Type,
    Hash,
    Calendar,
    ToggleLeft,
    FileText,
    Image,
    Link,
    List,
    Sparkles,
    Loader2,
    Wand2
} from 'lucide-react';

import toast from 'react-hot-toast';
import { DragDropContext, Droppable, Draggable, DroppableProvided, DraggableProvided } from '@hello-pangea/dnd';
import { aiAPI } from '@/services/api';
import { ContentTypeBuilderSkeleton } from '@/components/skeletons';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';


const FIELD_TYPES = [
    { value: 'text', label: 'Text', icon: Type },
    { value: 'textarea', label: 'Long Text', icon: FileText },
    { value: 'number', label: 'Number', icon: Hash },
    { value: 'boolean', label: 'Boolean', icon: ToggleLeft },
    { value: 'date', label: 'Date', icon: Calendar },
    { value: 'media', label: 'Media', icon: Image },
    { value: 'url', label: 'URL', icon: Link },
    { value: 'select', label: 'Select', icon: List },
    { value: 'richtext', label: 'Rich Text', icon: FileText },
    { value: 'json', label: 'JSON', icon: FileText },
];

interface Field {
    id: string;
    name: string;
    label: string;
    type: string;
    required: boolean;
    unique: boolean;
    defaultValue?: any;
    validation?: {
        min?: number;
        max?: number;
        pattern?: string;
        options?: string[];
    };
}

export function ContentTypeBuilderPage() {
    // Route param is :contentTypeId (App.tsx); accepts an _id or apiId
    const { projectId, contentTypeId: typeId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [icon, setIcon] = useState('📄');
    const [fields, setFields] = useState<Field[]>([]);
    
    // AI Schema state
    const [aiDialogOpen, setAiDialogOpen] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);


    // Fetch existing content type if editing
    const { data: contentType, isLoading } = useQuery({
        queryKey: ['content-type', projectId, typeId],
        queryFn: async () => {
            if (!typeId) return null;
            return contentTypeService.getContentType(typeId);
        },
        enabled: !!typeId,
    });

    // Set form data when content type loads
    React.useEffect(() => {
        if (contentType) {
            setName(contentType.name);
            setDescription(contentType.description || '');
            setIcon((contentType as { icon?: string }).icon || '📄');
            setFields((contentType.fields || []).map((f, i) => ({
                ...f,
                id: (f as { id?: string }).id || `field_${i}_${f.name}`,
            })) as Field[]);
        }
    }, [contentType]);

    // Save mutation
    const saveMutation = useMutation({
        mutationFn: async (data: any) => {
            return typeId
                ? contentTypeService.updateContentType(typeId, data)
                : contentTypeService.createContentType({ ...data, projectId });
        },
        onSuccess: () => {
            toast.success(typeId ? 'Content type updated' : 'Content type created');
            queryClient.invalidateQueries({ queryKey: ['content-types', projectId] });
            navigate(`/dashboard/project/${projectId}/content-types`);
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || err?.response?.data?.error || 'Failed to save content type');
        },
    });

    const handleAddField = () => {
        const newField: Field = {
            id: `field_${Date.now()}`,
            name: '',
            label: '',
            type: 'text',
            required: false,
            unique: false,
        };
        setFields([...fields, newField]);
    };

    const handleRemoveField = (id: string) => {
        setFields(fields.filter(f => f.id !== id));
    };

    const handleFieldChange = (id: string, key: string, value: any) => {
        setFields(fields.map(f => f.id === id ? { ...f, [key]: value } : f));
    };

    const handleDragEnd = (result: any) => {
        if (!result.destination) return;

        const items = Array.from(fields);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setFields(items);
    };

    const handleSave = () => {
        if (!name.trim()) {
            toast.error('Content type name is required');
            return;
        }

        if (fields.length === 0) {
            toast.error('Add at least one field');
            return;
        }

        const invalidFields = fields.filter(f => !f.name.trim() || !f.label.trim());
        if (invalidFields.length > 0) {
            toast.error('All fields must have a name and label');
            return;
        }

        saveMutation.mutate({
            name,
            description,
            icon,
            fields,
        });
    };

    const handleAIGenerate = async () => {
        if (!aiPrompt.trim()) return;

        setIsGenerating(true);
        try {
            const response = await aiAPI.generateSchema(aiPrompt);
            const generatedFields = response.data.data.fields.map((f: any) => ({
                id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: f.name,
                label: f.displayName,
                type: f.type,
                required: !!f.required,
                unique: false,
                validation: {
                    helpText: f.helpText
                }
            }));

            setFields([...fields, ...generatedFields]);
            setAiDialogOpen(false);
            setAiPrompt('');
            toast.success(`Generated ${generatedFields.length} fields!`);
        } catch (error: any) {
            console.error('AI Generation error:', error);
            toast.error('Failed to generate fields. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };


    if (isLoading) {
        return <ContentTypeBuilderSkeleton />;
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <Button
                    variant="ghost"
                    onClick={() => navigate(`/dashboard/projects/${projectId}/content-types`)}
                    className="mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Content Types
                </Button>
                <h1 className="text-3xl font-bold">
                    {typeId ? 'Edit Content Type' : 'Create Content Type'}
                </h1>
                <p className="text-gray-600 mt-2">
                    Define the structure and fields for your content
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Form */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
                        <div className="space-y-4">
                            <div>
                                <Label>Name *</Label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Blog Post, Product, Author"
                                />
                            </div>
                            <div>
                                <Label>Description</Label>
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe what this content type is for..."
                                    rows={3}
                                />
                            </div>
                            <div>
                                <Label>Icon (Emoji)</Label>
                                <Input
                                    value={icon}
                                    onChange={(e) => setIcon(e.target.value)}
                                    placeholder="📄"
                                    maxLength={2}
                                    className="w-20"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Fields */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">Fields</h2>
                            <div className="flex gap-2">
                                <Button 
                                    onClick={() => setAiDialogOpen(true)} 
                                    variant="outline" 
                                    size="sm"
                                    className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                                >
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    AI Generate
                                </Button>
                                <Button onClick={handleAddField} size="sm">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Field
                                </Button>
                            </div>
                        </div>


                        {fields.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed rounded-lg">
                                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 mb-4">No fields yet</p>
                                <Button onClick={handleAddField} variant="outline">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Your First Field
                                </Button>
                            </div>
                        ) : (
                            <DragDropContext onDragEnd={handleDragEnd}>
                                <Droppable droppableId="fields">
                                    {(provided: DroppableProvided) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className="space-y-4"
                                        >
                                            {fields.map((field, index) => {

                                                return (
                                                    <Draggable key={field.id} draggableId={field.id} index={index}>
                                                        {(provided: DraggableProvided) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                className="border rounded-lg p-4 bg-white dark:bg-gray-900"
                                                            >
                                                                <div className="flex items-start gap-4">
                                                                    {/* Drag Handle */}
                                                                    <div
                                                                        {...provided.dragHandleProps}
                                                                        className="mt-2 cursor-move text-gray-400 hover:text-gray-600"
                                                                    >
                                                                        <GripVertical className="w-5 h-5" />
                                                                    </div>

                                                                    {/* Field Config */}
                                                                    <div className="flex-1 space-y-3">
                                                                        <div className="grid grid-cols-2 gap-3">
                                                                            <div>
                                                                                <Label className="text-xs">Field Name *</Label>
                                                                                <Input
                                                                                    value={field.name}
                                                                                    onChange={(e) => handleFieldChange(field.id, 'name', e.target.value)}
                                                                                    placeholder="e.g., title, author, price"
                                                                                    className="h-8"
                                                                                />
                                                                            </div>
                                                                            <div>
                                                                                <Label className="text-xs">Label *</Label>
                                                                                <Input
                                                                                    value={field.label}
                                                                                    onChange={(e) => handleFieldChange(field.id, 'label', e.target.value)}
                                                                                    placeholder="e.g., Title, Author, Price"
                                                                                    className="h-8"
                                                                                />
                                                                            </div>
                                                                        </div>

                                                                        <div className="grid grid-cols-2 gap-3">
                                                                            <div>
                                                                                <Label className="text-xs">Field Type</Label>
                                                                                <Select
                                                                                    value={field.type}
                                                                                    onValueChange={(value) => handleFieldChange(field.id, 'type', value)}
                                                                                >
                                                                                    <SelectTrigger className="h-8">
                                                                                        <SelectValue />
                                                                                    </SelectTrigger>
                                                                                    <SelectContent>
                                                                                        {FIELD_TYPES.map((type) => {
                                                                                            const Icon = type.icon;
                                                                                            return (
                                                                                                <SelectItem key={type.value} value={type.value}>
                                                                                                    <div className="flex items-center gap-2">
                                                                                                        <Icon className="w-4 h-4" />
                                                                                                        {type.label}
                                                                                                    </div>
                                                                                                </SelectItem>
                                                                                            );
                                                                                        })}
                                                                                    </SelectContent>
                                                                                </Select>
                                                                            </div>
                                                                            <div className="flex items-center gap-4 pt-5">
                                                                                <div className="flex items-center gap-2">
                                                                                    <Switch
                                                                                        checked={field.required}
                                                                                        onCheckedChange={(checked) => handleFieldChange(field.id, 'required', checked)}
                                                                                    />
                                                                                    <Label className="text-xs">Required</Label>
                                                                                </div>
                                                                                <div className="flex items-center gap-2">
                                                                                    <Switch
                                                                                        checked={field.unique}
                                                                                        onCheckedChange={(checked) => handleFieldChange(field.id, 'unique', checked)}
                                                                                    />
                                                                                    <Label className="text-xs">Unique</Label>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Delete Button */}
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleRemoveField(field.id)}
                                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                );
                                            })}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        )}
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Preview */}
                    <Card className="p-6">
                        <h3 className="font-semibold mb-4">Preview</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="text-3xl">{icon}</div>
                                <div>
                                    <div className="font-medium">{name || 'Untitled'}</div>
                                    <div className="text-sm text-gray-500">
                                        {fields.length} field{fields.length !== 1 ? 's' : ''}
                                    </div>
                                </div>
                            </div>
                            {description && (
                                <p className="text-sm text-gray-600">{description}</p>
                            )}
                        </div>
                    </Card>

                    {/* Actions */}
                    <Card className="p-6">
                        <div className="space-y-3">
                            <Button
                                onClick={handleSave}
                                disabled={saveMutation.isPending}
                                className="w-full"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {saveMutation.isPending ? 'Saving...' : typeId ? 'Update' : 'Create'} Content Type
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => navigate(`/dashboard/projects/${projectId}/content-types`)}
                                className="w-full"
                            >
                                Cancel
                            </Button>
                        </div>
                    </Card>

                    {/* Field Types Reference */}
                    <Card className="p-6">
                        <h3 className="font-semibold mb-3 text-sm">Available Field Types</h3>
                        <div className="space-y-2">
                            {FIELD_TYPES.map((type) => {
                                const Icon = type.icon;
                                return (
                                    <div key={type.value} className="flex items-center gap-2 text-sm">
                                        <Icon className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-600">{type.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>
            </div>

            {/* AI Prompt Dialog */}
            <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-indigo-500" />
                            AI Schema Builder
                        </DialogTitle>
                        <DialogDescription>
                            Describe the content you want to manage, and AI will suggest the appropriate fields.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="ai-prompt">What kind of content are you building?</Label>
                        <Textarea
                            id="ai-prompt"
                            placeholder="e.g., A real estate listing with price, location, number of bedrooms, and agent details."
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
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Wand2 className="w-4 h-4 mr-2" />
                                    Generate Fields
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>

    );
}
