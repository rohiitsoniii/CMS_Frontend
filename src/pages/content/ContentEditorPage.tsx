import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    ArrowLeft,
    Save,
    Eye,
    Send,
    History,
    Loader2,
    Tag,
    CheckCircle2,
    XCircle,
    Sparkles,
    MessageSquare,
    BarChart3,
} from 'lucide-react';


import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { contentAPI, projectAPI, workflowAPI, aiAPI } from '@/services/api';
import { DynamicContentEditorSkeleton } from '@/components/skeletons';
import { toast } from 'react-hot-toast'; import { ScheduleDialog } from '@/components/schedule/ScheduleDialog';

import { CodeSnippetViewer } from '@/components/integration/CodeSnippetViewer';
import { Code } from 'lucide-react';
import { SEOAnalyzer } from '@/components/seo/SEOAnalyzer';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { useCollaboration } from '@/hooks/useCollaboration';
import { CollaboratorAvatars } from '@/components/ui/CollaboratorAvatars';
import SerpPreviewCard from '@/components/seo/SerpPreviewCard';



const contentSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    slug: z.string().optional(),
    type: z.string().min(1, 'Content type is required'),
    status: z.enum(['draft', 'published', 'scheduled', 'archived']),
    tags: z.string().optional(),
    category: z.string().optional(),
});

type ContentForm = z.infer<typeof contentSchema>;

const contentTypes = [
    { value: 'hero_section', label: 'Hero Section', fields: ['title', 'subtitle', 'background_image', 'cta_primary_text', 'cta_primary_link', 'cta_secondary_text', 'cta_secondary_link'] },
    { value: 'navigation', label: 'Navigation Menu', fields: ['logo', 'items'] },
    { value: 'blog_post', label: 'Blog Post', fields: ['title', 'excerpt', 'content', 'featured_image', 'author'] },
    { value: 'faq', label: 'FAQ', fields: ['items'] },
    { value: 'testimonials', label: 'Testimonials', fields: ['items'] },
    { value: 'footer', label: 'Footer', fields: ['copyright', 'links', 'social'] },
    { value: 'gallery', label: 'Gallery', fields: ['images'] },
    { value: 'cta', label: 'Call to Action', fields: ['title', 'description', 'button_text', 'button_link'] },
    { value: 'custom', label: 'Custom Block', fields: [] },
];

export default function ContentEditorPage() {
    const { type: urlType, id, projectId } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);

    // Fetch project settings (for preview URL)
    const { data: project } = useQuery({
        queryKey: ['project', projectId],
        queryFn: async () => {
            if (!projectId) return null;
            const response = await projectAPI.getById(projectId);
            return response.data.data.project;
        },
        enabled: !!projectId,
    });

    const [contentData, setContentData] = useState<Record<string, unknown>>({});
    const [activeTab, setActiveTab] = useState('content');
    const [isIntegrationOpen, setIsIntegrationOpen] = useState(false);
    const [workflowComment, setWorkflowComment] = useState('');

    // Collaboration hook logic
    const { editors, sendUpdate } = useCollaboration({
        contentId: id,
        enabled: isEditing
    });


    const {
        register,
        handleSubmit,
        control,
        watch,
        reset,
        formState: { errors },
    } = useForm<ContentForm>({
        resolver: zodResolver(contentSchema),
        defaultValues: {
            name: '',
            slug: '',
            type: urlType || 'hero_section',
            status: 'draft',
            tags: '',
            category: '',
        },
    });

    const selectedType = watch('type');

    // Fetch existing content if editing
    const { data: existingContent, isLoading } = useQuery({
        queryKey: ['content', id],
        queryFn: async () => {
            if (!projectId || !id) return null;
            const response = await contentAPI.getById(projectId, id);
            return response.data.data.content;
        },
        enabled: isEditing,
    });

    // Fetch content analytics
    const { data: contentStats } = useQuery({
        queryKey: ['content-stats', id],
        queryFn: async () => {
            if (!id) return null;
            try {
                // Mocking response structure if backend endpoint isn't fully implemented yet
                // In a real scenario, this would come from analyticsAPI.getContentStats(id)
                return {
                    views: Math.floor(Math.random() * 1000),
                    lastViewed: new Date().toISOString(),
                    engagement: '85%'
                };
            } catch {
                return null;
            }
        },
        enabled: isEditing,
    });

    // Fetch workflow state
    const { data: workflowState, refetch: refetchWorkflow } = useQuery({
        queryKey: ['workflow', id],
        queryFn: async () => {
            if (!id) return null;
            try {
                const response = await workflowAPI.getState(id);
                return response.data.data.workflowState;
            } catch {
                return null;
            }
        },
        enabled: isEditing,
    });

    // Fetch available workflows
    const { data: workflows } = useQuery({
        queryKey: ['workflows'],
        queryFn: async () => {
            const response = await workflowAPI.getAll();
            return response.data.data.workflows;
        },
        enabled: isEditing && !workflowState,
    });

    // Workflow mutations
    const startWorkflowMutation = useMutation({
        mutationFn: (workflowId: string) => workflowAPI.start(id!, workflowId),
        onSuccess: () => {
            refetchWorkflow();
            toast.success('Workflow started');
        }
    });

    const advanceWorkflowMutation = useMutation({
        mutationFn: (comment?: string) => workflowAPI.advance(id!, comment),
        onSuccess: () => {
            refetchWorkflow();
            toast.success('Workflow advanced');
            setWorkflowComment('');
        }
    });

    const rejectWorkflowMutation = useMutation({
        mutationFn: (comment?: string) => workflowAPI.reject(id!, { comment }),
        onSuccess: () => {
            refetchWorkflow();
            toast.success('Workflow rejected');
            setWorkflowComment('');
        }
    });

    // AI Mutations
    const improveContentMutation = useMutation({
        mutationFn: (content: string) => aiAPI.improveContent(content),
        onSuccess: (response) => {
            // If it's a blog post, try to update content
            if (selectedType === 'blog_post') {
                handleContentDataChange('content', response.data.data.content || response.data.data);
            }
            toast.success('Content improved by AI');
        }
    });


    // Set form values when content is loaded
    useEffect(() => {
        if (existingContent) {
            reset({
                name: existingContent.name,
                slug: existingContent.slug,
                type: existingContent.type,
                status: existingContent.status,
                tags: existingContent.tags?.join(', ') || '',
                category: existingContent.category || '',
            });
            setContentData(existingContent.data || {});
        }
    }, [existingContent, reset]);

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (data: { type: string; name: string; slug?: string; data: Record<string, unknown>; status: string; tags?: string[]; category?: string }) =>
            contentAPI.create(existingContent?.custom?.projectId || 'Unknown', data),
        onSuccess: () => {
            navigate('/dashboard/content');
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: (data: { name?: string; slug?: string; data?: Record<string, unknown>; status?: string; tags?: string[]; category?: string }) =>
            contentAPI.update(existingContent?.custom?.projectId || 'Unknown', id!, data),
        onSuccess: () => {
            navigate('/dashboard/content');
        },
    });

    // Publish mutation
    const publishMutation = useMutation({
        mutationFn: () => contentAPI.publish(existingContent?.custom?.projectId || 'Unknown', id!),
        onSuccess: () => {
            navigate('/dashboard/content');
        },
    });

    const onSubmit = async (formData: ContentForm) => {
        const payload = {
            type: formData.type,
            name: formData.name,
            slug: formData.slug || undefined,
            data: contentData,
            status: formData.status,
            tags: formData.tags?.split(',').map(t => t.trim()).filter(Boolean) || [],
            category: formData.category || undefined,
        };

        if (isEditing) {
            updateMutation.mutate(payload);
        } else {
            createMutation.mutate(payload);
        }
    };

    const handlePublish = () => {
        if (isEditing) {
            publishMutation.mutate();
        }
    };

    const handlePreview = async () => {
        if (!projectId || !id) return;
        try {
            const response = await projectAPI.getPreviewToken(projectId, id);
            const { url } = response.data.data;
            window.open(url, '_blank');
        } catch (error) {
            toast.error('Failed to generate preview token');
            console.error(error);
        }
    };

    const handleContentDataChange = (field: string, value: unknown) => {
        setContentData(prev => ({ ...prev, [field]: value }));
    };

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    if (isLoading) {
        return <DynamicContentEditorSkeleton />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link to="/dashboard/content">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {isEditing ? 'Edit Content' : 'Create Content'}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            {isEditing ? `Editing ${existingContent?.name}` : 'Create a new content item'}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-end sm:flex-row sm:items-center gap-4">
                    {isEditing && <CollaboratorAvatars editors={editors} />}
                    <div className="flex items-center gap-2">
                    {isEditing && (
                        <>
                            <ScheduleDialog
                                contentId={id!}
                                projectId={existingContent?.custom?.projectId || 'Unknown'}
                                contentTitle={existingContent?.name || ''}
                                contentType={existingContent?.type || ''}
                            />
                            <Button
                                variant="outline"
                                onClick={() => setIsIntegrationOpen(true)}
                                className="hidden sm:flex"
                            >
                                <Code className="w-4 h-4 mr-2" />
                                Integrate
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handlePreview}
                                disabled={!project?.settings?.previewUrl}
                                title={!project?.settings?.previewUrl ? "Preview URL not configured in Project Settings" : "Preview content"}
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                Preview
                            </Button>
                            <Button variant="outline" onClick={handlePublish} disabled={publishMutation.isPending}>
                                <Send className="w-4 h-4 mr-2" />
                                Publish
                            </Button>
                        </>
                    )}
                    <Button
                        variant="gradient"
                        onClick={handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                {isEditing ? 'Save Changes' : 'Create'}
                            </>
                        )}
                    </Button>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="content">Edit Content</TabsTrigger>
                            <TabsTrigger value="seo">SEO & Preview</TabsTrigger>
                        </TabsList>

                        <TabsContent value="content" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Content Details</CardTitle>
                                    <CardDescription>Basic information about your content</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Name *</Label>
                                            <Input
                                                id="name"
                                                placeholder="e.g., Homepage Hero"
                                                {...register('name')}
                                                className={errors.name ? 'border-red-500' : ''}
                                            />
                                            {errors.name && (
                                                <p className="text-xs text-red-500">{errors.name.message}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="slug">Slug</Label>
                                            <Input
                                                id="slug"
                                                placeholder="Auto-generated from name"
                                                {...register('slug')}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="type">Content Type *</Label>
                                        <Controller
                                            name="type"
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                    disabled={isEditing}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select content type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {contentTypes.map((type) => (
                                                            <SelectItem key={type.value} value={type.value}>
                                                                {type.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Dynamic Content Fields */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Content Data</CardTitle>
                                    <CardDescription>Configure the content for this {selectedType?.replace('_', ' ')}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {selectedType === 'hero_section' && (
                                        <>
                                            <div className="space-y-2">
                                                <Label>Title</Label>
                                                <Input
                                                    placeholder="Welcome to Our Site"
                                                    value={(contentData.title as string) || ''}
                                                    onChange={(e) => handleContentDataChange('title', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Subtitle</Label>
                                                <Textarea
                                                    placeholder="A compelling subtitle..."
                                                    value={(contentData.subtitle as string) || ''}
                                                    onChange={(e) => handleContentDataChange('subtitle', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Background Image URL</Label>
                                                <Input
                                                    placeholder="https://..."
                                                    value={(contentData.background_image as string) || ''}
                                                    onChange={(e) => handleContentDataChange('background_image', e.target.value)}
                                                />
                                            </div>
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label>Primary CTA Text</Label>
                                                    <Input
                                                        placeholder="Get Started"
                                                        value={((contentData.cta_primary as Record<string, string>)?.text) || ''}
                                                        onChange={(e) => handleContentDataChange('cta_primary', {
                                                            ...(contentData.cta_primary as Record<string, string> || {}),
                                                            text: e.target.value
                                                        })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Primary CTA Link</Label>
                                                    <Input
                                                        placeholder="/signup"
                                                        value={((contentData.cta_primary as Record<string, string>)?.link) || ''}
                                                        onChange={(e) => handleContentDataChange('cta_primary', {
                                                            ...(contentData.cta_primary as Record<string, string> || {}),
                                                            link: e.target.value
                                                        })}
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {selectedType === 'blog_post' && (
                                        <>
                                            <div className="space-y-2">
                                                <Label>Blog Title</Label>
                                                <Input
                                                    placeholder="Amazing Blog Post Title"
                                                    value={(contentData.title as string) || ''}
                                                    onChange={(e) => handleContentDataChange('title', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Excerpt</Label>
                                                <Textarea
                                                    placeholder="A brief summary of the blog post..."
                                                    value={(contentData.excerpt as string) || ''}
                                                    onChange={(e) => handleContentDataChange('excerpt', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Content</Label>
                                                <RichTextEditor
                                                    value={(contentData.content as string) || ''}
                                                    onChange={(value) => {
                                                        handleContentDataChange('content', value);
                                                        sendUpdate({ content: value });
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Featured Image URL</Label>
                                                <Input
                                                    placeholder="https://..."
                                                    value={(contentData.featured_image as string) || ''}
                                                    onChange={(e) => handleContentDataChange('featured_image', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Author</Label>
                                                <Input
                                                    placeholder="John Doe"
                                                    value={(contentData.author as string) || ''}
                                                    onChange={(e) => handleContentDataChange('author', e.target.value)}
                                                />
                                            </div>
                                        </>
                                    )}

                                    {selectedType === 'faq' && (
                                        <div className="space-y-4">
                                            <p className="text-sm text-gray-500">FAQ items (JSON format)</p>
                                            <Textarea
                                                placeholder='[{"question": "What is this?", "answer": "This is..."}]'
                                                className="min-h-[200px] font-mono text-sm"
                                                value={JSON.stringify(contentData.items || [], null, 2)}
                                                onChange={(e) => {
                                                    try {
                                                        const parsed = JSON.parse(e.target.value);
                                                        handleContentDataChange('items', parsed);
                                                    } catch {
                                                        // Invalid JSON, keep as is
                                                    }
                                                }}
                                            />
                                        </div>
                                    )}

                                    {selectedType === 'navigation' && (
                                        <>
                                            <div className="space-y-2">
                                                <Label>Logo URL</Label>
                                                <Input
                                                    placeholder="https://..."
                                                    value={(contentData.logo as string) || ''}
                                                    onChange={(e) => handleContentDataChange('logo', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Navigation Items (JSON)</Label>
                                                <Textarea
                                                    placeholder='[{"label": "Home", "link": "/"}]'
                                                    className="min-h-[150px] font-mono text-sm"
                                                    value={JSON.stringify(contentData.items || [], null, 2)}
                                                    onChange={(e) => {
                                                        try {
                                                            const parsed = JSON.parse(e.target.value);
                                                            handleContentDataChange('items', parsed);
                                                        } catch {
                                                            // Invalid JSON
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </>
                                    )}

                                    {(selectedType === 'custom' || selectedType === 'cta' || selectedType === 'footer' || selectedType === 'testimonials' || selectedType === 'gallery') && (
                                        <div className="space-y-2">
                                            <Label>Content Data (JSON)</Label>
                                            <Textarea
                                                placeholder='{"key": "value"}'
                                                className="min-h-[300px] font-mono text-sm"
                                                value={JSON.stringify(contentData, null, 2)}
                                                onChange={(e) => {
                                                    try {
                                                        const parsed = JSON.parse(e.target.value);
                                                        setContentData(parsed);
                                                    } catch {
                                                        // Invalid JSON
                                                    }
                                                }}
                                            />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="seo" className="space-y-6">
                            <SerpPreviewCard 
                                title={(contentData.title as string) || watch('name')}
                                description={(contentData.excerpt as string) || (contentData.description as string) || ''}
                                url={`${project?.settings?.previewUrl || 'https://yourwebsite.com'}/${watch('slug') || id}`}
                            />
                            <SEOAnalyzer
                                content={JSON.stringify(contentData)}
                                title={(contentData.title as string) || watch('name')}
                                slug={watch('slug') || ''}
                                metaDescription={(contentData.excerpt as string) || (contentData.description as string) || ''}
                            />
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Status Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Controller
                                name="status"
                                control={control}
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="published">Published</SelectItem>
                                            <SelectItem value="scheduled">Scheduled</SelectItem>
                                            <SelectItem value="archived">Archived</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />

                            {isEditing && existingContent && (
                                <div className="text-sm text-gray-500 space-y-1">
                                    <p>Created: {new Date(existingContent.createdAt).toLocaleDateString()}</p>
                                    <p>Updated: {new Date(existingContent.updatedAt).toLocaleDateString()}</p>
                                    {existingContent.publishedAt && (
                                        <p>Published: {new Date(existingContent.publishedAt).toLocaleDateString()}</p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Taxonomy Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Organization</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="tags">
                                    <Tag className="w-4 h-4 inline mr-1" />
                                    Tags
                                </Label>
                                <Input
                                    id="tags"
                                    placeholder="tag1, tag2, tag3"
                                    {...register('tags')}
                                />
                                <p className="text-xs text-gray-500">Separate tags with commas</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Input
                                    id="category"
                                    placeholder="e.g., Marketing"
                                    {...register('category')}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Version History (if editing) */}
                    {isEditing && existingContent?.currentVersion > 1 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    <History className="w-4 h-4 inline mr-1" />
                                    Version History
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-500">
                                    Current version: {existingContent.currentVersion}
                                </p>
                                <Button variant="link" className="px-0 text-sm">
                                    View all versions →
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Workflow Card (Phase 4) */}
                    {isEditing && (
                        <Card className="border-indigo-100 dark:border-indigo-900/50 overflow-hidden shadow-sm">
                            <div className="bg-indigo-50/50 dark:bg-indigo-900/10 px-4 py-2 border-b border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between">
                                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Editorial Workflow</span>
                                {workflowState ? (
                                    <Badge variant="outline" className="bg-white dark:bg-gray-800 text-indigo-600 border-indigo-200">
                                        {workflowState.currentStepName}
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary">No Workflow</Badge>
                                )}
                            </div>
                            <CardContent className="p-4 space-y-4">
                                {workflowState ? (
                                    <>
                                        <div className="space-y-2">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Active Workflow: <span className="font-medium text-gray-900 dark:text-white">{workflowState.workflowName}</span>
                                            </p>
                                            <div className="flex gap-2">
                                                <Button 
                                                    size="sm" 
                                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                                                    onClick={() => advanceWorkflowMutation.mutate(workflowComment)}
                                                    disabled={advanceWorkflowMutation.isPending}
                                                >
                                                    <CheckCircle2 className="w-4 h-4 mr-1" />
                                                    Approve
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                                                    onClick={() => rejectWorkflowMutation.mutate(workflowComment)}
                                                    disabled={rejectWorkflowMutation.isPending}
                                                >
                                                    <XCircle className="w-4 h-4 mr-1" />
                                                    Reject
                                                </Button>
                                            </div>
                                            <Textarea 
                                                placeholder="Add a comment..." 
                                                className="text-xs min-h-[60px]"
                                                value={workflowComment}
                                                onChange={(e) => setWorkflowComment(e.target.value)}
                                            />
                                        </div>
                                        
                                        <div className="pt-2 border-t">
                                            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">History</h4>
                                            <div className="space-y-3">
                                                {workflowState.history?.slice(-3).reverse().map((entry: any, i: number) => (
                                                    <div key={i} className="text-xs flex gap-2">
                                                        <div className="mt-1">
                                                            {entry.action === 'advance' ? (
                                                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                                            ) : (
                                                                <XCircle className="w-3 h-3 text-red-500" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900 dark:text-white">
                                                                {entry.action === 'advance' ? 'Approved' : 'Rejected'} at {entry.stepName}
                                                            </p>
                                                            {entry.comment && <p className="text-gray-500 italic">"{entry.comment}"</p>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-3">
                                        <p className="text-sm text-gray-500">Enable a workflow to manage this content's lifecycle.</p>
                                        <Select onValueChange={(val) => startWorkflowMutation.mutate(val)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Workflow..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {workflows?.map((w: any) => (
                                                    <SelectItem key={w._id} value={w._id}>{w.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* AI Magic Wand Card (Phase 5) */}
                    <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none shadow-lg">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-yellow-300" />
                                AI Assistant
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-xs text-indigo-100">
                                Stuck on copy? Let AI improve your content or generate ideas based on your current fields.
                            </p>
                            <div className="space-y-2">
                                <Button 
                                    variant="secondary" 
                                    size="sm" 
                                    className="w-full text-indigo-700 font-bold"
                                    onClick={() => improveContentMutation.mutate(JSON.stringify(contentData))}
                                    disabled={improveContentMutation.isPending}
                                >
                                    {improveContentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                                    Optimize Content
                                </Button>
                                <Button variant="outline" size="sm" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20">
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Ask AI...
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Content Insights Card (Phase 6) */}
                    {isEditing && (
                        <Card className="bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                    <BarChart3 className="w-4 h-4" />
                                    Content Insights
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-2xl font-bold">{contentStats?.views || 0}</p>
                                        <p className="text-[10px] uppercase text-gray-500 font-semibold">Total Views</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-2xl font-bold text-emerald-500">{contentStats?.engagement || '0%'}</p>
                                        <p className="text-[10px] uppercase text-gray-500 font-semibold">Engagement</p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-[11px] text-gray-500">
                                    <span>Last viewed: {contentStats ? new Date(contentStats.lastViewed).toLocaleDateString() : 'Never'}</span>
                                    <Button variant="link" className="h-auto p-0 text-[11px]">Details</Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>


            </div>

            <CodeSnippetViewer
                projectId={projectId!}
                contentId={id}
                contentType={selectedType || 'content'}
                isOpen={isIntegrationOpen}
                onOpenChange={setIsIntegrationOpen}
            />
        </div>
    );
}
