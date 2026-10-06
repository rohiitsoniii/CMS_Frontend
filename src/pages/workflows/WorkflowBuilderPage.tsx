import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, GripVertical, Save } from 'lucide-react';
import { workflowService, WorkflowStep } from '@/services/workflowService';
import { WorkflowBuilderSkeleton } from '@/components/skeletons';

export function WorkflowBuilderPage() {
    const { projectId, workflowId } = useParams<{ projectId: string; workflowId?: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const isEditMode = workflowId && workflowId !== 'new';

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        enabled: true,
        steps: [] as WorkflowStep[],
    });

    useEffect(() => {
        if (isEditMode) {
            loadWorkflow();
        }
    }, [workflowId]);

    const loadWorkflow = async () => {
        if (!workflowId) return;

        try {
            setLoading(true);
            const data = await workflowService.getWorkflow(workflowId);
            setFormData({
                name: data.name,
                description: data.description || '',
                enabled: data.enabled ?? true,
                steps: data.steps,
            });
        } catch (error) {
            console.error('Failed to load workflow:', error);
            toast.error('Failed to load workflow');
        } finally {
            setLoading(false);
        }
    };

    const handleAddStep = () => {
        setFormData({
            ...formData,
            steps: [
                ...formData.steps,
                {
                    name: '',
                    description: '',
                    assignedTo: '',
                    requiredApprovals: 1,
                    autoApprove: false,
                },
            ],
        });
    };

    const handleRemoveStep = (index: number) => {
        setFormData({
            ...formData,
            steps: formData.steps.filter((_, i) => i !== index),
        });
    };

    const handleStepChange = (index: number, field: keyof WorkflowStep, value: any) => {
        const newSteps = [...formData.steps];
        newSteps[index] = {
            ...newSteps[index],
            [field]: value,
        };
        setFormData({ ...formData, steps: newSteps });
    };

    const handleSave = async () => {
        if (!formData.name) {
            toast.error('Please enter a workflow name');
            return;
        }

        if (formData.steps.length === 0) {
            toast.error('Please add at least one step to your workflow');
            return;
        }

        // Validate steps
        for (let i = 0; i < formData.steps.length; i++) {
            if (!formData.steps[i].name) {
                alert(`Please enter a name for step ${i + 1}`);
                return;
            }
        }

        try {
            setSaving(true);

            const payload = {
                ...formData,
                projectId: projectId!,
            };

            if (isEditMode) {
                await workflowService.updateWorkflow(workflowId!, payload);
            } else {
                await workflowService.createWorkflow(payload);
            }

            navigate(`/dashboard/project/${projectId}/workflows`);
        } catch (error) {
            console.error('Failed to save workflow:', error);
            toast.error('Failed to save workflow');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <WorkflowBuilderSkeleton />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-6 py-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(`/dashboard/project/${projectId}/workflows`)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                {isEditMode ? 'Edit Workflow' : 'Create Workflow'}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                {isEditMode ? 'Update your approval workflow' : 'Define a new approval workflow'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto px-6 py-8">
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
                    {/* Basic Info */}
                    <div className="space-y-6 mb-8">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Workflow Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Content Approval"
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe this workflow..."
                                rows={3}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.enabled}
                                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    Enabled
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Workflow Steps */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Workflow Steps
                            </h2>
                            <button
                                onClick={handleAddStep}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add Step
                            </button>
                        </div>

                        {formData.steps.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    No steps yet. Add your first step to get started.
                                </p>
                                <button
                                    onClick={handleAddStep}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all"
                                >
                                    <Plus className="w-5 h-5" />
                                    Add First Step
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {formData.steps.map((step, index) => (
                                    <div
                                        key={index}
                                        className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="cursor-grab pt-2">
                                                <GripVertical className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <div className="flex-1 space-y-4">
                                                {/* Step Number */}
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                        Step {index + 1}
                                                    </span>
                                                    <button
                                                        onClick={() => handleRemoveStep(index)}
                                                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                                                    </button>
                                                </div>

                                                {/* Step Name */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Step Name *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={step.name}
                                                        onChange={(e) => handleStepChange(index, 'name', e.target.value)}
                                                        placeholder="e.g., Manager Review"
                                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                    />
                                                </div>

                                                {/* Step Description */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Description
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={step.description || ''}
                                                        onChange={(e) => handleStepChange(index, 'description', e.target.value)}
                                                        placeholder="Describe this step..."
                                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                    />
                                                </div>

                                                {/* Assigned To */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Assigned To (Email)
                                                    </label>
                                                    <input
                                                        type="email"
                                                        value={step.assignedTo || ''}
                                                        onChange={(e) => handleStepChange(index, 'assignedTo', e.target.value)}
                                                        placeholder="user@example.com"
                                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                    />
                                                </div>

                                                {/* Required Approvals */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Required Approvals
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={step.requiredApprovals || 1}
                                                        onChange={(e) => handleStepChange(index, 'requiredApprovals', parseInt(e.target.value))}
                                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                    />
                                                </div>

                                                {/* Auto Approve */}
                                                <div>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={step.autoApprove || false}
                                                            onChange={(e) => handleStepChange(index, 'autoApprove', e.target.checked)}
                                                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                                        />
                                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                                            Auto-approve this step
                                                        </span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-8 border-t border-gray-200 dark:border-gray-700 mt-8">
                        <button
                            onClick={() => navigate(`/dashboard/project/${projectId}/workflows`)}
                            className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="w-5 h-5" />
                            {saving ? 'Saving...' : isEditMode ? 'Update Workflow' : 'Create Workflow'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
