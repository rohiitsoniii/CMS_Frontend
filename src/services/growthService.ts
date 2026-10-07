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
