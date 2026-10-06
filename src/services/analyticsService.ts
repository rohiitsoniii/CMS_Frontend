import { api, ApiError } from './api';

export interface IAnalyticsOverview {
    totalPageViews: number;
    uniqueVisitors: number;
    totalSessions: number;
    avgSessionDuration: number;
    bounceRate: number;
}

export interface IAnalyticsData {
    overview: IAnalyticsOverview;
    dailyData: any[];
}

class AnalyticsService {
    async getOverview(projectId: string, startDate?: string, endDate?: string): Promise<IAnalyticsData> {
        try {
            let url = `/admin/analytics/overview?projectId=${projectId}`;
            if (startDate) url += `&startDate=${startDate}`;
            if (endDate) url += `&endDate=${endDate}`;

            const response = await api.get(url);
            return response.data?.data || response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Failed to fetch analytics overview',
                error.response?.status
            );
        }
    }

    async getPageAnalytics(projectId: string, startDate?: string, endDate?: string, limit = 10): Promise<any[]> {
        try {
            let url = `/admin/analytics/pages?projectId=${projectId}&limit=${limit}`;
            if (startDate) url += `&startDate=${startDate}`;
            if (endDate) url += `&endDate=${endDate}`;

            const response = await api.get(url);
            const data = response.data?.data;
            if (Array.isArray(data)) return data;
            return [];
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Failed to fetch page analytics',
                error.response?.status
            );
        }
    }

    async getReferrerAnalytics(projectId: string, startDate?: string, endDate?: string, limit = 10): Promise<any[]> {
        try {
            let url = `/admin/analytics/referrers?projectId=${projectId}&limit=${limit}`;
            if (startDate) url += `&startDate=${startDate}`;
            if (endDate) url += `&endDate=${endDate}`;

            const response = await api.get(url);
            const data = response.data?.data;
            if (Array.isArray(data)) return data;
            return [];
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Failed to fetch referrer analytics',
                error.response?.status
            );
        }
    }

    async getDeviceAnalytics(projectId: string, startDate?: string, endDate?: string): Promise<any> {
        try {
            let url = `/admin/analytics/devices?projectId=${projectId}`;
            if (startDate) url += `&startDate=${startDate}`;
            if (endDate) url += `&endDate=${endDate}`;

            const response = await api.get(url);
            return response.data?.data || response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Failed to fetch device analytics',
                error.response?.status
            );
        }
    }

    async getGeographicAnalytics(projectId: string, startDate?: string, endDate?: string, limit = 10): Promise<any[]> {
        try {
            let url = `/admin/analytics/geographic?projectId=${projectId}&limit=${limit}`;
            if (startDate) url += `&startDate=${startDate}`;
            if (endDate) url += `&endDate=${endDate}`;

            const response = await api.get(url);
            const data = response.data?.data;
            if (Array.isArray(data)) return data;
            return [];
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Failed to fetch geographic analytics',
                error.response?.status
            );
        }
    }

    async getVisitorAnalytics(projectId: string, startDate?: string, endDate?: string): Promise<{ devices: any[]; countries: any[] }> {
        try {
            const [devices, countries] = await Promise.all([
                this.getDeviceAnalytics(projectId, startDate, endDate).catch(() => []),
                this.getGeographicAnalytics(projectId, startDate, endDate).catch(() => []),
            ]);
            const safeDevices: any = devices;
            const safeCountries: any = countries;
            return {
                devices: Array.isArray(safeDevices) ? safeDevices : safeDevices?.devices || [],
                countries: Array.isArray(safeCountries) ? safeCountries : safeCountries?.countries || [],
            };
        } catch (error) {
            return { devices: [], countries: [] };
        }
    }

    async getRealtime(projectId: string): Promise<{ currentPages: any[] }> {
        try {
            const response = await api.get(`/admin/analytics/realtime?projectId=${projectId}`).catch(() => null);
            return response?.data?.data || { currentPages: [] };
        } catch (error) {
            return { currentPages: [] };
        }
    }

    async exportData(projectId: string): Promise<void> {
        try {
            const response = await api.get(`/admin/analytics/export?projectId=${projectId}`, { responseType: 'blob' });
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `analytics-${projectId}-${Date.now()}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
            throw error;
        }
    }
}

export const analyticsService = new AnalyticsService();
