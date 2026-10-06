import { api } from './api';

export interface Schedule {
    _id?: string;
    projectId: string;
    contentId: string;
    action: 'publish' | 'unpublish' | 'archive';
    scheduledFor: string;
    recurring?: {
        enabled: boolean;
        frequency: 'daily' | 'weekly' | 'monthly';
        interval?: number;
        endDate?: string;
    };
    timezone?: string;
    status?: 'pending' | 'completed' | 'failed' | 'cancelled';
    executedAt?: string;
    error?: string;
    createdAt?: string;
    updatedAt?: string;
}

class ScheduleService {
    // Get all schedules
    async getSchedules(projectId: string): Promise<Schedule[]> {
        const response = await api.get(`/schedules?projectId=${projectId}`);
        const data = response.data?.data;
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.schedules)) return data.schedules;
        return [];
    }

    // Get single schedule
    async getSchedule(id: string): Promise<Schedule> {
        const response = await api.get(`/schedules/${id}`);
        return response.data?.data?.schedule || response.data?.data || response.data;
    }

    // Create schedule
    async createSchedule(data: Partial<Schedule>): Promise<Schedule> {
        const response = await api.post('/schedules', data);
        return response.data?.data?.schedule || response.data?.data || response.data;
    }

    // Update schedule
    async updateSchedule(id: string, data: Partial<Schedule>): Promise<Schedule> {
        const response = await api.put(`/schedules/${id}`, data);
        return response.data?.data?.schedule || response.data?.data || response.data;
    }

    // Delete schedule
    async deleteSchedule(id: string): Promise<void> {
        await api.delete(`/schedules/${id}`);
    }

    // Execute schedule now
    async executeNow(id: string): Promise<void> {
        await api.post(`/schedules/${id}/execute`, {});
    }

    // Pause schedule
    async pauseSchedule(id: string): Promise<void> {
        await api.post(`/schedules/${id}/pause`, {});
    }

    // Resume schedule
    async resumeSchedule(id: string): Promise<void> {
        await api.post(`/schedules/${id}/resume`, {});
    }

    // Get upcoming schedules
    async getUpcoming(projectId: string, limit: number = 10): Promise<Schedule[]> {
        const response = await api.get(`/schedules/upcoming?projectId=${projectId}&limit=${limit}`);
        const data = response.data?.data;
        if (Array.isArray(data)) return data;
        return [];
    }

    // Get schedule history
    async getHistory(projectId: string, limit: number = 50): Promise<Schedule[]> {
        const response = await api.get(`/schedules/history?projectId=${projectId}&limit=${limit}`);
        const data = response.data?.data;
        if (Array.isArray(data)) return data;
        return [];
    }
}

export const scheduleService = new ScheduleService();
