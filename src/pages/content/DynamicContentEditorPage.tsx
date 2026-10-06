import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Clock, Eye, Layers, Sparkles } from 'lucide-react';
import { contentTypeService, ContentType } from '@/services/contentTypeService';
import { contentService, Content } from '@/services/contentService';
import { DynamicContentEditorSkeleton } from '@/components/skeletons';
import { DynamicFormBuilder } from '@/components/content-editor';
import { VersionHistory } from '@/components/versions';
import { ContentSeoAnalyzer } from '@/components/seo/ContentSeoAnalyzer';
import { ContentWorkflowPanel } from '@/components/workflows/ContentWorkflowPanel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';

export function DynamicContentEditorPage() {
    const navigate = useNavigate();
    const { projectId, contentTypeId, contentId } = useParams<{
        projectId: string;
        contentTypeId: string;
        contentId?: string;
    }>();

    const [contentType, setContentType] = useState<ContentType | null>(null);
    const [content, setContent] = useState<Content | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'editor' | 'workflow' | 'versions' | 'seo'>('editor');
    const isEditMode = !!contentId && contentId !== 'new';

    useEffect(() => {
        loadData();
    }, [contentTypeId, contentId]);

    const loadData = async () => {
        if (!contentTypeId || !projectId) return;

        try {
            setLoading(true);

            // Load content type
            const ctData = await contentTypeService.getContentType(contentTypeId);
            setContentType(ctData);

            // Load content if editing
            if (isEditMode && contentId) {
                const contentData = await contentService.getContentById(contentId);
                setContent(contentData);
            }
        } catch (error) {
            console.error('Failed to load data:', error);
            toast.error('Failed to load content. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (data: Record<string, any>) => {
        if (!contentType || !projectId) return;

        try {
            if (isEditMode && contentId) {
                await contentService.updateContent(contentId, {
                    data,
                });
                toast.success('Content updated successfully');
            } else {
                await contentService.createContent({
                    projectId,
                    contentTypeId: contentType._id!,
                    data,
                    status: 'draft',
                });
                toast.success('Content created successfully');
            }
            navigate(`/dashboard/project/${projectId}/content/${contentTypeId}`);
        } catch (error) {
            console.error('Failed to save content:', error);
            toast.error('Failed to save content');
            throw error;
        }
    };

    const handleCancel = () => {
        navigate(`/dashboard/project/${projectId}/content/${contentTypeId}`);
    };

    if (loading) {
        return <DynamicContentEditorSkeleton />;
    }

    if (!contentType) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-12 text-center max-w-lg mx-auto">
                <Layers className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Content Model Not Found
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Unable to find schema definition for this content type.
                </p>
                <Button
                    onClick={() => navigate(`/dashboard/project/${projectId}/content-types`)}
                >
                    View All Content Models
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCancel}
                        aria-label="Back to entries"
                        className="h-9 w-9 text-gray-500 hover:text-gray-900 dark:hover:text-white"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                                {isEditMode ? 'Edit' : 'Create'} {contentType.displayName}
                            </h1>
                            {isEditMode && content && (
                                <Badge
                                    variant="outline"
                                    className={`text-[10px] uppercase font-normal ${
                                        content.status === 'published'
                                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                            : content.status === 'draft'
                                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                                : ''
                                    }`}
                                >
                                    {content.status}
                                </Badge>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {isEditMode ? `Updating record for ${contentType.displayName}` : `Add a new record based on the ${contentType.displayName} schema`}
                        </p>
                    </div>
                </div>

                {isEditMode && content && (
                    <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                        <span className="font-mono">ID: {content._id?.substring(0, 8)}...</span>
                        <span>Updated {new Date(content.updatedAt!).toLocaleDateString()}</span>
                    </div>
                )}
            </div>

            {/* Edit Tabs (if in edit mode) */}
            {isEditMode && contentId ? (
                <div className="space-y-6">
                    <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-px">
                        {[
                            { key: 'editor', label: 'Editor' },
                            { key: 'workflow', label: 'Workflow & Approvals' },
                            { key: 'versions', label: 'Version History' },
                            { key: 'seo', label: 'SEO Analyzer' },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key as any)}
                                className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 -mb-px cursor-pointer ${
                                    activeTab === tab.key
                                        ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-transparent'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Views */}
                    {activeTab === 'editor' ? (
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/80 dark:border-gray-800 p-6 lg:p-8 shadow-sm">
                            <DynamicFormBuilder
                                contentType={contentType}
                                initialData={content || undefined}
                                onSave={handleSave}
                                onCancel={handleCancel}
                            />
                        </div>
                    ) : activeTab === 'workflow' ? (
                        <ContentWorkflowPanel
                            contentId={contentId}
                            projectId={projectId!}
                            contentStatus={content?.status}
                            onContentUpdated={loadData}
                        />
                    ) : activeTab === 'versions' ? (
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/80 dark:border-gray-800 p-6 lg:p-8 shadow-sm">
                            <VersionHistory
                                contentId={contentId}
                                onRestore={loadData}
                            />
                        </div>
                    ) : (
                        <div className="bg-transparent">
                            <ContentSeoAnalyzer
                                projectId={projectId!}
                                contentId={contentId!}
                            />
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/80 dark:border-gray-800 p-6 lg:p-8 shadow-sm">
                    <DynamicFormBuilder
                        contentType={contentType}
                        initialData={content || undefined}
                        onSave={handleSave}
                        onCancel={handleCancel}
                    />
                </div>
            )}
        </div>
    );
}

export default DynamicContentEditorPage;
