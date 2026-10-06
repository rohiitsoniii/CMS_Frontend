import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Plus,
    Search,
    Trash2,
    Check,
    Star,
    Eye,
    EyeOff,
    Loader2,
    ArrowLeft,
    CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { contentAPI } from '@/services/api';
import { cn } from '@/lib/utils';
import { SkeletonTable } from '@/components/skeletons';

const contentTypeLabels: Record<string, { singular: string; plural: string; description: string }> = {
    header: {
        singular: 'Header',
        plural: 'Headers',
        description: 'Navigation headers for your website'
    },
    footer: {
        singular: 'Footer',
        plural: 'Footers',
        description: 'Footer sections with links and information'
    },
    hero: {
        singular: 'Hero Section',
        plural: 'Hero Sections',
        description: 'Banner sections for landing pages'
    },
    blog: {
        singular: 'Blog Post',
        plural: 'Blog Posts',
        description: 'Articles and blog content'
    },
    page: {
        singular: 'Page',
        plural: 'Pages',
        description: 'Static pages like About, Contact, etc.'
    },
    faq: {
        singular: 'FAQ Section',
        plural: 'FAQ Sections',
        description: 'Frequently asked questions'
    },
    testimonial: {
        singular: 'Testimonial',
        plural: 'Testimonials',
        description: 'Customer reviews and testimonials'
    },
    banner: {
        singular: 'Banner',
        plural: 'Banners',
        description: 'Promotional banners and popups'
    },
};

interface ContentItem {
    _id: string;
    name: string;
    slug?: string;
    type: string;
    status: 'draft' | 'published' | 'scheduled' | 'archived';
    isDefault: boolean;
    data: Record<string, unknown>;
    meta: {
        publishedAt?: string;
        featured?: boolean;
    };
    createdAt: string;
    updatedAt: string;
    createdBy?: {
        firstName: string;
        lastName: string;
    };
}

export default function ContentSectionPage() {
    const { projectId, contentType } = useParams<{ projectId: string; contentType: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [search, setSearch] = useState('');
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; content?: ContentItem }>({ open: false });

    const typeInfo = contentTypeLabels[contentType!] || {
        singular: 'Content',
        plural: 'Content',
        description: 'Manage your content'
    };

    // Fetch content list
    const { data, isLoading } = useQuery({
        queryKey: ['content', projectId, contentType, search],
        queryFn: async () => {
            const params: Record<string, string> = { type: contentType! };
            if (search) params.search = search;
            const response = await contentAPI.getAll(projectId!, params);
            return response.data.data;
        },
        enabled: !!projectId && !!contentType,
    });

    // Set as default mutation
    const setDefaultMutation = useMutation({
        mutationFn: (id: string) => contentAPI.setAsDefault(projectId!, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['content', projectId, contentType] });
        },
    });

    // Publish mutation
    const publishMutation = useMutation({
        mutationFn: (id: string) => contentAPI.publish(projectId!, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['content', projectId, contentType] });
        },
    });

    // Unpublish mutation
    const unpublishMutation = useMutation({
        mutationFn: (id: string) => contentAPI.unpublish(projectId!, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['content', projectId, contentType] });
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => contentAPI.delete(projectId!, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['content', projectId, contentType] });
            setDeleteDialog({ open: false });
        },
    });

    const getStatusBadge = (content: ContentItem) => {
        const variants: Record<string, 'success' | 'warning' | 'secondary' | 'outline'> = {
            published: 'success',
            draft: 'secondary',
            scheduled: 'warning',
            archived: 'outline',
        };

        return (
            <Badge variant={variants[content.status] || 'secondary'}>
                {content.status}
            </Badge>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {typeInfo.plural}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">{typeInfo.description}</p>
                    </div>
                </div>
                <Button
                    onClick={() => navigate(`/dashboard/project/${projectId}/content/${contentType}/new`)}
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add {typeInfo.singular}
                </Button>
            </div>

            {/* Info Card */}
            <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-800">
                <CardContent className="py-4">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-indigo-600" />
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            <strong>Tip:</strong> Mark one {typeInfo.singular.toLowerCase()} as <strong>"Default"</strong> to make it visible on your website.
                            The default item is what gets returned by the public API.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                    placeholder={`Search ${typeInfo.plural.toLowerCase()}...`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Content List */}
            {isLoading ? (
                <SkeletonTable rows={4} columns={4} />
            ) : data?.contents?.length === 0 ? (
                <Card className="py-16">
                    <CardContent className="flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                            <Plus className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            No {typeInfo.plural.toLowerCase()} yet
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
                            Create your first {typeInfo.singular.toLowerCase()} to get started.
                        </p>
                        <Button
                            onClick={() => navigate(`/dashboard/project/${projectId}/content/${contentType}/new`)}
                            className="bg-gradient-to-r from-indigo-500 to-purple-500"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create {typeInfo.singular}
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {data.contents.map((content: ContentItem) => (
                        <Card
                            key={content._id}
                            className={cn(
                                'hover:shadow-md transition-all cursor-pointer group',
                                content.isDefault && 'ring-2 ring-green-500 border-green-200 dark:border-green-800'
                            )}
                            onClick={() => navigate(`/dashboard/project/${projectId}/content/${contentType}/${content._id}`)}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    {/* Default indicator */}
                                    <div className="shrink-0">
                                        {content.isDefault ? (
                                            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                                                <Check className="w-5 h-5 text-white" />
                                            </div>
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                <Star className="w-5 h-5 text-gray-400" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Content info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                                {content.name}
                                            </h3>
                                            {content.isDefault && (
                                                <Badge variant="success" className="shrink-0">
                                                    Default
                                                </Badge>
                                            )}
                                            {getStatusBadge(content)}
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {content.slug && <span className="font-mono">{content.slug}</span>}
                                            {!content.slug && <span>Created {new Date(content.createdAt).toLocaleDateString()}</span>}
                                            {content.createdBy && (
                                                <span> by {content.createdBy.firstName} {content.createdBy.lastName}</span>
                                            )}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {!content.isDefault && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDefaultMutation.mutate(content._id);
                                                }}
                                                disabled={setDefaultMutation.isPending}
                                            >
                                                {setDefaultMutation.isPending ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Star className="w-4 h-4 mr-1" />
                                                        Set Default
                                                    </>
                                                )}
                                            </Button>
                                        )}

                                        {content.status === 'draft' ? (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    publishMutation.mutate(content._id);
                                                }}
                                                disabled={publishMutation.isPending}
                                            >
                                                {publishMutation.isPending ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Eye className="w-4 h-4 mr-1" />
                                                        Publish
                                                    </>
                                                )}
                                            </Button>
                                        ) : content.status === 'published' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    unpublishMutation.mutate(content._id);
                                                }}
                                                disabled={unpublishMutation.isPending}
                                            >
                                                {unpublishMutation.isPending ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <EyeOff className="w-4 h-4 mr-1" />
                                                        Unpublish
                                                    </>
                                                )}
                                            </Button>
                                        )}

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDeleteDialog({ open: true, content });
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Delete Dialog */}
            <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete {typeInfo.singular}</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{deleteDialog.content?.name}"?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialog({ open: false })}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deleteDialog.content && deleteMutation.mutate(deleteDialog.content._id)}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
