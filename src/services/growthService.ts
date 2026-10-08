import { api } from './api';

/** AI settings (BYOK) + SEO suite APIs. */

export interface AIProviderPreset {
    label: string;
    baseURL: string;
    defaultModel: string;
    embeddingModel: string;
    keyHint: string;
}

export interface AIConfig {
    provider: string;
    keyLast4?: string;
    baseURL?: string;
    defaultModel?: string;
    embeddingModel?: string;
    isActive: boolean;
    isVerified: boolean;
    lastTestedAt?: string;
    lastError?: string;
}

export interface AIUsage {
    month: string;
    plan: string;
    platformTokens: number;
    byokTokens: number;
    platformRequests: number;
    byokRequests: number;
    platformAllowance: number;
    platformRemaining: number;
    byok: { active: boolean; provider?: string; keyLast4?: string; verified?: boolean; monthlyFeeUsd?: number };
    byFeature: { feature: string; keySource: string; tokens: number; requests: number; errors: number }[];
    daily: { day: string; keySource: string; tokens: number }[];
}

export const aiSettingsAPI = {
    get: () => api.get('/ai/settings'),
    save: (data: any) => api.put('/ai/settings', data),
    test: () => api.post('/ai/settings/test'),
    remove: () => api.delete('/ai/settings'),
    usage: () => api.get('/ai/usage'),
};

export interface UrlPattern {
    contentType: string;
    pattern: string;
    includeInSitemap: boolean;
    changefreq?: string;
    priority?: number;
}

export interface SeoSettings {
    siteUrl?: string;
    siteName?: string;
    titleTemplate?: string;
    defaultDescription?: string;
    defaultOgImage?: string;
    twitterHandle?: string;
    defaultLocale?: string;
    urlPatterns: UrlPattern[];
    defaultPattern: string;
    verification: { google?: string; bing?: string; yandex?: string };
    organization: { type: string; name?: string; logo?: string; email?: string; phone?: string; address?: string; sameAs: string[] };
    indexNow: { enabled: boolean; key?: string; lastPingAt?: string; lastError?: string };
    aiCrawlers: Record<string, 'allow' | 'block'>;
    llms: { enabled: boolean; summary?: string; details?: string; contentTypes: string[]; includeFullText: boolean };
}

export interface GeoCheck { id: string; label: string; passed: boolean; weight: number; detail: string; fix?: string }

export interface GeoReport {
    score: number;
    grade: string;
    wordCount: number;
    checks: GeoCheck[];
    recommendations: string[];
    preview: {
        title: string;
        description?: string;
        canonical?: string;
        path?: string;
        meta: { name?: string; property?: string; content: string }[];
        jsonLd: any;
    };
}

export interface Redirect {
    _id: string;
    from: string;
    to?: string;
    statusCode: number;
    isActive: boolean;
    note?: string;
    hits: number;
    lastHitAt?: string;
}

export interface NotFoundEntry { _id: string; path: string; hits: number; lastReferrer?: string; lastSeenAt: string }

const seo = (p: string) => `/projects/${p}/seo`;

export const seoSuiteAPI = {
    getSettings: (p: string) => api.get(`${seo(p)}/settings`),
    updateSettings: (p: string, data: Partial<SeoSettings>) => api.put(`${seo(p)}/settings`, data),
    indexNowSubmit: (p: string) => api.post(`${seo(p)}/indexnow/submit`),

    listRedirects: (p: string) => api.get(`${seo(p)}/redirects`),
    createRedirect: (p: string, data: Partial<Redirect>) => api.post(`${seo(p)}/redirects`, data),
    updateRedirect: (p: string, id: string, data: Partial<Redirect>) => api.put(`${seo(p)}/redirects/${id}`, data),
    deleteRedirect: (p: string, id: string) => api.delete(`${seo(p)}/redirects/${id}`),
    importRedirects: (p: string, redirects: Partial<Redirect>[]) => api.post(`${seo(p)}/redirects/import`, { redirects }),
    listNotFound: (p: string) => api.get(`${seo(p)}/not-found`),
    dismissNotFound: (p: string, id: string) => api.post(`${seo(p)}/not-found/${id}/dismiss`),

    geoOverview: (p: string) => api.get(`${seo(p)}/geo`),
    geoForContent: (p: string, contentId: string) => api.get(`${seo(p)}/geo/${contentId}`),

    pageSpeed: (p: string, url: string | undefined, strategy: 'mobile' | 'desktop') =>
        api.get(`${seo(p)}/pagespeed`, { params: { url, strategy }, timeout: 120_000 }),
    checkRanks: (p: string, keywordId?: string) => api.post(`${seo(p)}/keywords/check`, { keywordId }),
};

// ---------------------------------------------------------------------------
// Website analytics
// ---------------------------------------------------------------------------

export interface TopRow { key: string; views: number; visitors: number }

export interface SiteReport {
    range: { from: string; to: string };
    totals: { pageviews: number; visitors: number; sessions: number; pagesPerSession: number; bounceRate: number };
    series: { t: string; pageviews: number; visitors: number }[];
    pages: TopRow[];
    referrers: TopRow[];
    sources: TopRow[];
    campaigns: TopRow[];
    devices: TopRow[];
    browsers: TopRow[];
    countries: TopRow[];
    events: { name: string; count: number; visitors: number; value: number; conversionRate: number }[];
}

export const siteAnalyticsAPI = {
    report: (p: string, days: number) => api.get(`/projects/${p}/site-analytics`, { params: { days } }),
    realtime: (p: string) => api.get(`/projects/${p}/site-analytics/realtime`),
};

// ---------------------------------------------------------------------------
// Forms
// ---------------------------------------------------------------------------

export type FormFieldType = 'text' | 'email' | 'phone' | 'textarea' | 'number' | 'select' | 'radio' | 'checkbox' | 'date' | 'url' | 'hidden' | 'consent';

export interface FormField {
    key: string;
    label: string;
    type: FormFieldType;
    required: boolean;
    placeholder?: string;
    helpText?: string;
    options?: string[];
    defaultValue?: string;
}

export interface FormDef {
    _id: string;
    name: string;
    description?: string;
    status: 'active' | 'paused';
    fields: FormField[];
    settings: {
        submitLabel: string;
        successMessage: string;
        redirectUrl?: string;
        notifyEmails: string[];
        addToAudience: boolean;
        audienceTags: string[];
        autoReply?: { enabled: boolean; subject?: string; body?: string };
    };
    stats: { submissions: number; lastSubmissionAt?: string };
    unread?: number;
    createdAt: string;
}

export interface FormSubmissionRow {
    _id: string;
    formId: { _id: string; name: string } | string;
    data: Record<string, string>;
    email?: string;
    status: 'new' | 'read' | 'archived' | 'spam';
    meta: { page?: string; utm?: Record<string, string> };
    createdAt: string;
}

export const formsAPI = {
    list: (p: string) => api.get(`/projects/${p}/forms`),
    get: (p: string, id: string) => api.get(`/projects/${p}/forms/${id}`),
    create: (p: string, data: Partial<FormDef>) => api.post(`/projects/${p}/forms`, data),
    update: (p: string, id: string, data: Partial<FormDef>) => api.put(`/projects/${p}/forms/${id}`, data),
    remove: (p: string, id: string) => api.delete(`/projects/${p}/forms/${id}`),
    exportCsv: (p: string, id: string) => api.get(`/projects/${p}/forms/${id}/export`, { responseType: 'blob' }),
    submissions: (p: string, params: Record<string, any> = {}) => api.get(`/projects/${p}/form-submissions`, { params }),
    setSubmissionStatus: (p: string, id: string, status: string) => api.put(`/projects/${p}/form-submissions/${id}`, { status }),
    deleteSubmission: (p: string, id: string) => api.delete(`/projects/${p}/form-submissions/${id}`),
};

// ---------------------------------------------------------------------------
// Automations
// ---------------------------------------------------------------------------

export interface AutomationStep {
    delayMinutes: number;
    subject: string;
    previewText?: string;
    htmlContent: string;
    campaignId?: string;
    stats?: { sent: number; opened: number; clicked: number; unsubscribed: number };
}

export interface Automation {
    _id: string;
    name: string;
    status: 'draft' | 'active' | 'paused';
    trigger: { type: 'subscribed' | 'tag_added' | 'form_submitted' | 'content_published'; tag?: string; formId?: string; contentTypes?: string[]; segmentId?: string; sendMode?: 'send' | 'draft' };
    steps: AutomationStep[];
    fromName?: string;
    stats: { enrolled: number; completed: number; sent: number };
    createdAt: string;
}

export const automationsAPI = {
    list: (p: string) => api.get(`/projects/${p}/automations`),
    get: (p: string, id: string) => api.get(`/projects/${p}/automations/${id}`),
    create: (p: string, data: Partial<Automation>) => api.post(`/projects/${p}/automations`, data),
    update: (p: string, id: string, data: Partial<Automation>) => api.put(`/projects/${p}/automations/${id}`, data),
    remove: (p: string, id: string) => api.delete(`/projects/${p}/automations/${id}`),
};

// ---------------------------------------------------------------------------
// Live chat inbox
// ---------------------------------------------------------------------------

export interface InboxConversation {
    _id: string;
    botName?: string;
    visitorEmail?: string;
    status: 'bot' | 'requested' | 'human' | 'closed';
    assignedName?: string;
    unread: number;
    lastMessageAt: string;
    preview: string;
    messageCount: number;
}

export interface ChatMessage {
    role: 'user' | 'assistant' | 'agent' | 'system';
    content: string;
    agentName?: string;
    timestamp: string;
}

export const inboxAPI = {
    list: (p: string, status = 'open') => api.get(`/projects/${p}/inbox`, { params: { status } }),
    get: (p: string, id: string) => api.get(`/projects/${p}/inbox/${id}`),
    reply: (p: string, id: string, message: string, emailCopy = false) => api.post(`/projects/${p}/inbox/${id}/reply`, { message, emailCopy }),
    setStatus: (p: string, id: string, status: 'bot' | 'human' | 'closed') => api.post(`/projects/${p}/inbox/${id}/status`, { status }),
};

// ---------------------------------------------------------------------------
// Usage, contact profile
// ---------------------------------------------------------------------------

export interface UsageItem { label: string; used: number; limit: number; unit: string; period: 'month' | 'total' }

export const usageAPI = {
    summary: () => api.get('/usage'),
};

export const contactsAPI = {
    profile: (p: string, id: string) => api.get(`/projects/${p}/contacts/${id}/profile`),
};

// ---------------------------------------------------------------------------
// Search Console, content brief, deliverability
// ---------------------------------------------------------------------------

export const gscAPI = {
    status: (p: string) => api.get(`/projects/${p}/seo/gsc`),
    connectUrl: (p: string) => api.get(`/projects/${p}/seo/gsc/connect-url`),
    sites: (p: string) => api.get(`/projects/${p}/seo/gsc/sites`),
    selectSite: (p: string, siteUrl: string) => api.put(`/projects/${p}/seo/gsc/site`, { siteUrl }),
    performance: (p: string, days = 28) => api.get(`/projects/${p}/seo/gsc/performance`, { params: { days }, timeout: 60_000 }),
    disconnect: (p: string) => api.delete(`/projects/${p}/seo/gsc`),
};

export const briefAPI = {
    create: (p: string, keyword: string, audience?: string) => api.post(`/projects/${p}/seo/brief`, { keyword, audience }, { timeout: 120_000 }),
    analyze: (p: string, data: { html: string; title?: string; metaDescription?: string }) => api.post(`/projects/${p}/seo/geo/analyze`, data),
};

export interface DnsCheckRow {
    id: 'spf' | 'dkim' | 'dmarc' | 'mx';
    status: 'pass' | 'warn' | 'fail';
    record?: string;
    message: string;
    fix?: string;
}

export const deliverabilityAPI = {
    dns: (p: string) => api.get(`/projects/${p}/email/settings/dns`),
    eventsWebhook: (p: string, rotate = false) => api.get(`/projects/${p}/email/settings/events-webhook`, { params: rotate ? { rotate: 1 } : {} }),
};
