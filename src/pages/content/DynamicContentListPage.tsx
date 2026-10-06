import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, EyeOff, Copy, Search, Filter, Layers, Settings, Boxes, FileText } from 'lucide-react';
import { contentTypeService, ContentType } from '@/services/contentTypeService';
import { contentService, Content } from '@/services/contentService';
import { DynamicContentListSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export function ContentListPage() {
    const navigate = useNavigate();
    const { projectId, contentTypeId } = useParams<{ projectId: string; contentTypeId: string }>();

    const [contentType, setContentType] = useState<ContentType | null>(null);
    const [contents, setContents] = useState<Content[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, [contentTypeId, filterStatus]);

    const loadData = async () => {
        if (!contentTypeId || !projectId) return;

        try {
            setLoading(true);

            // Load content type
            const ctData = await contentTypeService.getContentType(contentTypeId);
            setContentType(ctData);

            // Load contents
            const query = {
                projectId,
                contentTypeId,
                status: filterStatus === 'all' ? undefined : filterStatus,
            };
            const contentData = await contentService.getContent(query);
            setContents(contentData?.data || []);
        } catch (error) {
            console.error('Failed to load data:', error);
            toast.error('Failed to load content entries');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await contentService.deleteContent(id);
            setContents(contents.filter(c => c._id !== id));
            toast.success('Content entry deleted');
        } catch (error) {
            console.error('Failed to delete content:', error);
            toast.error('Failed to delete content');
        }
    };

    const handlePublish = async (id: string) => {
        try {
            await contentService.publishContent(id);
            toast.success('Published successfully');
            loadData();
        } catch (error) {
            console.error('Failed to publish content:', error);
            toast.error('Failed to publish content');
        }
    };

    const handleUnpublish = async (id: string) => {
        try {
            await contentService.unpublishContent(id);
            toast.success('Unpublished to draft');
            loadData();
        } catch (error) {
            console.error('Failed to unpublish content:', error);
            toast.error('Failed to unpublish content');
        }
    };

    const handleDuplicate = async (id: string) => {
        try {
            await contentService.duplicateContent(id);
            toast.success('Duplicated content entry');
            loadData();
        } catch (error) {
            console.error('Failed to duplicate content:', error);
            toast.error('Failed to duplicate content');
        }
    };

    const filteredContents = contents.filter(content => {
        if (!searchQuery) return true;
        const searchLower = searchQuery.toLowerCase();
        return Object.values(content.data || {}).some(value =>
            String(value).toLowerCase().includes(searchLower)
        );
    });

    if (loading) {
        return <DynamicContentListSkeleton />;
    }

    if (!contentType) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-12 text-center max-w-lg mx-auto">
                <Boxes className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Content Model Not Found
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    The requested model does not exist or has been removed from this project.
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
                        <FileText className="w-7 h-7 text-indigo-500" />
                        {contentType.displayName || contentType.name}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {contentType.description || `Manage and publish ${contentType.displayName || contentType.name} entries`}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        asChild
                    >
                        <Link to={`/dashboard/project/${projectId}/content-types/${contentType._id}/edit`}>
                            <Settings className="w-4 h-4 mr-2" />
                            Model Schema
                        </Link>
                    </Button>
                    <Button
                        onClick={() => navigate(`/dashboard/project/${projectId}/content/${contentTypeId}/new`)}
                        className="shadow-sm"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Entry
                    </Button>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200/80 dark:border-gray-800 shadow-sm">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search entries..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        aria-label="Search entries"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-gray-400"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400 shrink-0 hidden sm:block" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        aria-label="Filter entries by status"
                        className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-gray-700 dark:text-gray-200"
                    >
                        <option value="all">All Status</option>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                    </select>
                </div>
            </div>

            {/* Content Table / Empty State */}
            {filteredContents.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-12 text-center">
                    <Layers className="w-14 h-14 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {searchQuery ? 'No matching entries found' : `No ${contentType.displayName} entries yet`}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                        {searchQuery
                            ? 'Try modifying your search term or filtering criteria.'
                            : `Add your first ${contentType.displayName} record to populate your CMS delivery API.`
                        }
                    </p>
                    {!searchQuery && (
                        <Button
                            onClick={() => navigate(`/dashboard/project/${projectId}/content/${contentTypeId}/new`)}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create First Entry
                        </Button>
                    )}
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/80 dark:border-gray-800 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50/80 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                <tr>
                                    {contentType.fields.slice(0, 3).map((field) => (
                                        <th key={field.name} className="px-5 py-3.5">
                                            {field.label || field.name}
                                        </th>
                                    ))}
                                    <th className="px-5 py-3.5">Status</th>
                                    <th className="px-5 py-3.5">Updated</th>
                                    <th className="px-5 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                                {filteredContents.map((content) => (
                                    <tr
                                        key={content._id}
                                        className="hover:bg-gray-50/70 dark:hover:bg-gray-900/40 transition-colors cursor-pointer"
                                        onClick={() => navigate(`/dashboard/project/${projectId}/content/${contentTypeId}/${content._id}`)}
                                    >
                                        {contentType.fields.slice(0, 3).map((field) => (
                                            <td key={field.name} className="px-5 py-3.5 text-gray-900 dark:text-gray-100 font-medium max-w-xs truncate">
                                                {String(content.data?.[field.name] || '—')}
                                            </td>
                                        ))}
                                        <td className="px-5 py-3.5">
                                            <Badge
                                                variant={
                                                    content.status === 'published'
                                                        ? 'default'
                                                        : content.status === 'draft'
                                                            ? 'secondary'
                                                            : 'outline'
                                                }
                                                className={`text-xs capitalize font-normal ${
                                                    content.status === 'published'
                                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                                        : content.status === 'draft'
                                                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                                            : ''
                                                }`}
                                            >
                                                {content.status}
                                            </Badge>
                                        </td>
                                        <td className="px-5 py-3.5 text-xs text-gray-500 dark:text-gray-400">
                                            {new Date(content.updatedAt!).toLocaleDateString()}
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label="Edit entry"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/dashboard/project/${projectId}/content/${contentTypeId}/${content._id}`);
                                                    }}
                                                    className="h-8 w-8 hover:text-indigo-600 dark:hover:text-indigo-400"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                </Button>
                                                {content.status === 'draft' ? (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        aria-label="Publish entry"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handlePublish(content._id!);
                                                        }}
                                                        className="h-8 w-8 hover:text-emerald-600 dark:hover:text-emerald-400"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </Button>
                                                ) : content.status === 'published' ? (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        aria-label="Unpublish entry"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleUnpublish(content._id!);
                                                        }}
                                                        className="h-8 w-8 hover:text-amber-600 dark:hover:text-amber-400"
                                                    >
                                                        <EyeOff className="w-3.5 h-3.5" />
                                                    </Button>
                                                ) : null}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label="Duplicate entry"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDuplicate(content._id!);
                                                    }}
                                                    className="h-8 w-8 hover:text-blue-600 dark:hover:text-blue-400"
                                                >
                                                    <Copy className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label="Delete entry"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDeleteTargetId(content._id!);
                                                    }}
                                                    className="h-8 w-8 hover:text-red-600 dark:hover:text-red-400"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Accessible Confirmation Dialog */}
            <ConfirmDialog
                open={!!deleteTargetId}
                onOpenChange={(open) => !open && setDeleteTargetId(null)}
                title="Delete content entry?"
                description="This will permanently delete this content record from your CMS database. This action cannot be undone."
                confirmText="Delete Entry"
                onConfirm={() => {
                    if (deleteTargetId) {
                        handleDelete(deleteTargetId);
                        setDeleteTargetId(null);
                    }
                }}
            />
        </div>
    );
}

export default ContentListPage;
