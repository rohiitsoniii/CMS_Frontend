import { useState } from 'react';
import { useAuthStore } from '@/store';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    FileText,
    Layers,
    Navigation,
    Newspaper,
    HelpCircle,
    MessageSquare,
    Image,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { contentAPI } from '@/services/api';
import { SkeletonCardGrid } from '@/components/skeletons';
import { cn } from '@/lib/utils';

const contentTypes = [
    { value: 'all', label: 'All Types', icon: FileText },
    { value: 'hero_section', label: 'Hero Sections', icon: Layers },
    { value: 'navigation', label: 'Navigation', icon: Navigation },
    { value: 'blog_post', label: 'Blog Posts', icon: Newspaper },
    { value: 'faq', label: 'FAQs', icon: HelpCircle },
    { value: 'testimonials', label: 'Testimonials', icon: MessageSquare },
    { value: 'gallery', label: 'Gallery', icon: Image },
    { value: 'footer', label: 'Footer', icon: FileText },
];

const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'archived', label: 'Archived' },
];

interface Content {
    _id: string;
    name: string;
    slug: string;
    type: string;
    status: string;
    publishedAt?: string;
    updatedAt: string;
    createdBy?: { firstName: string; lastName: string };
}

export default function ContentListPage() {
    const { type: urlType } = useParams();
    const [searchParams] = useSearchParams();
    const currentProject = useAuthStore((state) => state.currentProject);
    const projectId = currentProject?.id || '';
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [selectedType, setSelectedType] = useState(urlType || searchParams.get('type') || 'all');
    const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'all');
    const [page, setPage] = useState(1);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; content?: Content }>({ open: false });

    // Fetch content
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['content', selectedType, selectedStatus, search, page],
        queryFn: async () => {
            const params: Record<string, string | number> = { page, limit: 12 };
            if (selectedType !== 'all') params.type = selectedType;
            if (selectedStatus !== 'all') params.status = selectedStatus;
            if (search) params.search = search;

            const response = await contentAPI.getAll(projectId, params as any);
            return response.data.data;
        },
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        refetch();
    };

    const handleDelete = async () => {
        if (deleteDialog.content) {
            try {
                await contentAPI.delete(projectId, deleteDialog.content._id);
                setDeleteDialog({ open: false });
                refetch();
            } catch (error) {
                console.error('Failed to delete:', error);
            }
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'published':
                return <Badge variant="success">Published</Badge>;
            case 'draft':
                return <Badge variant="secondary">Draft</Badge>;
            case 'scheduled':
                return <Badge variant="info">Scheduled</Badge>;
            case 'archived':
                return <Badge variant="outline">Archived</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getTypeIcon = (type: string) => {
        const found = contentTypes.find(t => t.value === type);
        return found ? found.icon : FileText;
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Content</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage all your content in one place</p>
                </div>
                <Button variant="gradient" asChild>
                    <Link to="/dashboard/content/new">
                        <Plus className="w-4 h-4" />
                        Create Content
                    </Link>
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <form onSubmit={handleSearch} className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Search content..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </form>

                        {/* Type Filter */}
                        <Select value={selectedType} onValueChange={(v) => { setSelectedType(v); setPage(1); }}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Content Type" />
                            </SelectTrigger>
                            <SelectContent>
                                {contentTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                        <div className="flex items-center gap-2">
                                            <type.icon className="w-4 h-4" />
                                            {type.label}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Status Filter */}
                        <Select value={selectedStatus} onValueChange={(v) => { setSelectedStatus(v); setPage(1); }}>
                            <SelectTrigger className="w-full sm:w-[150px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map((status) => (
                                    <SelectItem key={status.value} value={status.value}>
                                        {status.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Content Grid */}
            {isLoading ? (
                <SkeletonCardGrid count={6} />
            ) : data?.contents?.length === 0 ? (
                <Card className="py-16">
                    <CardContent className="flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                            <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No content found</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-sm">
                            {search ? 'No content matches your search criteria.' : 'Get started by creating your first content.'}
                        </p>
                        <Button variant="gradient" asChild>
                            <Link to="/dashboard/content/new">
                                <Plus className="w-4 h-4" />
                                Create Content
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {data?.contents?.map((content: Content) => {
                            const TypeIcon = getTypeIcon(content.type);
                            return (
                                <Card key={content._id} className="group hover-lift">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={cn(
                                                'w-10 h-10 rounded-lg flex items-center justify-center',
                                                content.status === 'published'
                                                    ? 'bg-emerald-500/10 text-emerald-600'
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                                            )}>
                                                <TypeIcon className="w-5 h-5" />
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                                    <Link to={`/dashboard/content/${content.type}/${content._id}`}>
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => setDeleteDialog({ open: true, content })}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <Link to={`/dashboard/content/${content.type}/${content._id}`}>
                                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1 hover:text-indigo-600 transition-colors">
                                                {content.name}
                                            </h3>
                                        </Link>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                            {content.type.replace('_', ' ')}
                                        </p>

                                        <div className="flex items-center justify-between">
                                            {getStatusBadge(content.status)}
                                            <span className="text-xs text-gray-400">
                                                {formatDate(content.updatedAt)}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {data?.pagination && data.pagination.pages > 1 && (
                        <div className="flex items-center justify-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Previous
                            </Button>
                            <span className="text-sm text-gray-500">
                                Page {page} of {data.pagination.pages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === data.pagination.pages}
                                onClick={() => setPage(p => p + 1)}
                            >
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </>
            )}

            {/* Delete Dialog */}
            <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Content</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{deleteDialog.content?.name}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialog({ open: false })}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
