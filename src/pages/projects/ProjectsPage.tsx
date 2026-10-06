import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    FolderOpen,
    Settings,
    Trash2,
    MoreHorizontal,
    Globe,
    Calendar,
    FileText,
    Loader2,
    Search,
    Grid,
    List,
    ExternalLink,
    MessageSquare,
    Check
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { projectAPI, templateAPI } from '@/services/api';
import { useAuthStore } from '@/store';
import { cn } from '@/lib/utils';
import { SkeletonCardGrid } from '@/components/skeletons';

interface Project {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    domain?: string;
    status: 'active' | 'draft' | 'archived';
    stats: {
        contentCount: number;
        blogCount: number;
        apiCalls: number;
        lastPublishedAt?: string;
    };
    branding?: {
        logo?: { url: string };
        colors?: { primary: string };
    };
    chatbot?: {
        enabled: boolean;
    };
    createdAt: string;
    updatedAt: string;
}

export default function ProjectsPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const setCurrentProject = useAuthStore((state) => state.setCurrentProject);

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [search, setSearch] = useState('');
    const [createDialog, setCreateDialog] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; project?: Project }>({ open: false });

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        templateId: '',
    });

    // Fetch templates
    const { data: templates } = useQuery({
        queryKey: ['templates'],
        queryFn: async () => {
            const response = await templateAPI.getTemplates();
            return response.data;
        },
    });


    // Fetch projects
    const { data, isLoading } = useQuery({
        queryKey: ['projects', search],
        queryFn: async () => {
            const params: Record<string, string> = {};
            if (search) params.search = search;
            const response = await projectAPI.getAll(params);
            return response.data.data;
        },
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: async (data: { name: string; slug: string; description?: string; templateId?: string }) => {
            const projectResponse = await projectAPI.create({
                name: data.name,
                slug: data.slug,
                description: data.description,
            });
            const project = projectResponse.data.data;

            if (data.templateId) {
                await templateAPI.applyTemplate(project._id, data.templateId);
            }

            return project;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            setCreateDialog(false);
            setFormData({ name: '', slug: '', description: '', templateId: '' });
        },
    });


    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => projectAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            setDeleteDialog({ open: false });
        },
    });

    const handleCreateProject = () => {
        if (!formData.name || !formData.slug) return;
        createMutation.mutate(formData);
    };

    const handleSelectProject = (project: Project) => {
        setCurrentProject({
            id: project._id,
            name: project.name,
            slug: project.slug,
            status: project.status,
            description: project.description,
        });
        navigate(`/dashboard/project/${project._id}`);
    };

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-500';
            case 'draft': return 'bg-yellow-500';
            case 'archived': return 'bg-gray-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage your websites and applications</p>
                </div>
                <Button
                    onClick={() => setCreateDialog(true)}
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Project
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search projects..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                        size="icon"
                        onClick={() => setViewMode('grid')}
                    >
                        <Grid className="w-4 h-4" />
                    </Button>
                    <Button
                        variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                        size="icon"
                        onClick={() => setViewMode('list')}
                    >
                        <List className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Projects Grid/List */}
            {isLoading ? (
                <SkeletonCardGrid count={6} />
            ) : data?.projects?.length === 0 ? (
                <Card className="py-16">
                    <CardContent className="flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center mb-6">
                            <FolderOpen className="w-10 h-10 text-indigo-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            No projects yet
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
                            Create your first project to start managing content for your website or application.
                        </p>
                        <Button
                            onClick={() => setCreateDialog(true)}
                            className="bg-gradient-to-r from-indigo-500 to-purple-500"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create First Project
                        </Button>
                    </CardContent>
                </Card>
            ) : viewMode === 'grid' ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {data.projects.map((project: Project) => (
                        <Card
                            key={project._id}
                            className="group cursor-pointer hover:shadow-lg hover:border-indigo-500/50 transition-all duration-300"
                            onClick={() => handleSelectProject(project)}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold text-lg"
                                            style={{
                                                backgroundColor: project.branding?.colors?.primary || '#6366f1'
                                            }}
                                        >
                                            {project.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg group-hover:text-indigo-500 transition-colors">
                                                {project.name}
                                            </CardTitle>
                                            <CardDescription className="text-sm">
                                                {project.slug}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <div className={cn('w-2 h-2 rounded-full', getStatusColor(project.status))} />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {project.description && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                        {project.description}
                                    </p>
                                )}

                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <FileText className="w-4 h-4" />
                                        <span>{project.stats.contentCount} items</span>
                                    </div>
                                    {project.chatbot?.enabled && (
                                        <div className="flex items-center gap-1 text-indigo-500">
                                            <MessageSquare className="w-4 h-4" />
                                            <span>Chatbot</span>
                                        </div>
                                    )}
                                </div>

                                {project.domain && (
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Globe className="w-4 h-4" />
                                        <span>{project.domain}</span>
                                        <ExternalLink className="w-3 h-3" />
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-1 text-xs text-gray-400">
                                        <Calendar className="w-3 h-3" />
                                        <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/dashboard/project/${project._id}/settings`);
                                            }}
                                        >
                                            <Settings className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-red-500 hover:text-red-600"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDeleteDialog({ open: true, project });
                                            }}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="p-0">
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {data.projects.map((project: Project) => (
                                <div
                                    key={project._id}
                                    className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                                    onClick={() => handleSelectProject(project)}
                                >
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold text-xl shrink-0"
                                        style={{
                                            backgroundColor: project.branding?.colors?.primary || '#6366f1'
                                        }}
                                    >
                                        {project.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                                {project.name}
                                            </h3>
                                            <Badge variant={project.status === 'active' ? 'success' : 'secondary'}>
                                                {project.status}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-500 truncate">
                                            {project.description || project.slug}
                                        </p>
                                    </div>
                                    <div className="hidden sm:flex items-center gap-6 text-sm text-gray-500">
                                        <div className="text-center">
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {project.stats.contentCount}
                                            </p>
                                            <p className="text-xs">Items</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {project.stats.apiCalls.toLocaleString()}
                                            </p>
                                            <p className="text-xs">API Calls</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Create Project Dialog */}
            <Dialog open={createDialog} onOpenChange={setCreateDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create New Project</DialogTitle>
                        <DialogDescription>
                            Create a new project to manage content for your website or app.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Project Name</Label>
                            <Input
                                id="name"
                                placeholder="My Website"
                                value={formData.name}
                                onChange={(e) => {
                                    setFormData({
                                        ...formData,
                                        name: e.target.value,
                                        slug: generateSlug(e.target.value),
                                    });
                                }}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="slug">Slug (API identifier)</Label>
                            <Input
                                id="slug"
                                placeholder="my-website"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                            />
                            <p className="text-xs text-gray-500">
                                Used in API URLs: /deliver/{formData.slug || 'your-slug'}/...
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description (optional)</Label>
                            <Textarea
                                id="description"
                                placeholder="A brief description of your project..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                            />
                        </div>

                        <div className="space-y-3 pt-2">
                            <Label>Start with a Template (Recommended)</Label>
                            <div className="grid grid-cols-1 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, templateId: '' })}
                                    className={cn(
                                        "flex items-center justify-between p-3 rounded-lg border text-left transition-all",
                                        formData.templateId === '' 
                                            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 ring-1 ring-indigo-500" 
                                            : "border-gray-200 dark:border-gray-800 hover:border-indigo-200"
                                    )}
                                >
                                    <div>
                                        <p className="font-medium text-sm">Blank Project</p>
                                        <p className="text-xs text-gray-500">Start from scratch with no predefined content types.</p>
                                    </div>
                                    {formData.templateId === '' && <Check className="w-4 h-4 text-indigo-500" />}
                                </button>
                                
                                {templates?.map((template: any) => (
                                    <button
                                        key={template.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, templateId: template.id })}
                                        className={cn(
                                            "flex items-center justify-between p-3 rounded-lg border text-left transition-all",
                                            formData.templateId === template.id 
                                                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 ring-1 ring-indigo-500" 
                                                : "border-gray-200 dark:border-gray-800 hover:border-indigo-200"
                                        )}
                                    >
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">{template.icon}</span>
                                                <p className="font-medium text-sm">{template.name}</p>
                                            </div>
                                            <p className="text-xs text-gray-500">{template.description}</p>
                                        </div>
                                        {formData.templateId === template.id && <Check className="w-4 h-4 text-indigo-500" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>


                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateProject}
                            disabled={!formData.name || !formData.slug || createMutation.isPending}
                            className="bg-gradient-to-r from-indigo-500 to-purple-500"
                        >
                            {createMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Project'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Archive Project</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to archive "{deleteDialog.project?.name}"?
                            This will hide it from your dashboard but preserve all content.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialog({ open: false })}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deleteDialog.project && deleteMutation.mutate(deleteDialog.project._id)}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Archiving...
                                </>
                            ) : (
                                'Archive Project'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
