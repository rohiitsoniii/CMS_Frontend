import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export class ApiError extends Error {
  constructor(public message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = useAuthStore.getState().refreshToken;
      
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          
          const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;
          
          const { user, tenant } = useAuthStore.getState();
          if (user && tenant) {
            useAuthStore.getState().setAuth(user, tenant, {
              accessToken,
              refreshToken: newRefreshToken,
            });
          }
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          useAuthStore.getState().logout();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    
    if (error.response?.status === 500) {
      // Log critical server errors to the system log
      try {
        await axios.post(`${API_BASE_URL}/system/errors/log-frontend`, {
          message: error.message,
          stack: error.stack,
          url: window.location.href,
          userAgent: navigator.userAgent,
          severity: 'high'
        });
      } catch (logError) {
        console.error('Failed to log error to server', logError);
      }
    }

    return Promise.reject(error);
  }
);

// Global window error handler
if (typeof window !== 'undefined') {
  window.onerror = function(message, source, lineno, colno, error) {
    if (axios.isAxiosError(error) || message === 'Script error.') return;
    
    axios.post(`${API_BASE_URL}/system/errors/log-frontend`, {
      message: message as string,
      stack: error?.stack,
      source,
      lineno,
      colno,
      url: window.location.href,
      severity: 'medium'
    }).catch(() => {});
  };
}


// ============================
// Auth API
// ============================
export const authAPI = {
  register: (data: {
    name: string;
    email: string;
    password: string;
    company?: string;
    website?: string;
  }) => api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) => 
    api.post('/auth/login', data),
  
  getProfile: () => api.get('/auth/me'),
  
  updateProfile: (data: { firstName: string; lastName: string; avatar?: string }) =>
    api.put('/auth/profile', data),
  
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/password', data),
  
  createAPIKey: (data: {
    name: string;
    description?: string;
    permissions?: string[];
    allowedOrigins?: string[];
    expiresAt?: string;
  }) => api.post('/auth/api-keys', data),
  
  getAPIKeys: () => api.get('/auth/api-keys'),
  
  deleteAPIKey: (id: string) => api.delete(`/auth/api-keys/${id}`),
};

// ============================
// Two-Factor Auth API
// ============================
export const twoFactorAPI = {
  setup: () => api.post('/two-factor/setup'),
  verify: (data: { token: string }) => api.post('/two-factor/verify', data),
  disable: (data: { token: string }) => api.delete('/two-factor', { data }),
};

// ============================
// SSO API
// ============================
export const ssoAPI = {
  getStatus: () => api.get('/sso/status'),
  getGoogleUrl: () => api.get('/sso/google/url'),
  unlinkGoogle: () => api.post('/sso/google/unlink'),
};

// ============================
// Project API
// ============================
export const projectAPI = {
  create: (data: {
    name: string;
    slug: string;
    description?: string;
    domain?: string;
    settings?: Record<string, unknown>;
    branding?: Record<string, unknown>;
  }) => api.post('/projects', data),
  
  getAll: (params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => api.get('/projects', { params }),
  
  getById: (id: string) => api.get(`/projects/${id}`),
  
  update: (id: string, data: Partial<{
    name: string;
    description: string;
    domain: string;
    settings: Record<string, unknown>;
    branding: Record<string, unknown>;
    status: string;
    chatbot: Record<string, unknown>;
  }>) => api.put(`/projects/${id}`, data),
  
  delete: (id: string) => api.delete(`/projects/${id}`),
  
  duplicate: (id: string, data: { newName: string; newSlug: string }) =>
    api.post(`/projects/${id}/duplicate`, data),
  
  getStats: (id: string) => api.get(`/projects/${id}/stats`),
  
  getPreviewToken: (id: string, contentId?: string) => 
    api.get(`/projects/${id}/preview-token`, { params: { contentId } }),
};

// ============================
// Template API
// ============================
export const templateAPI = {
  getTemplates: () => api.get('/templates'),
  applyTemplate: (projectId: string, templateId: string) => 
    api.post(`/templates/apply/${projectId}`, { templateId }),
};

// ============================
// Content API
// ============================
export const contentAPI = {
  create: (projectId: string, data: {
    type: string;
    name: string;
    slug?: string;
    data: Record<string, unknown>;
    status?: string;
    isDefault?: boolean;
    visibility?: string;
    meta?: Record<string, unknown>;
    seo?: Record<string, unknown>;
  }) => api.post(`/projects/${projectId}/content`, data),
  
  getAll: (projectId: string, params?: {
    type?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
    includeArchived?: boolean;
  }) => {
    if (!projectId) return Promise.resolve({ data: { data: { content: [], pagination: {} } } } as any);
    return api.get(`/projects/${projectId}/content`, { params });
  },
  
  getById: (projectId: string, id: string) => 
    api.get(`/projects/${projectId}/content/${id}`),
  
  update: (projectId: string, id: string, data: Partial<{
    name: string;
    slug: string;
    data: Record<string, unknown>;
    status: string;
    isDefault: boolean;
    visibility: string;
    meta: Record<string, unknown>;
    seo: Record<string, unknown>;
    changeNote: string;
  }>) => api.put(`/projects/${projectId}/content/${id}`, data),
  
  delete: (projectId: string, id: string) => 
    api.delete(`/projects/${projectId}/content/${id}`),
  
  setAsDefault: (projectId: string, id: string) =>
    api.post(`/projects/${projectId}/content/${id}/default`),
  
  publish: (projectId: string, id: string, scheduledAt?: string) =>
    api.post(`/projects/${projectId}/content/${id}/publish`, { scheduledAt }),
  
  unpublish: (projectId: string, id: string) =>
    api.post(`/projects/${projectId}/content/${id}/unpublish`),
  
  getVersionHistory: (projectId: string, id: string) =>
    api.get(`/projects/${projectId}/content/${id}/versions`),
  
  restoreVersion: (projectId: string, id: string, version: number) =>
    api.post(`/projects/${projectId}/content/${id}/versions/${version}/restore`),
  
  reorder: (projectId: string, type: string, order: { id: string; position: number }[]) =>
    api.put(`/projects/${projectId}/content/reorder`, { type, order }),
};

// ============================
// Media API
// ============================
export const mediaAPI = {
  upload: (file: File, metadata?: { folder?: string; alt?: string; caption?: string; tags?: string }) => {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata?.folder) formData.append('folder', metadata.folder);
    if (metadata?.alt) formData.append('alt', metadata.alt);
    if (metadata?.caption) formData.append('caption', metadata.caption);
    if (metadata?.tags) formData.append('tags', metadata.tags);
    
    return api.post('/admin/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  getAll: (params?: {
    folder?: string;
    type?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => api.get('/admin/media', { params }),
  
  getById: (id: string) => api.get(`/admin/media/${id}`),
  
  update: (id: string, data: { alt?: string; caption?: string; tags?: string; folder?: string }) =>
    api.put(`/admin/media/${id}`, data),
  
  delete: (id: string) => api.delete(`/admin/media/${id}`),
  
  // Folder management
  getFolders: () => api.get('/admin/media/folders'),
  
  createFolder: (name: string) => api.post('/admin/media/folders', { name }),
  
  renameFolder: (oldName: string, newName: string) => 
    api.put(`/admin/media/folders/${oldName}`, { newName }),
  
  deleteFolder: (name: string) => api.delete(`/admin/media/folders/${name}`),
  
  // Bulk operations
  bulkDelete: (fileIds: string[]) => api.post('/admin/media/bulk-delete', { fileIds }),
  
  bulkMove: (fileIds: string[], targetFolder: string) => 
    api.post('/admin/media/bulk-move', { fileIds, targetFolder }),
  
  getUrl: (id: string) => `${API_BASE_URL}/media/${id}`,
};

// ============================
// Analytics API
// ============================
export const analyticsAPI = {
  getDashboard: () => api.get('/admin/analytics/dashboard'),
  getDashboardStats: () => api.get('/admin/analytics/dashboard'),
  getAPIUsage: (params?: any) => 
    api.get('/admin/analytics/api-usage', typeof params === 'string' ? { params: { period: params } } : { params }),
  getContentAnalytics: (contentId?: string, params?: { startDate?: string; endDate?: string }) => 
    contentId ? api.get(`/admin/analytics/content/${contentId}`, { params }) : api.get('/admin/analytics/content'),
  getContentStats: (contentId: string) => api.get(`/admin/analytics/content/${contentId}/stats`),
  getStats: () => api.get('/admin/analytics/stats'),
};



// ============================
// AI API
// ============================
export const aiAPI = {
  generateSchema: (prompt: string) => api.post('/ai/generate/schema', { prompt }),
  generateBlogPost: (topic: string, keywords?: string[]) => api.post('/ai/generate/blog-post', { topic, keywords }),
  improveContent: (content: string) => api.post('/ai/improve', { content }),
  translate: (content: string, targetLanguage: string) => api.post('/ai/translate', { content, targetLanguage }),
  getStatus: () => api.get('/ai/status'),
};

// ============================
// NLQ API
// ============================
export const nlqAPI = {
  query: (projectId: string, query: string) => api.post('/nlq/query', { projectId, query }),
};

// ============================
// Deployment API
// ============================
export const deploymentAPI = {
  getIntegrations: (projectId: string) => api.get(`/deployments/${projectId}`),
  createIntegration: (projectId: string, data: any) => 
    api.post(`/deployments/${projectId}`, data),
  triggerDeploy: (integrationId: string) => 
    api.post(`/deployments/trigger/${integrationId}`),
  deleteIntegration: (integrationId: string) => 
    api.delete(`/deployments/${integrationId}`),
};

// ============================
// Workflow API
// ============================
export const workflowAPI = {
  getAll: () => api.get('/workflows'),
  getById: (apiId: string) => api.get(`/workflows/${apiId}`),
  create: (data: any) => api.post('/workflows', data),
  update: (apiId: string, data: any) => api.put(`/workflows/${apiId}`, data),
  delete: (apiId: string) => api.delete(`/workflows/${apiId}`),
  
  // Content workflow state
  start: (contentId: string, workflowId: string) => 
    api.post(`/content/${contentId}/workflow/start`, { workflowId }),
  advance: (contentId: string, comment?: string) => 
    api.post(`/content/${contentId}/workflow/advance`, { comment }),
  reject: (contentId: string, data: { comment?: string; sendToStep?: string }) => 
    api.post(`/content/${contentId}/workflow/reject`, data),
  getState: (contentId: string) => 
    api.get(`/content/${contentId}/workflow`),
};




// ============================
// Audit API
// ============================
export const auditAPI = {
  getLogs: (params?: {
    page?: number;
    limit?: number;
    action?: string;
    userId?: string;
    resourceType?: string;
    resourceId?: string;
    startDate?: string;
    endDate?: string;
  }) => api.get('/audit-logs', { params }),
};

// ============================
// Trash API
// ============================
export const trashAPI = {
  getTrash: (projectId: string) => api.get(`/projects/${projectId}/trash`),
  restore: (trashId: string) => api.post(`/trash/${trashId}/restore`),
  deletePermanently: (trashId: string) => api.delete(`/trash/${trashId}`),
  emptyTrash: (projectId: string) => api.delete(`/projects/${projectId}/trash`),
  bulkRestore: (trashIds: string[]) => api.post('/trash/bulk-restore', { trashIds }),
};


// ============================
// Archive API
// ============================
export const archiveAPI = {
  getArchive: (projectId: string) => api.get(`/projects/${projectId}/archive`),
  archive: (contentId: string) => api.post(`/archive/${contentId}`),
  restore: (contentId: string) => api.post(`/archive/${contentId}/restore`),
};


// ============================
// Billing API
// ============================
export const billingAPI = {
  getPlans: () => api.get('/billing/plans'),
  getSubscription: () => api.get('/billing/subscription'),
  createSubscription: (data: any) => api.post('/billing/subscription', data),
  updateSubscription: (data: any) => api.put('/billing/subscription', data),
  cancelSubscription: (immediately?: boolean) => api.post('/billing/subscription/cancel', { immediately }),
  getInvoices: () => api.get('/billing/invoices'),
  getUsage: () => api.get('/billing/usage'),
  validateCoupon: (code: string, planSlug: string, amount: number) => 
    api.post('/billing/validate-coupon', { code, planSlug, amount }),
  createPortalSession: () => api.post('/billing/portal'),
};


// ============================
// Locale API
// ============================
export const localeAPI = {
  getConfig: (projectId: string) => api.get('/locales', { params: { projectId } }),
  updateConfig: (projectId: string, data: any) => api.put('/locales', { ...data, projectId }),
  getEnabled: () => api.get('/locales/enabled'),
  add: (data: any) => api.post('/locales/add', data),
  update: (code: string, data: any) => api.put(`/locales/${code}`, data),
  remove: (code: string) => api.delete(`/locales/${code}`),
  
  // Translation-specific
  getSupportedLanguages: () => api.get('/locales/supported-languages'),
  saveApiKey: (apiKey: string) => api.put('/locales/api-key', { apiKey }),
  translateContent: (contentId: string) => api.post(`/locales/translate-content/${contentId}`),
  translateAll: () => api.post('/locales/translate-all'),
  bulkTranslate: () => api.post('/locales/translate-all'),
  setDefault: (code: string) => api.put(`/locales/${code}`, { isDefault: true }),
};


// ============================
// Comment API
// ============================
export const commentAPI = {
  getByContent: (contentId: string) => api.get(`/comments/content/${contentId}`),
  create: (contentId: string, data: { text: string; parentId?: string }) => 
    api.post(`/comments/content/${contentId}`, data),
  delete: (id: string) => api.delete(`/comments/${id}`),
};

// ============================
// System API (Super Admin)
// ============================
export const systemAPI = {
  getStats: () => api.get('/system/stats'),
  getTenants: () => api.get('/system/tenants'),
  getErrors: (params?: any) => api.get('/system/errors', { params }),
  fixError: (id: string) => api.patch(`/system/errors/${id}/fix`),
  getCoupons: () => api.get('/system/coupons'),
  createCoupon: (data: any) => api.post('/system/coupons', data),
};

// ============================
// Backup API
// ============================
export const backupAPI = {
  getAll: (projectId: string) => api.get(`/projects/${projectId}/backups`),
  create: (projectId: string) => api.post(`/projects/${projectId}/backups`),
  restore: (backupId: string) => api.post(`/backups/${backupId}/restore`),
  delete: (backupId: string) => api.delete(`/backups/${backupId}`),
};

// ============================
// SEO API
// ============================
export const seoAPI = {
  getReport: (projectId: string, contentId: string) => 
    api.get(`/projects/${projectId}/seo/report/${contentId}`),
  analyze: (projectId: string, contentId: string, focusKeywords: string[]) => 
    api.post(`/projects/${projectId}/seo/analyze/${contentId}`, { focusKeywords }),
  getOverview: (projectId: string) => 
    api.get(`/projects/${projectId}/seo/overview`),
  getRobots: (projectId: string) => 
    api.get(`/projects/${projectId}/seo/robots`),
  updateRobots: (projectId: string, content: string) => 
    api.post(`/projects/${projectId}/seo/robots`, { content }),
  startAudit: (projectId: string) => 
    api.post(`/projects/${projectId}/seo/audit/start`),
  getAuditHistory: (projectId: string) => 
    api.get(`/projects/${projectId}/seo/audit/history`),
  getAuditReport: (projectId: string, auditId: string) => 
    api.get(`/projects/${projectId}/seo/audit/${auditId}`),
  generateAiSeo: (projectId: string, contentId: string) => 
    api.post(`/projects/${projectId}/seo/ai/generate/${contentId}`),
  getKeywords: (projectId: string) => 
    api.get(`/projects/${projectId}/seo/keywords`),
  addKeyword: (projectId: string, data: any) => 
    api.post(`/projects/${projectId}/seo/keywords/add`, data),
  deleteKeyword: (projectId: string, keywordId: string) => 
    api.delete(`/projects/${projectId}/seo/keywords/${keywordId}`),
  suggestKeywords: (projectId: string) => 
    api.get(`/projects/${projectId}/seo/keywords/suggest`),
  suggestBacklinks: (projectId: string) => 
    api.get(`/projects/${projectId}/seo/backlinks/suggest`),
};

// ============================
// Notification API
// ============================
export const notificationAPI = {
  getAll: (params?: { page?: number; limit?: number; status?: string; type?: string }) => 
    api.get('/notifications', { params }),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.post('/notifications/mark-all-read'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
};

// ============================
// Environment API
// ============================
export const envAPI = {
  getAll: (projectId: string) => api.get(`/projects/${projectId}/env-variables`),
  update: (projectId: string, data: any) => api.put(`/projects/${projectId}/env-variables`, data),
};

// ============================
// Domain API
// ============================
export const domainAPI = {
  getAll: (projectId: string) => api.get(`/projects/${projectId}/domains`),
  add: (projectId: string, domain: string) => api.post(`/projects/${projectId}/domains`, { domain }),
  delete: (projectId: string, domainId: string) => api.delete(`/projects/${projectId}/domains/${domainId}`),
};

// ============================
// Field Permissions API
// ============================
export const fieldPermissionsAPI = {
  get: (contentTypeId: string) => api.get(`/permissions/fields/${contentTypeId}`),
  update: (contentTypeId: string, data: any) => api.put(`/permissions/fields/${contentTypeId}`, data),
};

// ============================
// Bulk Operations API
// ============================
export const bulkOperationsAPI = {
  delete: (ids: string[]) => api.post('/bulk-operations/delete', { ids }),
  publish: (ids: string[]) => api.post('/bulk-operations/publish', { ids }),
};




// ============================
// RAG Bot API
// ============================
export const ragBotAPI = {
  list: (projectId: string) => api.get(`/projects/${projectId}/rag-bots`),
  
  create: (projectId: string, data: any) => 
    api.post(`/projects/${projectId}/rag-bots`, data),
  
  getById: (projectId: string, botId: string) => 
    api.get(`/projects/${projectId}/rag-bots/${botId}`),
  
  update: (projectId: string, botId: string, data: any) => 
    api.put(`/projects/${projectId}/rag-bots/${botId}`, data),
  
  delete: (projectId: string, botId: string) => 
    api.delete(`/projects/${projectId}/rag-bots/${botId}`),
  
  // Ingestion
  ingestDocument: (projectId: string, botId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/projects/${projectId}/rag-bots/${botId}/ingest/document`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  crawlUrl: (projectId: string, botId: string, url: string, maxDepth?: number) => 
    api.post(`/projects/${projectId}/rag-bots/${botId}/ingest/url`, { url, maxDepth }),
  
  syncCms: (projectId: string, botId: string) => 
    api.post(`/projects/${projectId}/rag-bots/${botId}/ingest/cms`),
  
  // Source Management
  getSources: (projectId: string, botId: string) => 
    api.get(`/projects/${projectId}/rag-bots/${botId}/sources`),
  
  deleteSource: (projectId: string, botId: string, type: string, hash: string) => 
    api.delete(`/projects/${projectId}/rag-bots/${botId}/sources`, { params: { type, hash } }),
  
  // Analytics & Deployment
  getAnalytics: (projectId: string, botId: string) => 
    api.get(`/projects/${projectId}/rag-bots/${botId}/analytics`),
  
  getEmbedCode: (projectId: string, botId: string) => 
    api.get(`/projects/${projectId}/rag-bots/${botId}/embed-code`),
  
  regenerateKey: (projectId: string, botId: string) => 
    api.post(`/projects/${projectId}/rag-bots/${botId}/api-key`),

  // Public Chat Endpoints
  getPublicConfig: (botSlug: string, apiKey: string) =>
    api.get(`/bots/${botSlug}/config`, { params: { apiKey } }),

  publicChat: (botSlug: string, data: { message: string; sessionId: string; apiKey?: string; history?: any[] }) =>
    api.post(`/bots/${botSlug}/chat`, data),

  rateChat: (botSlug: string, data: { messageId: string; rating: number; feedback?: string }) =>
    api.post(`/bots/${botSlug}/rate`, data),
};


// ============================
// Background Jobs API
// ============================
export const jobsAPI = {
  getStatus: (jobId: string) =>
    api.get(`/jobs/${jobId}`),
};

export default api;


