import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Clock, Eye } from 'lucide-react';
import { contentTypeService, ContentType } from '@/services/contentTypeService';
import { contentService, Content } from '@/services/contentService';
import { DynamicContentEditorSkeleton } from '@/components/skeletons';
import { DynamicFormBuilder } from '@/components/content-editor';
import { VersionHistory } from '@/components/versions';
import { ContentSeoAnalyzer } from '@/components/seo/ContentSeoAnalyzer';
import { ContentWorkflowPanel } from '@/components/workflows/ContentWorkflowPanel';
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

    const handleSave = async (data: Record<string, any>, status: 'draft' | 'published') => {
        if (!contentType || !projectId) return;

        try {
            const payload = {
                contentTypeId: contentType._id!,
                projectId,
                data,
                status,
            };

            if (isEditMode && contentId) {
                await contentService.updateContent(contentId, payload);
                toast.success(status === 'published' ? 'Content published successfully!' : 'Draft saved successfully!');
            } else {
                const newContent = await contentService.createContent(payload);
                toast.success(status === 'published' ? 'Content published!' : 'Draft saved!');
                // Navigate to edit mode after creating
                navigate(`/dashboard/project/${projectId}/content/${contentTypeId}/${newContent._id}`);
            }
        } catch (error: any) {
            console.error('Failed to save content:', error);
            toast.error(error.response?.data?.message || 'Failed to save content. Please try again.');
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
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Content Type Not Found
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        The content type you're looking for doesn't exist.
                    </p>
                    <button
                        onClick={() => navigate(`/dashboard/project/${projectId}/content-types`)}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all"
                    >
                        Go to Content Types
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-6 py-6">
                    <div className="flex items-center gap-4 mb-4">
                        <button
                            onClick={handleCancel}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                {isEditMode ? 'Edit' : 'Create'} {contentType.displayName}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                {isEditMode ? 'Update your content' : 'Create new content'}
                            </p>
                        </div>
                    </div>

                    {/* Content Info */}
                    {isEditMode && content && (
                        <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                <span>ID: {content._id}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>
                                    Updated {new Date(content.updatedAt!).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Eye className="w-4 h-4" />
                                <span className={`px-2 py-0.5 rounded ${content.status === 'published'
                                    ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                                    : content.status === 'draft'
                                        ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'
                                        : 'bg-gray-100 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400'
                                    }`}>
                                    {content.status}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto px-6 py-8">
                {isEditMode && contentId ? (
                    <div className="space-y-6">
                        {/* Tabs */}
                        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => setActiveTab('editor')}
                                className={`px-4 py-2 font-medium transition-colors ${activeTab === 'editor'
                                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                Editor
                            </button>
                            <button
                                onClick={() => setActiveTab('workflow')}
                                className={`px-4 py-2 font-medium transition-colors ${activeTab === 'workflow'
                                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                Workflow & Approvals
                            </button>
                            <button
                                onClick={() => setActiveTab('versions')}
                                className={`px-4 py-2 font-medium transition-colors ${activeTab === 'versions'
                                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                Version History
                            </button>
                            <button
                                onClick={() => setActiveTab('seo')}
                                className={`px-4 py-2 font-medium transition-colors ${activeTab === 'seo'
                                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                SEO Analyzer
                            </button>
                        </div>

                        {/* Tab Content */}
                        {activeTab === 'editor' ? (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
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
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
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
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
                        <DynamicFormBuilder
                            contentType={contentType}
                            initialData={content || undefined}
                            onSave={handleSave}
                            onCancel={handleCancel}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
