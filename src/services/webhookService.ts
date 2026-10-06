import { api, ApiError } from './api';

export interface IWebhook {
    _id: string;
    projectId: string;
    name: string;
    url: string;
    events: string[];
    headers?: Record<string, string>;
    secret?: string;
    isEnabled: boolean;
    failureCount: number;
    lastTriggeredAt?: string;
    createdAt: string;
    updatedAt: string;
}

class WebhookService {
    async getWebhooks(projectId: string): Promise<IWebhook[]> {
        try {
            const response = await api.get(`/webhooks?projectId=${projectId}`);
            const data = response.data?.data;
            if (Array.isArray(data)) return data;
            if (Array.isArray(data?.webhooks)) return data.webhooks;
            return [];
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Failed to fetch webhooks',
                error.response?.status
            );
        }
    }

    async createWebhook(data: Partial<IWebhook>): Promise<IWebhook> {
        try {
            const response = await api.post('/webhooks', data);
            return response.data?.data?.webhook || response.data?.data || response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Failed to create webhook',
                error.response?.status
            );
        }
    }

    async updateWebhook(id: string, data: Partial<IWebhook>): Promise<IWebhook> {
        try {
            const response = await api.put(`/webhooks/${id}`, data);
            return response.data?.data?.webhook || response.data?.data || response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Failed to update webhook',
                error.response?.status
            );
        }
    }

    async deleteWebhook(id: string): Promise<void> {
        try {
            await api.delete(`/webhooks/${id}`);
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Failed to delete webhook',
                error.response?.status
            );
        }
    }

    async testWebhook(id: string): Promise<{ success: boolean; statusCode: number; responseTime: number }> {
        try {
            const response = await api.post(`/webhooks/${id}/test`, {});
            return response.data?.data || response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Failed to test webhook',
                error.response?.status
            );
        }
    }

    async getWebhookLogs(id: string): Promise<any[]> {
        try {
            const response = await api.get(`/webhooks/${id}/logs`);
            return response.data?.data || [];
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Failed to fetch webhook logs',
                error.response?.status
            );
        }
    }
}

export const webhookService = new WebhookService();
