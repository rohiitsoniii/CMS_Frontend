import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Edit, Trash2, Database, Calendar, Globe, GitBranch, Search, Filter } from 'lucide-react';
import { contentTypeService, ContentType } from '@/services/contentTypeService';
import { ContentTypesListSkeleton } from '@/components/skeletons';

export function ContentTypesListPage() {
    const navigate = useNavigate();
    const { projectId } = useParams<{ projectId: string }>();
    const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterBy, setFilterBy] = useState<'all' | 'localized' | 'versioned'>('all');

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
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this content type? This action cannot be undone.')) {
            return;
        }

        try {
            await contentTypeService.deleteContentType(id);
            setContentTypes(contentTypes.filter(ct => ct._id !== id));
        } catch (error) {
            console.error('Failed to delete content type:', error);
            toast.error('Failed to delete content type');
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                Content Types
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Define the structure of your content
                            </p>
                        </div>
                        <button
                            onClick={() => navigate(`/dashboard/project/${projectId}/content-types/new`)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            Create Content Type
                        </button>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex items-center gap-4 mt-6">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search content types..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-gray-400" />
                            <select
                                value={filterBy}
                                onChange={(e) => setFilterBy(e.target.value as any)}
                                className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            >
                                <option value="all">All Types</option>
                                <option value="localized">Localized</option>
                                <option value="versioned">Versioned</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Types Grid */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {filteredContentTypes.length === 0 ? (
                    <div className="text-center py-16">
                        <Database className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            {searchQuery ? 'No content types found' : 'No content types yet'}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            {searchQuery
                                ? 'Try adjusting your search or filters'
                                : 'Get started by creating your first content type'
                            }
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={() => navigate(`/dashboard/project/${projectId}/content-types/new`)}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all"
                            >
                                <Plus className="w-5 h-5" />
                                Create Your First Content Type
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredContentTypes.map((contentType) => (
                            <div
                                key={contentType._id}
                                className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
                                onClick={() => navigate(`/dashboard/project/${projectId}/content-types/${contentType._id}`)}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            {contentType.displayName}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mt-1">
                                            {contentType.name}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/dashboard/project/${projectId}/content-types/${contentType._id}/edit`);
                                            }}
                                            className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                                        >
                                            <Edit className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(contentType._id!);
                                            }}
                                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                                        </button>
                                    </div>
                                </div>

                                {/* Description */}
                                {contentType.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                        {contentType.description}
                                    </p>
                                )}

                                {/* Stats */}
                                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                                    <span className="flex items-center gap-1">
                                        <Database className="w-4 h-4" />
                                        {contentType.fields.length} fields
                                    </span>
                                </div>

                                {/* Features */}
                                <div className="flex flex-wrap gap-2">
                                    {contentType.localization && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-medium">
                                            <Globe className="w-3 h-3" />
                                            Localized
                                        </span>
                                    )}
                                    {contentType.versioning && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg text-xs font-medium">
                                            <GitBranch className="w-3 h-3" />
                                            Versioned
                                        </span>
                                    )}
                                    {contentType.timestamps && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-xs font-medium">
                                            <Calendar className="w-3 h-3" />
                                            Timestamps
                                        </span>
                                    )}
                                </div>

                                {/* Updated Date */}
                                {contentType.updatedAt && (
                                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Updated {new Date(contentType.updatedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
