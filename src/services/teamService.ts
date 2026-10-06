import { api, ApiError } from './api';
import { IRole } from './roleService';

export interface ITeamMember {
    _id: string;
    projectId: string;
    userId?: {
        _id: string;
        name: string;
        email: string;
        avatar?: string;
    };
    email: string;
    name: string;
    roleId: IRole | string;
    status: 'invited' | 'active' | 'suspended' | 'removed';
    invitedBy: {
        _id: string;
        name: string;
        email: string;
    };
    invitedAt: string;
    joinedAt?: string;
    lastActiveAt?: string;
}

class TeamService {
    async getMembers(projectId: string, status?: string): Promise<ITeamMember[]> {
        try {
            const url = status 
                ? `/team?projectId=${projectId}&status=${status}`
                : `/team?projectId=${projectId}`;
                
            const response = await api.get(url);
            const data = response.data?.data;
            if (Array.isArray(data)) return data;
            if (Array.isArray(data?.members)) return data.members;
            return [];
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Failed to fetch team members',
                error.response?.status
            );
        }
    }

    async inviteMember(projectId: string, email: string, name: string, roleId: string): Promise<ITeamMember> {
        try {
            const response = await api.post('/team/invite', { projectId, email, name, roleId });
            return response.data?.data?.member || response.data?.data || response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Failed to invite member',
                error.response?.status
            );
        }
    }

    async updateMember(id: string, data: { name?: string; avatar?: string }): Promise<ITeamMember> {
        try {
            const response = await api.put(`/team/${id}`, data);
            return response.data?.data?.member || response.data?.data || response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Failed to update member',
                error.response?.status
            );
        }
    }

    async changeRole(id: string, roleId: string): Promise<ITeamMember> {
        try {
            const response = await api.put(`/team/${id}/role`, { roleId });
            return response.data?.data?.member || response.data?.data || response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Failed to change role',
                error.response?.status
            );
        }
    }

    async suspendMember(id: string): Promise<ITeamMember> {
        try {
            const response = await api.put(`/team/${id}/suspend`, {});
            return response.data?.data?.member || response.data?.data || response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Failed to suspend member',
                error.response?.status
            );
        }
    }

    async reactivateMember(id: string): Promise<ITeamMember> {
        try {
            const response = await api.put(`/team/${id}/reactivate`, {});
            return response.data?.data?.member || response.data?.data || response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Failed to reactivate member',
                error.response?.status
            );
        }
    }

    async removeMember(id: string): Promise<void> {
        try {
            await api.delete(`/team/${id}`);
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Failed to remove member',
                error.response?.status
            );
        }
    }

    async resendInvitation(id: string): Promise<void> {
        try {
            await api.post(`/team/${id}/resend`, {});
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Failed to resend invitation',
                error.response?.status
            );
        }
    }

    async acceptInvitation(token: string): Promise<ITeamMember> {
        try {
            const response = await api.post('/team/accept-invite', { token });
            return response.data?.data?.member || response.data?.data || response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Failed to accept invitation',
                error.response?.status
            );
        }
    }
}

export const teamService = new TeamService();
