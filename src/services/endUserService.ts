import { api, ApiError } from './api';

export interface IEndUser {
    _id: string;
    projectId: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    phone?: string;
    dateOfBirth?: string;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        zipCode?: string;
    };
    customFields: Record<string, any>;
    status: 'active' | 'suspended' | 'deleted';
    emailVerified: boolean;
    lastLoginAt?: string;
    loginCount: number;
    createdAt: string;
}

class EndUserService {
    async getUsers(projectId: string, page = 1, limit = 50, status?: string): Promise<{ data: IEndUser[]; pagination: any }> {
        try {
            let url = `/users?projectId=${projectId}&page=${page}&limit=${limit}`;
            if (status) url += `&status=${status}`;

            const response = await api.get(url);
            const resData = response.data;
            const users = Array.isArray(resData?.data) ? resData.data : (Array.isArray(resData?.users) ? resData.users : []);
            return {
                data: users,
                pagination: resData?.pagination || { page, limit, total: users.length, pages: 1 }
            };
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Failed to fetch users',
                error.response?.status
            );
        }
    }

    async getUser(id: string): Promise<IEndUser> {
        try {
            const response = await api.get(`/users/${id}`);
            return response.data?.data?.user || response.data?.data || response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Failed to fetch user',
                error.response?.status
            );
        }
    }

    async createUser(data: Partial<IEndUser>): Promise<IEndUser> {
        try {
            const response = await api.post('/users', data);
            return response.data?.data?.user || response.data?.data || response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Failed to create user',
                error.response?.status
            );
        }
    }

    async updateUser(id: string, data: Partial<IEndUser>): Promise<IEndUser> {
        try {
            const response = await api.put(`/users/${id}`, data);
            return response.data?.data?.user || response.data?.data || response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Failed to update user',
                error.response?.status
            );
        }
    }

    async suspendUser(id: string): Promise<IEndUser> {
        try {
            const response = await api.put(`/users/${id}/suspend`, {});
            return response.data?.data?.user || response.data?.data || response.data;
        } catch (error: any) {
            const fallback = await api.put(`/users/${id}`, { status: 'suspended' });
            return fallback.data?.data?.user || fallback.data?.data || fallback.data;
        }
    }

    async deleteUser(id: string): Promise<void> {
        try {
            await api.delete(`/users/${id}`);
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Failed to delete user',
                error.response?.status
            );
        }
    }
}

export const endUserService = new EndUserService();
