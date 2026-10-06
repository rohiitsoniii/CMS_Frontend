import { api } from './api';

export interface EmailTemplate {
    _id?: string;
    projectId: string;
    name: string;
    subject: string;
    body: string;
    variables: string[];
    category: 'transactional' | 'marketing' | 'support';
    isActive: boolean;
    createdBy?: {
        _id: string;
        name: string;
        email: string;
    };
    createdAt?: string;
    updatedAt?: string;
}

class EmailTemplateService {
    // Get all templates
    async getTemplates(projectId: string): Promise<EmailTemplate[]> {
        const response = await api.get(`/email-templates?projectId=${projectId}`);
        const data = response.data?.data;
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.templates)) return data.templates;
        return [];
    }

    // Get single template
    async getTemplate(id: string): Promise<EmailTemplate> {
        const response = await api.get(`/email-templates/${id}`);
        return response.data?.data?.template || response.data?.data || response.data;
    }

    // Create template
    async createTemplate(data: Partial<EmailTemplate>): Promise<EmailTemplate> {
        const response = await api.post('/email-templates', data);
        return response.data?.data?.template || response.data?.data || response.data;
    }

    // Update template
    async updateTemplate(id: string, data: Partial<EmailTemplate>): Promise<EmailTemplate> {
        const response = await api.put(`/email-templates/${id}`, data);
        return response.data?.data?.template || response.data?.data || response.data;
    }

    // Delete template
    async deleteTemplate(id: string): Promise<void> {
        await api.delete(`/email-templates/${id}`);
    }

    // Preview template with variables
    async previewTemplate(id: string, variables: Record<string, string>): Promise<{ subject: string; body: string }> {
        const response = await api.post(`/email-templates/${id}/preview`, { variables });
        return response.data?.data || response.data;
    }

    // Send test email
    async sendTestEmail(id: string, to: string, variables: Record<string, string>): Promise<void> {
        await api.post(`/email-templates/${id}/test`, { to, variables });
    }
}

export const emailTemplateService = new EmailTemplateService();
