import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SkeletonCardGrid } from '@/components/skeletons';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    FileText,
    MoreVertical,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import toast from 'react-hot-toast';

export function ContentTypesPage() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');

    // Fetch content types
    const { data: contentTypes, isLoading } = useQuery({
        queryKey: ['content-types', projectId],
        queryFn: async () => {
            const response = await fetch(`/api/v1/projects/${projectId}/content-types`);
            const data = await response.json();
            return data.data.contentTypes;
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (typeId: string) => {
            const response = await fetch(`/api/v1/projects/${projectId}/content-types/${typeId}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete');
            return response.json();
        },
        onSuccess: () => {
            toast.success('Content type deleted');
            queryClient.invalidateQueries({ queryKey: ['content-types', projectId] });
        },
        onError: () => {
            toast.error('Failed to delete content type');
        },
    });

    const filteredTypes = contentTypes?.filter((type: any) =>
        type.name.toLowerCase().includes(search.toLowerCase())
    ) || [];

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold">Content Types</h1>
                        <p className="text-gray-600 mt-1">
                            Define the structure of your content
                        </p>
                    </div>
                    <Button onClick={() => navigate(`/dashboard/projects/${projectId}/content-types/new`)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Content Type
                    </Button>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search content types..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Content Types Grid */}
            {isLoading ? (
                <SkeletonCardGrid count={6} />
            ) : filteredTypes.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        {search ? 'No content types found' : 'No content types yet'}
                    </h3>
                    <p className="text-gray-500 mb-4">
                        {search ? 'Try a different search term' : 'Create your first content type to get started'}
                    </p>
                    {!search && (
                        <Button onClick={() => navigate(`/dashboard/projects/${projectId}/content-types/new`)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Content Type
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTypes.map((type: any) => (
                        <Card key={type._id} className="p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="text-3xl">{type.icon || '📄'}</div>
                                    <div>
                                        <h3 className="font-bold text-lg">{type.name}</h3>
                                        <Badge variant="outline" className="mt-1">
                                            {type.fields?.length || 0} fields
                                        </Badge>
                                    </div>
                                </div>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            onClick={() => navigate(`/dashboard/projects/${projectId}/content-types/${type._id}`)}
                                        >
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => {
                                                if (confirm('Delete this content type?')) {
                                                    deleteMutation.mutate(type._id);
                                                }
                                            }}
                                            className="text-red-600"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {type.description && (
                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                    {type.description}
                                </p>
                            )}

                            {type.fields && type.fields.length > 0 && (
                                <div className="space-y-2">
                                    <div className="text-xs font-medium text-gray-500">Fields:</div>
                                    <div className="flex flex-wrap gap-1">
                                        {type.fields.slice(0, 5).map((field: any) => (
                                            <Badge key={field.name} variant="secondary" className="text-xs">
                                                {field.label}
                                            </Badge>
                                        ))}
                                        {type.fields.length > 5 && (
                                            <Badge variant="outline" className="text-xs">
                                                +{type.fields.length - 5} more
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="mt-4 pt-4 border-t flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => navigate(`/dashboard/projects/${projectId}/content-types/${type._id}`)}
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate(`/dashboard/projects/${projectId}/content?type=${type.name}`)}
                                >
                                    View Content
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
