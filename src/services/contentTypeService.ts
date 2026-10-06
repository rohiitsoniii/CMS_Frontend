import { api } from './api';

export interface FieldDefinition {
    name: string;
    type: string;
    label?: string;
    required?: boolean;
    unique?: boolean;
    defaultValue?: any;
    validation?: {
        min?: number;
        max?: number;
        minLength?: number;
        maxLength?: number;
        pattern?: string;
        enum?: string[];
        customValidator?: string;
    };
    localized?: boolean;
    component?: string;
    targetModel?: string;
    multiple?: boolean;
    options?: Array<{ label: string; value: string }>;
}

export interface ContentType {
    _id?: string;
    name: string;
    displayName: string;
    description?: string;
    projectId: string;
    fields: FieldDefinition[];
    timestamps?: boolean;
    slug?: {
        field: string;
        unique: boolean;
    };
    versioning?: boolean;
    localization?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

class ContentTypeService {
    // Get all content types for a project
    async getContentTypes(projectId: string): Promise<ContentType[]> {
        const response = await api.get(`/content-types?projectId=${projectId}`);
        const data = response.data?.data;
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.contentTypes)) return data.contentTypes;
        return [];
    }

    // Get single content type
    async getContentType(id: string): Promise<ContentType> {
        const response = await api.get(`/content-types/${id}`);
        return response.data?.data?.contentType || response.data?.data || response.data;
    }

    // Create content type
    async createContentType(data: Partial<ContentType>): Promise<ContentType> {
        const response = await api.post('/content-types', data);
        return response.data?.data?.contentType || response.data?.data || response.data;
    }

    // Update content type
    async updateContentType(id: string, data: Partial<ContentType>): Promise<ContentType> {
        const response = await api.put(`/content-types/${id}`, data);
        return response.data?.data?.contentType || response.data?.data || response.data;
    }

    // Delete content type
    async deleteContentType(id: string): Promise<void> {
        await api.delete(`/content-types/${id}`);
    }

    // Validate content type
    async validateContentType(data: Partial<ContentType>): Promise<{ valid: boolean; errors?: string[] }> {
        const response = await api.post('/content-types/validate', data);
        return response.data?.data || response.data;
    }
}

export const contentTypeService = new ContentTypeService();
