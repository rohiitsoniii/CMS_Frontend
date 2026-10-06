import { api } from './api';

export interface Content {
    _id?: string;
    contentTypeId?: string;
    projectId?: string;
    name?: string;
    slug?: string;
    type?: string;
    data: Record<string, any>;
    status?: 'draft' | 'published' | 'scheduled' | 'archived';
    locale?: string;
    version?: number;
    createdBy?: any;
    updatedBy?: any;
    publishedAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ContentQuery {
    projectId: string;
    contentTypeId?: string;
    type?: string;
    status?: string;
    locale?: string;
    search?: string;
    page?: number;
    limit?: number;
    sort?: string;
}

class ContentService {
    // Get all content
    async getContent(query: ContentQuery): Promise<{ data: Content[]; total: number; page: number; pages: number }> {
        const params = new URLSearchParams();
        Object.entries(query).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, String(value));
            }
        });

        const response = await api.get(`/content?${params.toString()}`);
        const resData = response.data;
        const contents = Array.isArray(resData?.data) 
            ? resData.data 
            : Array.isArray(resData?.contents) 
                ? resData.contents 
                : Array.isArray(resData?.data?.contents)
                    ? resData.data.contents
                    : [];

        return {
            data: contents,
            total: resData?.total || resData?.pagination?.total || contents.length,
            page: resData?.page || resData?.pagination?.page || 1,
            pages: resData?.pages || resData?.pagination?.pages || 1,
        };
    }

    // Get single content
    async getContentById(id: string, projectId?: string): Promise<Content> {
        const url = projectId ? `/projects/${projectId}/content/${id}` : `/content/${id}`;
        const response = await api.get(url);
        return response.data?.data?.content || response.data?.data || response.data?.content || response.data;
    }

    // Create content
    async createContent(data: Partial<Content>): Promise<Content> {
        const url = data.projectId ? `/projects/${data.projectId}/content` : '/content';
        const response = await api.post(url, data);
        return response.data?.data?.content || response.data?.data || response.data?.content || response.data;
    }

    // Update content
    async updateContent(id: string, data: Partial<Content>): Promise<Content> {
        const url = data.projectId ? `/projects/${data.projectId}/content/${id}` : `/content/${id}`;
        const response = await api.put(url, data);
        return response.data?.data?.content || response.data?.data || response.data?.content || response.data;
    }

    // Delete content
    async deleteContent(id: string, projectId?: string): Promise<void> {
        const url = projectId ? `/projects/${projectId}/content/${id}` : `/content/${id}`;
        await api.delete(url);
    }

    // Publish content
    async publishContent(id: string, projectId?: string): Promise<Content> {
        const url = projectId ? `/projects/${projectId}/content/${id}/publish` : `/content/${id}/publish`;
        const response = await api.post(url, {});
        return response.data?.data?.content || response.data?.data || response.data?.content || response.data;
    }

    // Unpublish content
    async unpublishContent(id: string, projectId?: string): Promise<Content> {
        const url = projectId ? `/projects/${projectId}/content/${id}/unpublish` : `/content/${id}/unpublish`;
        const response = await api.post(url, {});
        return response.data?.data?.content || response.data?.data || response.data?.content || response.data;
    }

    // Archive content
    async archiveContent(id: string, projectId?: string): Promise<Content> {
        const url = projectId ? `/projects/${projectId}/content/${id}/archive` : `/content/${id}/archive`;
        const response = await api.post(url, {});
        return response.data?.data?.content || response.data?.data || response.data?.content || response.data;
    }

    // Duplicate content
    async duplicateContent(id: string, projectId?: string): Promise<Content> {
        const url = projectId ? `/projects/${projectId}/content/${id}/duplicate` : `/content/${id}/duplicate`;
        const response = await api.post(url, {});
        return response.data?.data?.content || response.data?.data || response.data?.content || response.data;
    }
}

export const contentService = new ContentService();
