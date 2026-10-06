// Auth pages
export { LoginPage, RegisterPage } from './auth';

// Dashboard pages
export { DashboardHome } from './dashboard';

// Content pages
export { ContentListPage, ContentEditorPage, DynamicContentListPage, DynamicContentEditorPage } from './content';

// API Keys pages
export { APIKeysPage } from './apikeys';

// Settings pages
export { SettingsPage } from './settings';
export { RolesPage } from './roles';
export { TeamPage } from './team';
export { UsersPage } from './users';

// Media pages
export { MediaLibraryPage } from './media';

// Analytics pages
export { AnalyticsPage } from './analytics';

// Project pages
export { ProjectsPage, ProjectDashboard, ProjectOverview, ContentSectionPage } from './projects';
export { ContentTypeBuilderPage, ContentTypesListPage } from './content-types';

// Security and Auth Additions
export { MFASetupPage, SSOConfigPage, SecurityPage } from './auth';

// Feature Modules
export { WebhooksPage, WebhookLogsPage } from './webhooks';
export { ContentSchedulingPage } from './schedules';
export { WorkflowListPage, WorkflowBuilderPage } from './workflows';

// SEO Suite
export { default as SeoDashboardPage } from './seo/SeoDashboardPage';
export { default as RobotsEditorPage } from './seo/RobotsEditorPage';
export { default as SitemapConfigPage } from './seo/SitemapConfigPage';
export { default as SchemaBuilderPage } from './seo/SchemaBuilderPage';
export { default as SiteAuditPage } from './seo/SiteAuditPage';
export { default as KeywordTrackerPage } from './seo/KeywordTrackerPage';

// Chatbot pages
export { KnowledgeBasePage, ChatbotConversationsPage, ChatbotSettingsPage } from './chatbot';
export { RagBotListPage, RagBotBuilderPage, RagBotAnalyticsPage } from './rag-bot';

// Backup pages
export { BackupPage } from './backup/BackupPage';

// Import/Export pages
export { ImportExportPage } from './import-export/ImportExportPage';

// Archive pages
export { ArchivePage } from './archive/ArchivePage';

// Calendar pages
export { ContentCalendar } from './calendar/ContentCalendar';
export { EmailTemplatesPage } from './email-templates/EmailTemplatesPage';
export { TrashPage } from './trash/TrashPage';
export { LocalesPage } from './locales/LocalesPage';
