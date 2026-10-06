import { api } from './api';

export interface Locale {
    _id?: string;
    projectId: string;
    code: string;
    name: string;
    isDefault?: boolean;
    fallbackLocale?: string;
    enabled?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

class LocaleService {
    // Get all locales for a project
    async getLocales(projectId: string): Promise<Locale[]> {
        const response = await api.get(`/locales?projectId=${projectId}`);
        const data = response.data?.data;
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.locales)) return data.locales;
        return [];
    }

    // Get single locale
    async getLocale(id: string): Promise<Locale> {
        const response = await api.get(`/locales/${id}`);
        return response.data?.data?.locale || response.data?.data || response.data;
    }

    // Create locale
    async createLocale(data: Partial<Locale>): Promise<Locale> {
        const response = await api.post('/locales', data);
        return response.data?.data?.locale || response.data?.data || response.data;
    }

    // Update locale
    async updateLocale(id: string, data: Partial<Locale>): Promise<Locale> {
        const response = await api.put(`/locales/${id}`, data);
        return response.data?.data?.locale || response.data?.data || response.data;
    }

    // Delete locale
    async deleteLocale(id: string): Promise<void> {
        await api.delete(`/locales/${id}`);
    }

    // Set default locale
    async setDefaultLocale(projectId: string, localeId: string): Promise<void> {
        await api.post(`/locales/${localeId}/set-default`, { projectId });
    }
}

export const localeService = new LocaleService();
