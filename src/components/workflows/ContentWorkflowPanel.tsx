import React, { useState, useEffect } from 'react';
import { GitBranch, CheckCircle2, Clock, AlertTriangle, ArrowRight, RefreshCw, Send, MessageSquare, ShieldCheck, Check } from 'lucide-react';
import { workflowService, Workflow, WorkflowState } from '@/services/workflowService';
import toast from 'react-hot-toast';

interface ContentWorkflowPanelProps {
    contentId: string;
    projectId: string;
    contentStatus?: string;
    onContentUpdated?: () => void;
}

export const ContentWorkflowPanel: React.FC<ContentWorkflowPanelProps> = ({
    contentId,
    projectId,
    contentStatus,
    onContentUpdated,
}) => {
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [workflowState, setWorkflowState] = useState<WorkflowState | null>(null);
    const [workflow, setWorkflow] = useState<Workflow | null>(null);
    const [availableWorkflows, setAvailableWorkflows] = useState<Workflow[]>([]);
    const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>('');
    const [comment, setComment] = useState<string>('');

    useEffect(() => {
        loadData();
    }, [contentId, projectId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [stateRes, workflowsRes] = await Promise.all([
                workflowService.getContentWorkflowState(contentId),
                workflowService.getWorkflows(projectId),
            ]);

            setWorkflowState(stateRes?.workflowState || null);
            setWorkflow(stateRes?.workflow || null);
            setAvailableWorkflows(workflowsRes || []);

            if (workflowsRes && workflowsRes.length > 0 && !selectedWorkflowId) {
                setSelectedWorkflowId(workflowsRes[0]._id || workflowsRes[0].apiId || '');
            }
        } catch (error) {
            console.error('Failed to load workflow state:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssignWorkflow = async () => {
        if (!selectedWorkflowId) {
            toast.error('Please select a workflow');
            return;
        }

        try {
            setActionLoading(true);
            await workflowService.assignContent(selectedWorkflowId, contentId);
            toast.success('Workflow assigned and started successfully');
            await loadData();
            if (onContentUpdated) onContentUpdated();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to assign workflow');
        } finally {
            setActionLoading(false);
        }
    };

    const handleApprove = async () => {
        try {
            setActionLoading(true);
            const result = await workflowService.approve(contentId, comment.trim() || undefined);
            toast.success('Step approved successfully');
            setComment('');
            await loadData();
            if (onContentUpdated) onContentUpdated();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to approve step');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        try {
            setActionLoading(true);
            await workflowService.reject(contentId, comment.trim() || undefined);
            toast.success('Step rejected / sent back');
            setComment('');
            await loadData();
            if (onContentUpdated) onContentUpdated();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to reject step');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
                <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">Loading workflow status...</span>
            </div>
        );
    }

    // Case 1: No workflow active on this content
    if (!workflowState) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
                <div className="max-w-xl mx-auto text-center space-y-6">
                    <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto">
                        <GitBranch className="w-7 h-7" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">No Workflow Assigned</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Assign an approval pipeline to enforce multi-step review and publishing controls for this entry.
                        </p>
                    </div>

                    {availableWorkflows.length > 0 ? (
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700 text-left space-y-4">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Select Approval Workflow
                            </label>
                            <select
                                value={selectedWorkflowId}
                                onChange={(e) => setSelectedWorkflowId(e.target.value)}
                                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                {availableWorkflows.map((wf) => (
                                    <option key={wf._id || wf.apiId} value={wf._id || wf.apiId}>
                                        {wf.name} ({wf.steps?.length || 0} steps)
                                    </option>
                                ))}
                            </select>

                            <button
                                onClick={handleAssignWorkflow}
                                disabled={actionLoading}
                                className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                            >
                                {actionLoading ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                                Start & Assign Workflow
                            </button>
                        </div>
                    ) : (
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-xl border border-amber-200 dark:border-amber-800 text-sm">
                            <p className="font-semibold">No workflows configured in this project.</p>
                            <p className="mt-1">Create a workflow in the Workflows section first to enable approval pipelines.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Determine step status in pipeline
    const steps = workflow?.steps || [];
    const currentStepIndex = steps.findIndex(
        (s) => s.id === workflowState.currentStepId || s.name === workflowState.currentStepName
    );

    const isCompleted = workflowState.status === 'completed' || workflowState.status === 'approved';
    const isRejected = workflowState.status === 'rejected';

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 space-y-8">
            {/* Header info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                        <GitBranch className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {workflowState.workflowName || workflow?.name || 'Approval Workflow'}
                            </h3>
                            <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                                    isCompleted
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : isRejected
                                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                        : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                                }`}
                            >
                                {workflowState.status.replace('_', ' ')}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            Current Stage: <span className="font-semibold text-gray-700 dark:text-gray-200">{workflowState.currentStepName || 'Active'}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={loadData}
                        className="p-2 text-gray-500 hover:text-gray-800 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Refresh workflow status"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Pipeline Visualizer */}
            {steps.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Pipeline Progress
                    </h4>
                    <div className="flex items-center gap-3 overflow-x-auto py-2">
                        {steps.map((step, idx) => {
                            const isPast = isCompleted || (currentStepIndex >= 0 && idx < currentStepIndex);
                            const isCurrent = !isCompleted && !isRejected && (idx === currentStepIndex || step.name === workflowState.currentStepName);

                            return (
                                <React.Fragment key={step.id || idx}>
                                    <div
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all min-w-[160px] ${
                                            isCurrent
                                                ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-400 dark:border-indigo-600 shadow-sm'
                                                : isPast
                                                ? 'bg-green-50/60 dark:bg-green-900/10 border-green-300 dark:border-green-800'
                                                : 'bg-gray-50 dark:bg-gray-900/40 border-gray-200 dark:border-gray-800 opacity-60'
                                        }`}
                                    >
                                        <div
                                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                                isCurrent
                                                    ? 'bg-indigo-600 text-white'
                                                    : isPast
                                                    ? 'bg-green-600 text-white'
                                                    : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                            }`}
                                        >
                                            {isPast ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                                                {step.name}
                                            </p>
                                            {step.assignedTo && (
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    {Array.isArray(step.assignedTo) ? step.assignedTo.join(', ') : step.assignedTo}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {idx < steps.length - 1 && (
                                        <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Actions for in_progress workflows */}
            {!isCompleted && !isRejected ? (
                <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-6 border border-gray-200 dark:border-gray-700 space-y-4">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-indigo-600" />
                        Stage Decision & Approval
                    </h4>

                    <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                            Review Comments / Notes (Optional)
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Add approval context or change requests..."
                            rows={3}
                            className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                        <button
                            onClick={handleApprove}
                            disabled={actionLoading}
                            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
                        >
                            {actionLoading ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <CheckCircle2 className="w-4 h-4" />
                            )}
                            Approve & Advance Step
                        </button>

                        <button
                            onClick={handleReject}
                            disabled={actionLoading}
                            className="flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 disabled:opacity-50 rounded-lg text-sm font-semibold transition-colors"
                        >
                            <AlertTriangle className="w-4 h-4" />
                            Reject & Send Back
                        </button>
                    </div>
                </div>
            ) : isCompleted ? (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <div>
                        <p className="font-semibold text-sm">Workflow Complete</p>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                            All pipeline steps have been completed and approved. Content is published and live.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <div>
                        <p className="font-semibold text-sm">Workflow Rejected</p>
                        <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                            This workflow was rejected during review. Update the content according to review notes before resubmitting.
                        </p>
                    </div>
                </div>
            )}

            {/* Audit History Timeline */}
            {workflowState.history && workflowState.history.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Workflow Audit Trail
                    </h4>
                    <div className="space-y-3">
                        {workflowState.history.map((item, idx) => (
                            <div
                                key={idx}
                                className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-gray-100 dark:border-gray-800"
                            >
                                <div
                                    className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                                        item.action === 'advance'
                                            ? 'bg-green-500'
                                            : item.action === 'reject'
                                            ? 'bg-red-500'
                                            : 'bg-indigo-500'
                                    }`}
                                />
                                <div className="flex-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-semibold text-gray-800 dark:text-gray-200 capitalize">
                                            {item.action === 'advance' ? 'Approved Step' : item.action} &bull; {item.stepName}
                                        </span>
                                        <span className="text-gray-400">
                                            {item.performedAt ? new Date(item.performedAt).toLocaleString() : ''}
                                        </span>
                                    </div>
                                    {item.comment && (
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 italic">
                                            "{item.comment}"
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
