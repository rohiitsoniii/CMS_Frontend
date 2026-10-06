import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage, RegisterPage, MFASetupPage, SSOConfigPage, SecurityPage } from '@/pages/auth';
import { ContentListPage, ContentEditorPage } from '@/pages/content';
import { APIKeysPage } from '@/pages/apikeys';
import { 
    SettingsPage, 
    RolesPage, 
    TeamPage, 
    UsersPage, 
    SeoDashboardPage, 
    RobotsEditorPage, 
    SitemapConfigPage, 
    SchemaBuilderPage, 
    SiteAuditPage,
    KeywordTrackerPage
} from '@/pages';
import { MediaLibraryPage } from '@/pages/media';
import { AnalyticsPage } from '@/pages/analytics';
import { ProjectsPage, ProjectDashboard, ProjectOverview } from '@/pages/projects';
import { WebhooksPage } from '@/pages/webhooks';
import { WebhookLogsPage } from '@/pages/webhooks/WebhookLogsPage';
import { ContentSchedulingPage } from '@/pages/schedules';
import { WorkflowListPage, WorkflowBuilderPage } from '@/pages/workflows';

import { EmailTemplatesPage } from '@/pages/email-templates/EmailTemplatesPage';
import { KnowledgeBasePage, ChatbotConversationsPage, ChatbotSettingsPage } from '@/pages/chatbot';
import { RagBotListPage, RagBotBuilderPage, RagBotAnalyticsPage } from '@/pages/rag-bot';
import { ContentTypesListPage, ContentTypeBuilderPage } from '@/pages/content-types';
import { DynamicContentEditorPage } from '@/pages/content/DynamicContentEditorPage';
import { ContentListPage as DynamicContentListPage } from '@/pages/content/DynamicContentListPage';
import { LocalesPage } from '@/pages/locales';
import AuditLogsPage from '@/pages/audit-logs/AuditLogsPage';
import { BillingPage } from '@/pages/billing/BillingPage';
import { PricingPage } from '@/pages/billing/PricingPage';
import { SupportPage } from '@/pages/support/SupportPage';
import { OnboardingPage } from '@/pages/onboarding/OnboardingPage';
import { EnvironmentPage } from '@/pages/settings/EnvironmentPage';
import { DashboardLayout, SuperAdminLayout, OfflineBanner } from '@/components/layout';
import { SystemDashboardPage, ErrorLogsPage, CouponManagementPage, SystemHealthPage, TenantManagementPage, PlatformUsersPage, SystemSettingsPage, ComingSoonPage } from '@/pages/system';
import { TrashPage } from '@/pages/trash/TrashPage';
import { BackupPage } from '@/pages/backup/BackupPage';
import { ImportExportPage } from '@/pages/import-export/ImportExportPage';
import { ArchivePage } from '@/pages/archive/ArchivePage';
import { NotFoundPage } from '@/pages/public/NotFoundPage';
import { ContentCalendar } from '@/pages/calendar/ContentCalendar';
import { CommandMenu } from '@/components/ui/CommandMenu';
import { Toaster } from '@/components/ui';

import { ProtectedRoute } from '@/components/auth';
import { useAuthStore } from '@/store';

// Auth redirect - redirects authenticated users away from auth pages
function AuthRedirect({ children }: { children: React.ReactNode }) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}

import BotWidgetPage from '@/pages/public/BotWidgetPage';

export default function App() {
    return (
        <>
            <CommandMenu />
            <Routes>
                {/* Public widget route */}
                <Route path="/public/widget/:botId" element={<BotWidgetPage />} />

                {/* Public routes */}
                <Route path="/" element={<Navigate to="/login" replace />} />

            <Route
                path="/login"
                element={
                    <AuthRedirect>
                        <LoginPage />
                    </AuthRedirect>
                }
            />

            <Route
                path="/register"
                element={
                    <AuthRedirect>
                        <RegisterPage />
                    </AuthRedirect>
                }
            />

            {/* Onboarding */}
            <Route path="/onboarding" element={<OnboardingPage />} />

            {/* Protected dashboard routes */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                }
            >
                {/* Dashboard Home - Now shows projects */}
                <Route index element={<ProjectsPage />} />

                {/* Projects List */}
                <Route path="projects" element={<ProjectsPage />} />

                {/* Global Content Management (Legacy) */}
                <Route path="content" element={<ContentListPage />} />
                <Route path="content/new" element={<ContentEditorPage />} />
                <Route path="content/:type" element={<ContentListPage />} />
                <Route path="content/:type/new" element={<ContentEditorPage />} />
                <Route path="content/:type/:id" element={<ContentEditorPage />} />

                {/* Global Media Library */}
                <Route path="media" element={<MediaLibraryPage />} />

                {/* Global API Keys */}
                <Route path="api-keys" element={<APIKeysPage />} />

                {/* Global Analytics */}
                <Route path="analytics" element={<AnalyticsPage />} />

                {/* Global Settings */}
                <Route path="settings" element={<SettingsPage />} />
                <Route path="settings/environment" element={<EnvironmentPage />} />
                <Route path="settings/environment" element={<EnvironmentPage />} />
                <Route path="settings/mfa" element={<MFASetupPage />} />
                <Route path="settings/sso" element={<SSOConfigPage />} />
                <Route path="settings/security" element={<SecurityPage />} />

                {/* Global Audit Logs */}
                <Route path="audit-logs" element={<AuditLogsPage />} />

                {/* Billing & Pricing */}
                <Route path="billing" element={<BillingPage />} />
                <Route path="pricing" element={<PricingPage />} />

                {/* Support */}
                <Route path="support" element={<SupportPage />} />
            </Route>

            {/* Super Admin Routes */}
            <Route
                path="/admin/system"
                element={
                    <ProtectedRoute>
                        <SuperAdminLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<SystemDashboardPage />} />
                <Route path="errors" element={<ErrorLogsPage />} />
                <Route path="coupons" element={<CouponManagementPage />} />
                <Route path="tenants" element={<TenantManagementPage />} />
                <Route path="users" element={<PlatformUsersPage />} />
                <Route path="audit" element={<AuditLogsPage />} />
                <Route path="health" element={<SystemHealthPage />} />
                <Route path="settings" element={<SystemSettingsPage />} />
            </Route>


            {/* Project-specific routes */}
            <Route
                path="/dashboard/project/:projectId"
                element={
                    <ProtectedRoute>
                        <ProjectDashboard />
                    </ProtectedRoute>
                }
            >
                {/* Project Overview */}
                <Route index element={<ProjectOverview />} />

                {/* Content Types */}
                <Route path="content-types" element={<ContentTypesListPage />} />
                <Route path="content-types/new" element={<ContentTypeBuilderPage />} />
                <Route path="content-types/:contentTypeId" element={<ContentTypesListPage />} />
                <Route path="content-types/:contentTypeId/edit" element={<ContentTypeBuilderPage />} />

                {/* Dynamic Content Management */}
                <Route path="content/:contentTypeId" element={<DynamicContentListPage />} />
                <Route path="content/:contentTypeId/new" element={<DynamicContentEditorPage />} />
                <Route path="content/:contentTypeId/:contentId" element={<DynamicContentEditorPage />} />

                {/* Localization */}
                <Route path="locales" element={<LocalesPage />} />

                {/* Chatbot */}
                <Route path="chatbot/knowledge" element={<KnowledgeBasePage />} />
                <Route path="chatbot/conversations" element={<ChatbotConversationsPage />} />
                <Route path="chatbot/settings" element={<ChatbotSettingsPage />} />

                {/* RAG Bots */}
                <Route path="rag-bots" element={<RagBotListPage />} />
                <Route path="rag-bots/:botId" element={<RagBotBuilderPage />} />
                <Route path="rag-bots/:botId/analytics" element={<RagBotAnalyticsPage />} />

                {/* Media */}
                <Route path="media" element={<MediaLibraryPage />} />

                {/* Analytics */}
                <Route path="analytics" element={<AnalyticsPage />} />

                {/* API Keys */}
                <Route path="api-keys" element={<APIKeysPage />} />



                {/* Content Calendar */}
                <Route path="calendar" element={<ContentCalendar />} />

                {/* Import / Export */}
                <Route path="import-export" element={<ImportExportPage />} />

                {/* Backup */}
                <Route path="backup" element={<BackupPage />} />

                {/* Archive */}
                <Route path="archive" element={<ArchivePage />} />

                {/* Team & Roles */}
                <Route path="team" element={<TeamPage />} />
                <Route path="team/roles" element={<RolesPage />} />
                <Route path="users" element={<UsersPage />} />

                {/* Webhooks */}
                <Route path="webhooks" element={<WebhooksPage />} />
                <Route path="webhooks/logs" element={<WebhookLogsPage />} />

                {/* Schedules */}
                <Route path="schedules" element={<ContentSchedulingPage />} />

                {/* Workflows */}
                <Route path="workflows" element={<WorkflowListPage />} />
                <Route path="workflows/new" element={<WorkflowBuilderPage />} />
                <Route path="workflows/:workflowId/edit" element={<WorkflowBuilderPage />} />

                {/* Email Templates */}
                <Route path="email-templates" element={<EmailTemplatesPage />} />

                {/* Trash & Archive */}
                <Route path="trash" element={<TrashPage />} />

                {/* Settings */}
                <Route path="settings" element={<SettingsPage />} />
                <Route path="settings/mfa" element={<MFASetupPage />} />
                <Route path="settings/sso" element={<SSOConfigPage />} />
                <Route path="settings/security" element={<SecurityPage />} />

                {/* SEO Suite */}
                <Route path="seo" element={<SeoDashboardPage />} />
                <Route path="seo/sitemap" element={<SitemapConfigPage />} />
                <Route path="seo/robots" element={<RobotsEditorPage />} />
                <Route path="seo/schema" element={<SchemaBuilderPage />} />
                <Route path="seo/audit" element={<SiteAuditPage />} />
                <Route path="seo/keywords" element={<KeywordTrackerPage />} />
            </Route>

            {/* Project-specific routes (Alias) */}
            <Route
                path="/dashboard/projects/:projectId"
                element={
                    <ProtectedRoute>
                        <ProjectDashboard />
                    </ProtectedRoute>
                }
            >
                {/* Same routes as above - simplified by redirection or identical nesting */}
                <Route index element={<ProjectOverview />} />
                <Route path="content-types" element={<ContentTypesListPage />} />
                <Route path="content-types/new" element={<ContentTypeBuilderPage />} />
                <Route path="content-types/:contentTypeId" element={<ContentTypesListPage />} />
                <Route path="content-types/:contentTypeId/edit" element={<ContentTypeBuilderPage />} />
                <Route path="content/:contentTypeId" element={<DynamicContentListPage />} />
                <Route path="content/:contentTypeId/new" element={<DynamicContentEditorPage />} />
                <Route path="content/:contentTypeId/:contentId" element={<DynamicContentEditorPage />} />
                <Route path="locales" element={<LocalesPage />} />
                <Route path="chatbot/knowledge" element={<KnowledgeBasePage />} />
                <Route path="chatbot/conversations" element={<ChatbotConversationsPage />} />
                <Route path="chatbot/settings" element={<ChatbotSettingsPage />} />
                <Route path="rag-bots" element={<RagBotListPage />} />
                <Route path="rag-bots/:botId" element={<RagBotBuilderPage />} />
                <Route path="rag-bots/:botId/analytics" element={<RagBotAnalyticsPage />} />
                <Route path="media" element={<MediaLibraryPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="api-keys" element={<APIKeysPage />} />
                <Route path="team" element={<TeamPage />} />
                <Route path="team/roles" element={<RolesPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="webhooks" element={<WebhooksPage />} />
                <Route path="webhooks/logs" element={<WebhookLogsPage />} />
                <Route path="schedules" element={<ContentSchedulingPage />} />
                <Route path="workflows" element={<WorkflowListPage />} />
                <Route path="workflows/new" element={<WorkflowBuilderPage />} />
                <Route path="workflows/:workflowId/edit" element={<WorkflowBuilderPage />} />
                {/* Content Calendar */}
                <Route path="calendar" element={<ContentCalendar />} />

                {/* Import / Export */}
                <Route path="import-export" element={<ImportExportPage />} />

                {/* Backup */}
                <Route path="backup" element={<BackupPage />} />

                {/* Archive */}
                <Route path="archive" element={<ArchivePage />} />
                <Route path="email-templates" element={<EmailTemplatesPage />} />
                <Route path="trash" element={<TrashPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="settings/environment" element={<EnvironmentPage />} />
                <Route path="settings/mfa" element={<MFASetupPage />} />
                <Route path="settings/sso" element={<SSOConfigPage />} />
                <Route path="settings/security" element={<SecurityPage />} />

                {/* SEO Suite */}
                <Route path="seo" element={<SeoDashboardPage />} />
                <Route path="seo/sitemap" element={<SitemapConfigPage />} />
                <Route path="seo/robots" element={<RobotsEditorPage />} />
                <Route path="seo/schema" element={<SchemaBuilderPage />} />
                <Route path="seo/audit" element={<SiteAuditPage />} />
                <Route path="seo/keywords" element={<KeywordTrackerPage />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
            <Toaster />
            <OfflineBanner />
        </>
    );
}
