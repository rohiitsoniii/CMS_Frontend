import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Database, Calendar, Globe, GitBranch, Search, Filter, Boxes } from 'lucide-react';
import { contentTypeService, ContentType } from '@/services/contentTypeService';
import { ContentTypesListSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export function ContentTypesListPage() {
    const navigate = useNavigate();
    const { projectId } = useParams<{ projectId: string }>();
    const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterBy, setFilterBy] = useState<'all' | 'localized' | 'versioned'>('all');
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

    useEffect(() => {
        loadContentTypes();
    }, [projectId]);

    const loadContentTypes = async () => {
        if (!projectId) return;

        try {
            setLoading(true);
            const data = await contentTypeService.getContentTypes(projectId);
            setContentTypes(data);
        } catch (error) {
            console.error('Failed to load content types:', error);
            toast.error('Failed to load content models');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await contentTypeService.deleteContentType(id);
            setContentTypes(contentTypes.filter(ct => ct._id !== id));
            toast.success('Content model deleted successfully');
        } catch (error) {
            console.error('Failed to delete content type:', error);
            toast.error('Failed to delete content model');
        }
    };

    const filteredContentTypes = contentTypes.filter(ct => {
        const ctDisplay = ct.displayName || ct.name || '';
        const ctName = ct.name || ct.displayName || '';
        const matchesSearch = ctDisplay.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ctName.toLowerCase().includes(searchQuery.toLowerCase());

        if (filterBy === 'localized') return matchesSearch && ct.localization;
        if (filterBy === 'versioned') return matchesSearch && ct.versioning;
        return matchesSearch;
    });

    if (loading) {
        return <ContentTypesListSkeleton />;
    }

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
                        <Boxes className="w-7 h-7 text-indigo-500" />
                        Content Models
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Define schemas, custom field validations, and relationships for your API
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => navigate(`/dashboard/project/${projectId}/content-types/new`)}
                        className="shadow-sm"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Model
                    </Button>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200/80 dark:border-gray-800 shadow-sm">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search models by name or slug..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        aria-label="Search content models"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-gray-400"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400 shrink-0 hidden sm:block" />
                    <select
                        value={filterBy}
                        onChange={(e) => setFilterBy(e.target.value as any)}
                        aria-label="Filter content models"
                        className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-gray-700 dark:text-gray-200"
                    >
                        <option value="all">All Models ({contentTypes.length})</option>
                        <option value="localized">Localized Only</option>
                        <option value="versioned">Versioned Only</option>
                    </select>
                </div>
            </div>

            {/* Content Types Grid */}
            {filteredContentTypes.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-12 text-center">
                    <Database className="w-14 h-14 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {searchQuery ? 'No models match your search' : 'No content models defined yet'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                        {searchQuery
                            ? 'Try refining your query or resetting the filter options.'
                            : 'Content models allow you to design structured schemas for articles, products, authors, and custom API payloads.'
                        }
                    </p>
                    {!searchQuery && (
                        <Button
                            onClick={() => navigate(`/dashboard/project/${projectId}/content-types/new`)}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Your First Model
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredContentTypes.map((contentType) => (
                        <div
                            key={contentType._id}
                            className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200/80 dark:border-gray-800 p-5 hover:shadow-lg hover:border-indigo-500/30 transition-all cursor-pointer flex flex-col justify-between"
                            onClick={() => navigate(`/dashboard/project/${projectId}/content-types/${contentType._id}`)}
                        >
                            <div>
                                {/* Header */}
                                <div className="flex items-start justify-between gap-2 mb-3">
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                                            {contentType.displayName || contentType.name}
                                        </h3>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 font-mono mt-0.5 truncate">
                                            {contentType.name}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Edit ${contentType.displayName}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/dashboard/project/${projectId}/content-types/${contentType._id}/edit`);
                                            }}
                                            className="h-8 w-8 hover:text-indigo-600 dark:hover:text-indigo-400"
                                        >
                                            <Edit className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Delete ${contentType.displayName}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDeleteTarget({
                                                    id: contentType._id!,
                                                    name: contentType.displayName || contentType.name,
                                                });
                                            }}
                                            className="h-8 w-8 hover:text-red-600 dark:hover:text-red-400"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Description */}
                                {contentType.description && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                                        {contentType.description}
                                    </p>
                                )}
                            </div>

                            <div>
                                {/* Stats & Features */}
                                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-800">
                                    <span className="flex items-center gap-1 font-medium">
                                        <Database className="w-3.5 h-3.5 text-indigo-500" />
                                        {contentType.fields?.length || 0} fields
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        {contentType.localization && (
                                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
                                                <Globe className="w-2.5 h-2.5 mr-0.5" />
                                                i18n
                                            </Badge>
                                        )}
                                        {contentType.versioning && (
                                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
                                                <GitBranch className="w-2.5 h-2.5 mr-0.5" />
                                                v
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Accessible Confirmation Dialog */}
            <ConfirmDialog
                open={!!deleteTarget}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
                title={`Delete model "${deleteTarget?.name}"?`}
                description="This will permanently delete the content model and its associated schema definition. This action cannot be undone."
                confirmText="Delete Model"
                onConfirm={() => {
                    if (deleteTarget) {
                        handleDelete(deleteTarget.id);
                        setDeleteTarget(null);
                    }
                }}
            />
        </div>
    );
}

export default ContentTypesListPage;
