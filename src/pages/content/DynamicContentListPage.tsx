import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, EyeOff, Copy, Search, Filter } from 'lucide-react';
import { contentTypeService, ContentType } from '@/services/contentTypeService';
import { contentService, Content } from '@/services/contentService';
import { DynamicContentListSkeleton } from '@/components/skeletons';

export function ContentListPage() {
    const navigate = useNavigate();
    const { projectId, contentTypeId } = useParams<{ projectId: string; contentTypeId: string }>();

    const [contentType, setContentType] = useState<ContentType | null>(null);
    const [contents, setContents] = useState<Content[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');

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
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this content? This action cannot be undone.')) {
            return;
        }

        try {
            await contentService.deleteContent(id);
            setContents(contents.filter(c => c._id !== id));
        } catch (error) {
            console.error('Failed to delete content:', error);
            toast.error('Failed to delete content');
        }
    };

    const handlePublish = async (id: string) => {
        try {
            await contentService.publishContent(id);
            loadData();
        } catch (error) {
            console.error('Failed to publish content:', error);
            toast.error('Failed to publish content');
        }
    };

    const handleUnpublish = async (id: string) => {
        try {
            await contentService.unpublishContent(id);
            loadData();
        } catch (error) {
            console.error('Failed to unpublish content:', error);
            toast.error('Failed to unpublish content');
        }
    };

    const handleDuplicate = async (id: string) => {
        try {
            await contentService.duplicateContent(id);
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
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Content Type Not Found
                    </h2>
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
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                {contentType.displayName}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                {contentType.description || 'Manage your content'}
                            </p>
                        </div>
                        <button
                            onClick={() => navigate(`/dashboard/project/${projectId}/content/${contentTypeId}/new`)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            Create {contentType.displayName}
                        </button>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex items-center gap-4 mt-6">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search content..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-gray-400" />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            >
                                <option value="all">All Status</option>
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content List */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {filteredContents.length === 0 ? (
                    <div className="text-center py-16">
                        <Eye className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            {searchQuery ? 'No content found' : 'No content yet'}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            {searchQuery
                                ? 'Try adjusting your search or filters'
                                : `Get started by creating your first ${contentType.displayName}`
                            }
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={() => navigate(`/dashboard/project/${projectId}/content/${contentTypeId}/new`)}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all"
                            >
                                <Plus className="w-5 h-5" />
                                Create Your First {contentType.displayName}
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    {contentType.fields.slice(0, 3).map((field) => (
                                        <th key={field.name} className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                            {field.label || field.name}
                                        </th>
                                    ))}
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                        Updated
                                    </th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredContents.map((content) => (
                                    <tr
                                        key={content._id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors cursor-pointer"
                                        onClick={() => navigate(`/dashboard/project/${projectId}/content/${contentTypeId}/${content._id}`)}
                                    >
                                        {contentType.fields.slice(0, 3).map((field) => (
                                            <td key={field.name} className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                                {String(content.data?.[field.name] || '-').substring(0, 50)}
                                                {String(content.data?.[field.name] || '').length > 50 && '...'}
                                            </td>
                                        ))}
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${content.status === 'published'
                                                    ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                                                    : content.status === 'draft'
                                                        ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'
                                                        : 'bg-gray-100 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400'
                                                }`}>
                                                {content.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            {new Date(content.updatedAt!).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/dashboard/project/${projectId}/content/${contentTypeId}/${content._id}`);
                                                    }}
                                                    className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                                </button>
                                                {content.status === 'draft' ? (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handlePublish(content._id!);
                                                        }}
                                                        className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                                        title="Publish"
                                                    >
                                                        <Eye className="w-4 h-4 text-green-600 dark:text-green-400" />
                                                    </button>
                                                ) : content.status === 'published' ? (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleUnpublish(content._id!);
                                                        }}
                                                        className="p-2 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                                                        title="Unpublish"
                                                    >
                                                        <EyeOff className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                                                    </button>
                                                ) : null}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDuplicate(content._id!);
                                                    }}
                                                    className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    title="Duplicate"
                                                >
                                                    <Copy className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(content._id!);
                                                    }}
                                                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
