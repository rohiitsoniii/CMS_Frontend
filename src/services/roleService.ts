import { api, ApiError } from './api';

export interface IPermission {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    [key: string]: boolean;
}

export interface IRolePermissions {
    content: IPermission;
    contentTypes: IPermission;
    media: IPermission;
    workflows: IPermission;
    schedules: IPermission;
    locales: IPermission;
    versions: IPermission;
    team: IPermission;
    roles: IPermission;
    endUsers: IPermission;
    emailTemplates: IPermission;
    supportTickets: IPermission;
    emailCampaigns: IPermission;
    settings: IPermission;
    analytics: IPermission;
    project: IPermission;
    custom: Record<string, boolean>;
}

export interface IRole {
    _id: string;
    projectId: string;
    name: string;
    description?: string;
    permissions: IRolePermissions;
    restrictions: any;
    isSystemRole: boolean;
    createdAt: string;
    updatedAt: string;
}

class RoleService {
    async getRoles(projectId: string): Promise<IRole[]> {
        try {
            const response = await api.get(`/roles?projectId=${projectId}`);
            const data = response.data?.data;
            if (Array.isArray(data)) return data;
            if (Array.isArray(data?.roles)) return data.roles;
            return [];
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Failed to fetch roles',
                error.response?.status
            );
        }
    }

    async getRole(id: string): Promise<IRole> {
        try {
            const response = await api.get(`/roles/${id}`);
            return response.data?.data?.role || response.data?.data || response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Failed to fetch role',
                error.response?.status
            );
        }
    }

    async createRole(data: Partial<IRole>): Promise<IRole> {
        try {
            const response = await api.post('/roles', data);
            return response.data?.data?.role || response.data?.data || response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Failed to create role',
                error.response?.status
            );
        }
    }

    async updateRole(id: string, data: Partial<IRole>): Promise<IRole> {
        try {
            const response = await api.put(`/roles/${id}`, data);
            return response.data?.data?.role || response.data?.data || response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Failed to update role',
                error.response?.status
            );
        }
    }

    async deleteRole(id: string): Promise<void> {
        try {
            await api.delete(`/roles/${id}`);
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Failed to delete role',
                error.response?.status
            );
        }
    }

    async cloneRole(id: string, name: string): Promise<IRole> {
        try {
            const response = await api.post(`/roles/${id}/clone`, { name });
            return response.data?.data?.role || response.data?.data || response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Failed to clone role',
                error.response?.status
            );
        }
    }

    async getDefaultRoles(projectId: string): Promise<IRole[]> {
        try {
            const response = await api.get(`/roles/default?projectId=${projectId}`);
            const data = response.data?.data;
            if (Array.isArray(data)) return data;
            return [];
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Failed to fetch default roles',
                error.response?.status
            );
        }
    }
}

export const roleService = new RoleService();
