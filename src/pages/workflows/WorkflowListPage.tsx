import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GitBranch, Plus, Trash2, Edit2, XCircle, ArrowRight, Sliders } from 'lucide-react';
import { workflowService, Workflow } from '../../services/workflowService';
import { WorkflowsListSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from 'react-hot-toast';

export const WorkflowListPage: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

    // Initial form state
    const [formData, setFormData] = useState<Partial<Workflow>>({
        name: '',
        description: '',
        steps: [{ name: 'Draft' }, { name: 'Review' }, { name: 'Publish' }] // Default steps
    });

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
            toast.error('Failed to load workflows');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await workflowService.deleteWorkflow(id);
            toast.success('Workflow deleted');
            loadWorkflows();
        } catch (error) {
            toast.error('Failed to delete workflow');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectId) return;

        try {
            if (editingWorkflow) {
                await workflowService.updateWorkflow(editingWorkflow._id!, formData);
                toast.success('Workflow updated');
            } else {
                await workflowService.createWorkflow({ ...formData, projectId });
                toast.success('Workflow created');
            }
            setShowModal(false);
            setEditingWorkflow(null);
            setFormData({ name: '', description: '', steps: [{ name: 'Draft' }, { name: 'Review' }, { name: 'Publish' }] });
            loadWorkflows();
        } catch (error) {
            toast.error('Failed to save workflow');
        }
    };

    const handleEdit = (workflow: Workflow) => {
        setEditingWorkflow(workflow);
        setFormData({
            name: workflow.name,
            description: workflow.description,
            steps: workflow.steps
        });
        setShowModal(true);
    };

    if (loading) return <WorkflowsListSkeleton />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
                        <GitBranch className="w-7 h-7 text-indigo-500" />
                        Workflows & Approvals
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        Define multi-stage approval states and review processes for content
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setEditingWorkflow(null);
                            setFormData({ name: '', description: '', steps: [{ name: 'Draft' }, { name: 'Review' }, { name: 'Publish' }] });
                            setShowModal(true);
                        }}
                    >
                        Quick Template
                    </Button>
                    <Button
                        onClick={() => navigate(`/dashboard/project/${projectId}/workflows/new`)}
                        className="shadow-sm"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Visual Builder
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                {workflows.map(workflow => (
                    <div key={workflow._id} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200/80 dark:border-gray-800 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-semibold text-base text-gray-900 dark:text-white">{workflow.name}</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">{workflow.description}</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate(`/dashboard/project/${projectId}/workflows/${workflow._id || workflow.apiId}/edit`)}
                                    className="h-8 text-xs"
                                >
                                    <Sliders className="w-3.5 h-3.5 mr-1 text-indigo-500" />
                                    Canvas
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label="Quick edit"
                                    onClick={() => handleEdit(workflow)}
                                    className="h-8 w-8 hover:text-indigo-600 dark:hover:text-indigo-400"
                                >
                                    <Edit2 className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label="Delete workflow"
                                    onClick={() => setDeleteTargetId(workflow._id!)}
                                    className="h-8 w-8 hover:text-red-600 dark:hover:text-red-400"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>

                        {/* Steps Visualization */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2">
                            {workflow.steps?.map((step, index) => (
                                <div key={index} className="flex items-center shrink-0">
                                    <div className="flex flex-col items-center min-w-[110px] p-2.5 bg-gray-50 dark:bg-gray-900/60 rounded-lg border border-gray-100 dark:border-gray-800">
                                        <span className="font-semibold text-xs text-gray-900 dark:text-gray-100">{step.name}</span>
                                        {step.assignedTo && (
                                            <span className="text-[10px] text-gray-400 mt-0.5">
                                                By: {step.assignedTo}
                                            </span>
                                        )}
                                    </div>
                                    {index < workflow.steps.length - 1 && (
                                        <ArrowRight className="w-4 h-4 mx-2 text-gray-400 shrink-0" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {workflows.length === 0 && (
                    <div className="text-center py-14 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-8">
                        <GitBranch className="w-14 h-14 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            No workflows configured
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                            Design publishing approval steps such as Draft &rarr; Editor Review &rarr; Legal &rarr; Publish.
                        </p>
                        <Button
                            onClick={() => navigate(`/dashboard/project/${projectId}/workflows/new`)}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Your First Workflow
                        </Button>
                    </div>
                )}
            </div>

            {/* Quick Template Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold mb-5 text-gray-900 dark:text-white">
                            {editingWorkflow ? 'Edit Workflow' : 'Create Workflow'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">
                                    Workflow Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="e.g. Standard Content Approval"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description || ''}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Describe the workflow process..."
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2">
                                    Sequential Steps
                                </label>
                                <div className="space-y-2">
                                    {formData.steps?.map((step, index) => (
                                        <div key={index} className="flex gap-2 items-center">
                                            <input
                                                type="text"
                                                value={step.name}
                                                onChange={e => {
                                                    const newSteps = [...(formData.steps || [])];
                                                    newSteps[index] = { ...newSteps[index], name: e.target.value };
                                                    setFormData({ ...formData, steps: newSteps });
                                                }}
                                                className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                                placeholder={`Step ${index + 1}`}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                aria-label="Remove step"
                                                onClick={() => {
                                                    const newSteps = formData.steps?.filter((_, i) => i !== index);
                                                    setFormData({ ...formData, steps: newSteps });
                                                }}
                                                className="h-9 w-9 text-red-500 hover:text-red-700"
                                            >
                                                <XCircle className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setFormData({ ...formData, steps: [...(formData.steps || []), { name: 'New Step' }] })}
                                        className="text-xs"
                                    >
                                        <Plus className="w-3.5 h-3.5 mr-1" /> Add Step
                                    </Button>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1"
                                >
                                    {editingWorkflow ? 'Save Changes' : 'Create Workflow'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirm Dialog */}
            <ConfirmDialog
                open={!!deleteTargetId}
                onOpenChange={(open) => !open && setDeleteTargetId(null)}
                title="Delete workflow?"
                description="This will permanently delete this workflow. Content entries currently assigned to this approval path will revert to standard unguided review. This action cannot be undone."
                confirmText="Delete Workflow"
                onConfirm={() => {
                    if (deleteTargetId) {
                        handleDelete(deleteTargetId);
                        setDeleteTargetId(null);
                    }
                }}
            />
        </div>
    );
};

export default WorkflowListPage;
