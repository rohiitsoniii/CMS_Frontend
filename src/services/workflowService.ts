import { api } from './api';

export interface WorkflowStep {
    id?: string;
    name: string;
    description?: string;
    assignedTo?: string;
    requiredApprovals?: number;
    requiresApproval?: boolean;
    autoApprove?: boolean;
}

export interface Workflow {
    _id?: string;
    apiId?: string;
    projectId?: string;
    name: string;
    description?: string;
    steps: WorkflowStep[];
    enabled?: boolean;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface WorkflowState {
    _id?: string;
    workflowId: string;
    workflowName?: string;
    contentId: string;
    currentStep?: number;
    currentStepId?: string;
    currentStepName?: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed' | 'in_progress';
    history?: any[];
    createdAt?: string;
    updatedAt?: string;
}

class WorkflowService {
    // Get all workflows
    async getWorkflows(projectId: string): Promise<Workflow[]> {
        try {
            const response = await api.get(`/workflows?projectId=${projectId}`);
            const data = response.data?.data;
            if (Array.isArray(data)) return data;
            if (Array.isArray(data?.workflows)) return data.workflows;
            return [];
        } catch (error) {
            console.error('Failed to get workflows:', error);
            return [];
        }
    }

    // Get single workflow
    async getWorkflow(id: string): Promise<Workflow> {
        const response = await api.get(`/workflows/${id}`);
        return response.data?.data || response.data;
    }

    // Create workflow
    async createWorkflow(data: Partial<Workflow>): Promise<Workflow> {
        const response = await api.post('/workflows', data);
        return response.data?.data || response.data;
    }

    // Update workflow
    async updateWorkflow(id: string, data: Partial<Workflow>): Promise<Workflow> {
        const response = await api.put(`/workflows/${id}`, data);
        return response.data?.data || response.data;
    }

    // Delete workflow
    async deleteWorkflow(id: string): Promise<void> {
        await api.delete(`/workflows/${id}`);
    }

    // Start / assign workflow for content
    async assignContent(workflowId: string, contentId: string): Promise<WorkflowState> {
        const response = await api.post(`/content/${contentId}/workflow/start`, { workflowId });
        return response.data?.data?.workflowState || response.data?.data;
    }

    // Approve / advance workflow step
    async approve(contentId: string, comment?: string): Promise<WorkflowState> {
        const response = await api.post(`/content/${contentId}/workflow/advance`, { comment });
        return response.data?.data?.workflowState || response.data?.data;
    }

    // Reject workflow step
    async reject(contentId: string, comment?: string): Promise<WorkflowState> {
        const response = await api.post(`/content/${contentId}/workflow/reject`, { comment });
        return response.data?.data?.workflowState || response.data?.data;
    }

    // Get workflow states for content
    async getContentWorkflowState(contentId: string): Promise<{ workflowState: WorkflowState | null; workflow?: Workflow | null } | null> {
        try {
            const response = await api.get(`/content/${contentId}/workflow`);
            const data = response.data?.data;
            if (!data) return null;
            if (data.workflowState !== undefined) {
                return { workflowState: data.workflowState, workflow: data.workflow };
            }
            return { workflowState: data, workflow: undefined };
        } catch (error) {
            return null;
        }
    }
}

export const workflowService = new WorkflowService();
