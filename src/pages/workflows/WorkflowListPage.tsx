import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GitBranch, Plus, Trash2, Edit2, XCircle, ArrowRight, Sliders } from 'lucide-react';
import { workflowService, Workflow } from '../../services/workflowService';
import { WorkflowsListSkeleton } from '@/components/skeletons';
import { toast } from 'react-hot-toast';

export const WorkflowListPage: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);

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
            const data = await workflowService.getWorkflows(projectId);
            setWorkflows(data);
        } catch (error) {
            toast.error('Failed to load workflows');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this workflow?')) return;
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
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                        <GitBranch className="w-6 h-6" />
                        Workflows
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage content approval processes</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            setEditingWorkflow(null);
                            setFormData({ name: '', description: '', steps: [{ name: 'Draft' }, { name: 'Review' }, { name: 'Publish' }] });
                            setShowModal(true);
                        }}
                        className="px-3.5 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        Quick Template
                    </button>
                    <button
                        onClick={() => navigate(`/dashboard/project/${projectId}/workflows/new`)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Visual Builder
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {workflows.map(workflow => (
                    <div key={workflow._id} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-semibold text-lg dark:text-white">{workflow.name}</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">{workflow.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => navigate(`/dashboard/project/${projectId}/workflows/${workflow._id || workflow.apiId}/edit`)}
                                    className="px-3 py-1.5 text-xs font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg flex items-center gap-1 transition-colors"
                                >
                                    <Sliders className="w-3.5 h-3.5" />
                                    Builder
                                </button>
                                <button
                                    onClick={() => handleEdit(workflow)}
                                    title="Quick edit"
                                    className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(workflow._id!)}
                                    title="Delete"
                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Steps Visualization */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2">
                            {workflow.steps.map((step, index) => (
                                <div key={index} className="flex items-center">
                                    <div className="flex flex-col items-center min-w-[100px] p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800">
                                        <span className="font-medium text-sm dark:text-gray-200">{step.name}</span>
                                        {step.assignedTo && (
                                            <span className="text-xs text-gray-400 mt-1">
                                                By: {step.assignedTo}
                                            </span>
                                        )}
                                    </div>
                                    {index < workflow.steps.length - 1 && (
                                        <ArrowRight className="w-4 h-4 mx-2 text-gray-400" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {workflows.length === 0 && (
                    <div className="text-center py-12 text-gray-500 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                        <GitBranch className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                        <p>No workflows defined. Create one to start managing approvals.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-6 dark:text-white">
                            {editingWorkflow ? 'Edit Workflow' : 'Create Workflow'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent dark:text-white"
                                    placeholder="e.g. Standard Content Approval"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description || ''}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent dark:text-white"
                                    placeholder="Describe the workflow process..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Steps
                                </label>
                                <div className="space-y-2">
                                    {formData.steps?.map((step, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={step.name}
                                                onChange={e => {
                                                    const newSteps = [...(formData.steps || [])];
                                                    newSteps[index] = { ...newSteps[index], name: e.target.value };
                                                    setFormData({ ...formData, steps: newSteps });
                                                }}
                                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent dark:text-white"
                                                placeholder={`Step ${index + 1}`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newSteps = formData.steps?.filter((_, i) => i !== index);
                                                    setFormData({ ...formData, steps: newSteps });
                                                }}
                                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                            >
                                                <XCircle className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, steps: [...(formData.steps || []), { name: 'New Step' }] })}
                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                                    >
                                        <Plus className="w-4 h-4" /> Add Step
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    {editingWorkflow ? 'Save Changes' : 'Create Workflow'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
