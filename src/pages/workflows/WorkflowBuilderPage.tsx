import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, GripVertical, Save, GitBranch } from 'lucide-react';
import { workflowService, WorkflowStep } from '@/services/workflowService';
import { WorkflowBuilderSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';

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
                toast.error(`Please enter a name for step ${i + 1}`);
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

            toast.success('Workflow saved successfully');
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
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/dashboard/project/${projectId}/workflows`)}
                    aria-label="Back to workflows"
                    className="h-9 w-9 text-gray-500 hover:text-gray-900 dark:hover:text-white"
                >
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <GitBranch className="w-5 h-5 text-indigo-500" />
                        {isEditMode ? 'Edit Workflow' : 'Create Workflow'}
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {isEditMode ? 'Update your approval workflow rules and steps' : 'Define a new sequential approval process'}
                    </p>
                </div>
            </div>

            {/* Form Container */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/80 dark:border-gray-800 p-6 lg:p-8 shadow-sm">
                {/* Basic Info */}
                <div className="space-y-5 mb-8">
                    <div>
                        <label className="block text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1.5">
                            Workflow Name *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Content Approval"
                            className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1.5">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe the scope of this workflow..."
                            rows={3}
                            className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white resize-none"
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.enabled}
                                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 dark:bg-gray-900"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Enabled for publishing checks
                            </span>
                        </label>
                    </div>
                </div>

                {/* Workflow Steps */}
                <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-base font-bold text-gray-900 dark:text-white">
                                Workflow Steps ({formData.steps.length})
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Stages must be approved in sequence from top to bottom
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAddStep}
                        >
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            Add Step
                        </Button>
                    </div>

                    {formData.steps.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                No steps yet. Add your first step to get started.
                            </p>
                            <Button
                                type="button"
                                onClick={handleAddStep}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add First Step
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {formData.steps.map((step, index) => (
                                <div
                                    key={index}
                                    className="p-5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-900/30"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="cursor-grab pt-2 text-gray-400">
                                            <GripVertical className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            {/* Step Header */}
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                                    Step {index + 1}
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label={`Remove step ${index + 1}`}
                                                    onClick={() => handleRemoveStep(index)}
                                                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>

                                            {/* Step Name */}
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                                                    Step Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={step.name}
                                                    onChange={(e) => handleStepChange(index, 'name', e.target.value)}
                                                    placeholder="e.g., Manager Review"
                                                    className="w-full px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white"
                                                />
                                            </div>

                                            {/* Step Description */}
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                                                    Description
                                                </label>
                                                <input
                                                    type="text"
                                                    value={step.description || ''}
                                                    onChange={(e) => handleStepChange(index, 'description', e.target.value)}
                                                    placeholder="Describe tasks for this step..."
                                                    className="w-full px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white"
                                                />
                                            </div>

                                            {/* Assigned To */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                                                        Assigned To (Email / Role)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={step.assignedTo || ''}
                                                        onChange={(e) => handleStepChange(index, 'assignedTo', e.target.value)}
                                                        placeholder="e.g. editor@company.com"
                                                        className="w-full px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                                                        Required Approvals
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={step.requiredApprovals || 1}
                                                        onChange={(e) => handleStepChange(index, 'requiredApprovals', parseInt(e.target.value))}
                                                        className="w-full px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white"
                                                    />
                                                </div>
                                            </div>

                                            {/* Auto Approve */}
                                            <div>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={step.autoApprove || false}
                                                        onChange={(e) => handleStepChange(index, 'autoApprove', e.target.checked)}
                                                        className="w-3.5 h-3.5 text-indigo-600 rounded focus:ring-indigo-500"
                                                    />
                                                    <span className="text-xs text-gray-600 dark:text-gray-400">
                                                        Auto-approve this step if no reviewers reject within 24h
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

                {/* Bottom Actions */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-800 mt-8">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate(`/dashboard/project/${projectId}/workflows`)}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="shadow-sm"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Saving...' : isEditMode ? 'Update Workflow' : 'Create Workflow'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default WorkflowBuilderPage;
