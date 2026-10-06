import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, CheckCircle, XCircle, GitBranch } from 'lucide-react';
import { workflowService, Workflow } from '@/services/workflowService';
import { WorkflowsListSkeleton } from '@/components/skeletons';

export function WorkflowsPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadWorkflows();
    }, [projectId]);

    const loadWorkflows = async () => {
        if (!projectId) return;

        try {
            setLoading(true);
            const data = await workflowService.getWorkflows(projectId);
            setWorkflows(data);
        } catch (error) {
            console.error('Failed to load workflows:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this workflow? This action cannot be undone.')) {
            return;
        }

        try {
            await workflowService.deleteWorkflow(id);
            setWorkflows(workflows.filter(w => w._id !== id));
        } catch (error) {
            console.error('Failed to delete workflow:', error);
            toast.error('Failed to delete workflow');
        }
    };

    if (loading) {
        return <WorkflowsListSkeleton />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                Workflows
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Manage approval workflows for your content
                            </p>
                        </div>
                        <button
                            onClick={() => navigate(`/dashboard/project/${projectId}/workflows/new`)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            Create Workflow
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {workflows.length === 0 ? (
                    <div className="text-center py-16">
                        <GitBranch className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            No workflows yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Get started by creating your first approval workflow
                        </p>
                        <button
                            onClick={() => navigate(`/dashboard/project/${projectId}/workflows/new`)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            Create Your First Workflow
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {workflows.map((workflow) => (
                            <div
                                key={workflow._id}
                                className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl hover:-translate-y-1 transition-all"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                            {workflow.name}
                                        </h3>
                                        {workflow.description && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                                {workflow.description}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => navigate(`/dashboard/project/${projectId}/workflows/${workflow._id}/edit`)}
                                            className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Edit className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(workflow._id!)}
                                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                                        </button>
                                    </div>
                                </div>

                                {/* Steps */}
                                <div className="mb-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        <GitBranch className="w-4 h-4" />
                                        <span>{workflow.steps.length} step{workflow.steps.length !== 1 ? 's' : ''}</span>
                                    </div>
                                    <div className="space-y-2">
                                        {workflow.steps.slice(0, 3).map((step, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-2 text-sm"
                                            >
                                                <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-medium">
                                                    {index + 1}
                                                </div>
                                                <span className="text-gray-900 dark:text-white font-medium">
                                                    {step.name}
                                                </span>
                                            </div>
                                        ))}
                                        {workflow.steps.length > 3 && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400 pl-8">
                                                +{workflow.steps.length - 3} more steps
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${workflow.enabled
                                            ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                                            : 'bg-gray-100 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400'
                                        }`}>
                                        {workflow.enabled ? (
                                            <>
                                                <CheckCircle className="w-3 h-3" />
                                                Enabled
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="w-3 h-3" />
                                                Disabled
                                            </>
                                        )}
                                    </span>
                                </div>

                                {/* View Details */}
                                <button
                                    onClick={() => navigate(`/dashboard/project/${projectId}/workflows/${workflow._id}`)}
                                    className="w-full mt-4 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    View Details
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
