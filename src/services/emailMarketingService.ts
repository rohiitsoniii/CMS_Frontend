import { api } from './api';

/** Email marketing API — /projects/:projectId/email/* */

export interface EmailSettings {
    _id?: string;
    provider: 'custom' | 'system';
    preset?: string;
    smtp?: { host: string; port: number; secure: boolean; auth: { user: string; hasPassword?: boolean } };
    fromName: string;
    fromEmail: string;
    replyTo?: string;
    physicalAddress?: string;
    doubleOptIn: boolean;
    isActive: boolean;
    isVerified: boolean;
    lastTestedAt?: string;
    lastError?: string;
    limits?: { dailyLimit: number; monthlyLimit: number; currentDailyCount: number; currentMonthlyCount: number };
}

export interface SmtpPreset { host: string; port: number; secure: boolean; hint: string }

export interface Subscriber {
    _id: string;
    email: string;
    name?: string;
    phone?: string;
    status: 'pending' | 'subscribed' | 'unsubscribed' | 'bounced' | 'complained';
    source: string;
    sourceDetail?: string;
    tags: string[];
    customFields?: Record<string, string>;
    subscribedAt: string;
    totalEmailsReceived: number;
    totalEmailsOpened: number;
    totalLinksClicked: number;
    lastEmailOpenedAt?: string;
    createdAt: string;
}

export interface AudienceStats {
    total: number;
    subscribed: number;
    pending: number;
    unsubscribed: number;
    bounced: number;
    bySource: { source: string; count: number }[];
    growth: { date: string; count: number }[];
    tags: string[];
}

export interface SegmentRule { field: string; operator: string; value?: any }

export interface Segment {
    _id: string;
    name: string;
    description?: string;
    match: 'all' | 'any';
    rules: SegmentRule[];
    lastCount?: number;
}

export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled' | 'failed';

export interface Campaign {
    _id: string;
    name: string;
    subject: string;
    previewText?: string;
    htmlContent: string;
    textContent?: string;
    recipientType: 'all' | 'segment' | 'tags' | 'custom';
    segmentId?: string;
    recipientSegment?: { tags?: string[] };
    customRecipients?: string[];
    status: CampaignStatus;
    scheduledFor?: string;
    startedAt?: string;
    sentAt?: string;
    lastError?: string;
    fromName: string;
    fromEmail?: string;
    replyTo?: string;
    trackOpens: boolean;
    trackClicks: boolean;
    stats: {
        totalRecipients: number;
        sent: number;
        delivered: number;
        opened: number;
        clicked: number;
        bounced: number;
        unsubscribed: number;
        failed: number;
    };
    createdAt: string;
    updatedAt: string;
}

export type CampaignStats = Campaign['stats'] & {
    pending: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    clickToOpenRate: number;
    unsubscribeRate: number;
    topLinks: { url: string; clicks: number; uniqueClicks: number }[];
};

export interface EmailTemplate {
    _id: string;
    name: string;
    subject: string;
    body: string;
    variables: string[];
    category: 'transactional' | 'marketing' | 'support';
    isActive: boolean;
    updatedAt: string;
}

export const CAMPAIGN_STATUS: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    scheduled: 'bg-blue-100 text-blue-700',
    sending: 'bg-amber-100 text-amber-700',
    sent: 'bg-green-100 text-green-700',
    paused: 'bg-orange-100 text-orange-700',
    cancelled: 'bg-gray-100 text-gray-500',
    failed: 'bg-red-100 text-red-700',
};

const base = (projectId: string) => `/projects/${projectId}/email`;

export const emailAPI = {
    // Settings
    getSettings: (p: string) => api.get(`${base(p)}/settings`),
    updateSettings: (p: string, data: any) => api.put(`${base(p)}/settings`, data),
    testSettings: (p: string, to: string) => api.post(`${base(p)}/settings/test`, { to }),
    removeOwnSmtp: (p: string) => api.delete(`${base(p)}/settings/smtp`),

    // Audience
    listSubscribers: (p: string, params: Record<string, any> = {}) => api.get(`${base(p)}/subscribers`, { params }),
    subscriberStats: (p: string) => api.get(`${base(p)}/subscribers/stats`),
    addSubscriber: (p: string, data: Partial<Subscriber>) => api.post(`${base(p)}/subscribers`, data),
    updateSubscriber: (p: string, id: string, data: any) => api.put(`${base(p)}/subscribers/${id}`, data),
    deleteSubscriber: (p: string, id: string) => api.delete(`${base(p)}/subscribers/${id}`),
    bulkSubscribers: (p: string, data: { action: string; ids: string[]; tags?: string[] }) => api.post(`${base(p)}/subscribers/bulk`, data),
    importSubscribers: (p: string, data: { contacts: any[]; tags?: string[]; consent: boolean }) => api.post(`${base(p)}/subscribers/import`, data),
    exportUrl: (p: string) => `${api.defaults.baseURL}${base(p)}/subscribers/export`,
    exportSubscribers: (p: string) => api.get(`${base(p)}/subscribers/export`, { responseType: 'blob' }),

    // Segments
    listSegments: (p: string) => api.get(`${base(p)}/segments`),
    segmentFields: (p: string) => api.get(`${base(p)}/segments/fields`),
    previewSegment: (p: string, data: { match: string; rules: SegmentRule[] }) => api.post(`${base(p)}/segments/preview`, data),
    createSegment: (p: string, data: Partial<Segment>) => api.post(`${base(p)}/segments`, data),
    updateSegment: (p: string, id: string, data: Partial<Segment>) => api.put(`${base(p)}/segments/${id}`, data),
    deleteSegment: (p: string, id: string) => api.delete(`${base(p)}/segments/${id}`),

    // Campaigns
    listCampaigns: (p: string) => api.get(`${base(p)}/campaigns`),
    getCampaign: (p: string, id: string) => api.get(`${base(p)}/campaigns/${id}`),
    createCampaign: (p: string, data: Partial<Campaign>) => api.post(`${base(p)}/campaigns`, data),
    updateCampaign: (p: string, id: string, data: any) => api.put(`${base(p)}/campaigns/${id}`, data),
    deleteCampaign: (p: string, id: string) => api.delete(`${base(p)}/campaigns/${id}`),
    duplicateCampaign: (p: string, id: string) => api.post(`${base(p)}/campaigns/${id}/duplicate`),
    audienceCount: (p: string, data: any) => api.post(`${base(p)}/campaigns/audience-count`, data),
    testCampaign: (p: string, id: string, to: string) => api.post(`${base(p)}/campaigns/${id}/test`, { to }),
    sendCampaign: (p: string, id: string) => api.post(`${base(p)}/campaigns/${id}/send`),
    scheduleCampaign: (p: string, id: string, scheduledFor: string) => api.post(`${base(p)}/campaigns/${id}/schedule`, { scheduledFor }),
    unscheduleCampaign: (p: string, id: string) => api.post(`${base(p)}/campaigns/${id}/unschedule`),
    pauseCampaign: (p: string, id: string) => api.post(`${base(p)}/campaigns/${id}/pause`),
    resumeCampaign: (p: string, id: string) => api.post(`${base(p)}/campaigns/${id}/resume`),
    cancelCampaign: (p: string, id: string) => api.post(`${base(p)}/campaigns/${id}/cancel`),
    campaignStats: (p: string, id: string) => api.get(`${base(p)}/campaigns/${id}/stats`),
    campaignRecipients: (p: string, id: string, params: Record<string, any> = {}) => api.get(`${base(p)}/campaigns/${id}/recipients`, { params }),

    // Templates
    listTemplates: (p: string) => api.get(`${base(p)}/templates`),
    getTemplate: (p: string, id: string) => api.get(`${base(p)}/templates/${id}`),
    createTemplate: (p: string, data: Partial<EmailTemplate>) => api.post(`${base(p)}/templates`, data),
    updateTemplate: (p: string, id: string, data: Partial<EmailTemplate>) => api.put(`${base(p)}/templates/${id}`, data),
    deleteTemplate: (p: string, id: string) => api.delete(`${base(p)}/templates/${id}`),
    testTemplate: (p: string, id: string, to: string) => api.post(`${base(p)}/templates/${id}/test`, { to }),
};

/** Public API origin (for embed snippets). */
export function publicApiOrigin(): string {
    const base = (api.defaults.baseURL || '/api/v1') as string;
    if (/^https?:\/\//.test(base)) return base.replace(/\/api\/v1\/?$/, '');
    return window.location.origin;
}

export const errorMessage = (err: any, fallback = 'Something went wrong') =>
    err?.response?.data?.message || err?.response?.data?.error || err?.message || fallback;
