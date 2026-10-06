import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, Mail, Copy } from 'lucide-react';
import { emailTemplateService, EmailTemplate } from '@/services/emailTemplateService';
import { EmailTemplatesSkeleton } from '@/components/skeletons';

export function EmailTemplatesPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'transactional' | 'marketing' | 'support'>('all');

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
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this template?')) {
            return;
        }

        try {
            await emailTemplateService.deleteTemplate(id);
            setTemplates(templates.filter(t => t._id !== id));
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
        } catch (error) {
            console.error('Failed to duplicate template:', error);
            toast.error('Failed to duplicate template');
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'transactional':
                return 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';
            case 'marketing':
                return 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400';
            case 'support':
                return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400';
            default:
                return 'bg-gray-100 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400';
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                Email Templates
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Create and manage reusable email templates
                            </p>
                        </div>
                        <button
                            onClick={() => navigate(`/dashboard/project/${projectId}/email-templates/new`)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            Create Template
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Filters */}
                <div className="flex items-center gap-2 mb-6">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === 'all'
                                ? 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('transactional')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === 'transactional'
                                ? 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                    >
                        Transactional
                    </button>
                    <button
                        onClick={() => setFilter('marketing')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === 'marketing'
                                ? 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                    >
                        Marketing
                    </button>
                    <button
                        onClick={() => setFilter('support')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === 'support'
                                ? 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                    >
                        Support
                    </button>
                </div>

                {/* Templates Grid */}
                {filteredTemplates.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                        <Mail className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            No templates yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Create your first email template to get started
                        </p>
                        <button
                            onClick={() => navigate(`/dashboard/project/${projectId}/email-templates/new`)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            Create First Template
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTemplates.map((template) => (
                            <div
                                key={template._id}
                                className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl hover:-translate-y-1 transition-all"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                            {template.name}
                                        </h3>
                                        <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium ${getCategoryColor(template.category)}`}>
                                            {template.category}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => navigate(`/dashboard/project/${projectId}/email-templates/${template._id}/preview`)}
                                            className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                            title="Preview"
                                        >
                                            <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        </button>
                                        <button
                                            onClick={() => navigate(`/dashboard/project/${projectId}/email-templates/${template._id}/edit`)}
                                            className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Edit className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                        </button>
                                        <button
                                            onClick={() => handleDuplicate(template)}
                                            className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                            title="Duplicate"
                                        >
                                            <Copy className="w-4 h-4 text-green-600 dark:text-green-400" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(template._id!)}
                                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                                        </button>
                                    </div>
                                </div>

                                {/* Subject */}
                                <div className="mb-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Subject:</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                                        {template.subject}
                                    </p>
                                </div>

                                {/* Variables */}
                                {template.variables && template.variables.length > 0 && (
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Variables:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {template.variables.slice(0, 3).map((variable, index) => (
                                                <span
                                                    key={index}
                                                    className="px-2 py-0.5 bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 rounded text-xs font-mono"
                                                >
                                                    {`{{${variable}}}`}
                                                </span>
                                            ))}
                                            {template.variables.length > 3 && (
                                                <span className="px-2 py-0.5 text-gray-500 dark:text-gray-400 text-xs">
                                                    +{template.variables.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Status */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${template.isActive
                                            ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                                            : 'bg-gray-100 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400'
                                        }`}>
                                        {template.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(template.createdAt!).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
