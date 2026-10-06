import { api } from './api';

export interface Version {
    _id?: string;
    contentId: string;
    version: number;
    data: Record<string, any>;
    status?: string;
    savedBy?: any;
    createdBy?: string;
    createdAt?: string;
    savedAt?: string;
    changeNote?: string;
    changes?: {
        field: string;
        oldValue: any;
        newValue: any;
    }[];
}

export interface VersionDiff {
    field: string;
    oldValue: any;
    newValue: any;
    type: 'added' | 'modified' | 'removed';
}

class VersionService {
    // Get all versions for content
    async getVersions(contentId: string): Promise<Version[]> {
        try {
            const response = await api.get(`/content/${contentId}/versions`);
            const data = response.data?.data;
            if (Array.isArray(data)) return data;
            if (Array.isArray(data?.versions)) return data.versions;
            return [];
        } catch (error) {
            console.error('Failed to get versions:', error);
            return [];
        }
    }

    // Get single version
    async getVersion(contentId: string, version: string | number): Promise<Version> {
        const response = await api.get(`/content/${contentId}/versions/${version}`);
        return response.data?.data?.version || response.data?.data || response.data;
    }

    // Compare two versions
    async compareVersions(arg1: string, arg2: string | number, arg3?: string | number): Promise<VersionDiff[]> {
        if (arg3 !== undefined) {
            const response = await api.get(`/content/${arg1}/versions/compare?from=${arg2}&to=${arg3}`);
            return response.data?.data?.diff || response.data?.data || response.data?.diff || [];
        }
        const response = await api.get(`/versions/compare?from=${arg1}&to=${arg2}`);
        return response.data?.data?.diff || response.data?.data || response.data?.diff || [];
    }

    // Restore version
    async restoreVersion(contentId: string, version: string | number): Promise<void> {
        await api.post(`/content/${contentId}/versions/${version}/restore`, {});
    }

    // Delete version
    async deleteVersion(contentIdOrVersionId: string, version?: string | number): Promise<void> {
        if (version !== undefined) {
            await api.delete(`/content/${contentIdOrVersionId}/versions/${version}`);
        } else {
            await api.delete(`/versions/${contentIdOrVersionId}`);
        }
    }
}

export const versionService = new VersionService();
