import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, Mail, Copy } from 'lucide-react';
import { emailTemplateService, EmailTemplate } from '@/services/emailTemplateService';
import { EmailTemplatesSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export function EmailTemplatesPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'transactional' | 'marketing' | 'support'>('all');
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

    useEffect(() => {
        loadTemplates();
    }, [projectId]);

    const loadTemplates = async () => {
        if (!projectId) return;

        try {
            setLoading(true);
            const data = await emailTemplateService.getTemplates(projectId);
            setTemplates(data);
        } catch (error) {
            console.error('Failed to load templates:', error);
            toast.error('Failed to load email templates');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await emailTemplateService.deleteTemplate(id);
            setTemplates(templates.filter(t => t._id !== id));
            toast.success('Template deleted successfully');
        } catch (error) {
            console.error('Failed to delete template:', error);
            toast.error('Failed to delete template');
        }
    };

    const handleDuplicate = async (template: EmailTemplate) => {
        try {
            const newTemplate = await emailTemplateService.createTemplate({
                ...template,
                name: `${template.name} (Copy)`,
                projectId: projectId!,
            });
            setTemplates([newTemplate, ...templates]);
            toast.success('Template duplicated');
        } catch (error) {
            console.error('Failed to duplicate template:', error);
            toast.error('Failed to duplicate template');
        }
    };

    const getCategoryBadgeClass = (category: string) => {
        switch (category) {
            case 'transactional':
                return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20';
            case 'marketing':
                return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20';
            case 'support':
                return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
            default:
                return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20';
        }
    };

    const filteredTemplates = templates.filter(t => {
        if (filter === 'all') return true;
        return t.category === filter;
    });

    if (loading) {
        return <EmailTemplatesSkeleton />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
                        <Mail className="w-7 h-7 text-indigo-500" />
                        Email Templates
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        Create, customize, and manage transactional and marketing email templates
                    </p>
                </div>
                <Button
                    onClick={() => navigate(`/dashboard/project/${projectId}/email-templates/new`)}
                    className="shadow-sm"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Template
                </Button>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {(['all', 'transactional', 'marketing', 'support'] as const).map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                            filter === cat
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/60 border border-gray-200/80 dark:border-gray-800'
                        }`}
                    >
                        {cat} {cat === 'all' ? `(${templates.length})` : ''}
                    </button>
                ))}
            </div>

            {/* Templates Grid */}
            {filteredTemplates.length === 0 ? (
                <div className="text-center py-14 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-8">
                    <Mail className="w-14 h-14 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        No email templates found
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                        {filter === 'all'
                            ? 'Get started by creating your first transactional or marketing email template.'
                            : `No templates categorized under "${filter}".`
                        }
                    </p>
                    <Button
                        onClick={() => navigate(`/dashboard/project/${projectId}/email-templates/new`)}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create First Template
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredTemplates.map((template) => (
                        <div
                            key={template._id}
                            className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200/80 dark:border-gray-800 p-5 hover:shadow-lg transition-all flex flex-col justify-between"
                        >
                            <div>
                                {/* Header */}
                                <div className="flex items-start justify-between gap-2 mb-3">
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                                            {template.name}
                                        </h3>
                                        <div className="mt-1">
                                            <Badge
                                                variant="outline"
                                                className={`text-[10px] px-2 py-0 font-normal uppercase ${getCategoryBadgeClass(template.category)}`}
                                            >
                                                {template.category}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label="Preview template"
                                            onClick={() => navigate(`/dashboard/project/${projectId}/email-templates/${template._id}/preview`)}
                                            className="h-8 w-8 hover:text-blue-600 dark:hover:text-blue-400"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label="Edit template"
                                            onClick={() => navigate(`/dashboard/project/${projectId}/email-templates/${template._id}/edit`)}
                                            className="h-8 w-8 hover:text-indigo-600 dark:hover:text-indigo-400"
                                        >
                                            <Edit className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label="Duplicate template"
                                            onClick={() => handleDuplicate(template)}
                                            className="h-8 w-8 hover:text-emerald-600 dark:hover:text-emerald-400"
                                        >
                                            <Copy className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label="Delete template"
                                            onClick={() => setDeleteTargetId(template._id!)}
                                            className="h-8 w-8 hover:text-red-600 dark:hover:text-red-400"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Subject */}
                                <div className="mb-3">
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Subject line:</p>
                                    <p className="text-xs font-medium text-gray-800 dark:text-gray-200 line-clamp-2">
                                        {template.subject}
                                    </p>
                                </div>

                                {/* Variables */}
                                {template.variables && template.variables.length > 0 && (
                                    <div className="mb-4">
                                        <div className="flex flex-wrap gap-1">
                                            {template.variables.slice(0, 3).map((variable, index) => (
                                                <span
                                                    key={index}
                                                    className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-900/60 text-gray-600 dark:text-gray-400 rounded text-[10px] font-mono border border-gray-200/50 dark:border-gray-800"
                                                >
                                                    {`{{${variable}}}`}
                                                </span>
                                            ))}
                                            {template.variables.length > 3 && (
                                                <span className="text-[10px] text-gray-400 dark:text-gray-500 self-center">
                                                    +{template.variables.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Status & Date */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800/80">
                                <Badge
                                    variant={template.isActive ? 'default' : 'secondary'}
                                    className={`text-[10px] px-1.5 py-0 font-normal ${
                                        template.isActive
                                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                            : ''
                                    }`}
                                >
                                    {template.isActive ? 'Active' : 'Draft'}
                                </Badge>
                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                    {new Date(template.createdAt!).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Confirm Dialog */}
            <ConfirmDialog
                open={!!deleteTargetId}
                onOpenChange={(open) => !open && setDeleteTargetId(null)}
                title="Delete email template?"
                description="This will permanently delete this template. Any automated delivery hooks relying on this template key will fail. This action cannot be undone."
                confirmText="Delete Template"
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

export default EmailTemplatesPage;
