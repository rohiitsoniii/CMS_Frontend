import { useState } from 'react';
import { useParams, useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    LayoutDashboard,
    Image,
    Settings,
    Key,
    BarChart3,
    ChevronLeft,
    ChevronDown,
    ChevronRight,
    Globe,
    MessageSquare,
    Menu,
    X,
    Layers,
    Type,
    FootprintsIcon,
    Sparkles,
    BookOpen,
    HelpCircle,
    Quote,
    Megaphone,
    FileCode,
    Brain,
    MessagesSquare,
    Cog,
    ExternalLink,
    Users,
    User,
    Shield,
    Webhook,
    Calendar,
    GitBranch,
    Bot,
    DatabaseBackup,
    FileInput,
    Archive,
    Mail,
    Trash2,
    Search,
    Activity,
    Clock,
    Boxes,
    Languages,
    Send,
    Filter,
    Gauge,
    ArrowRightLeft,
    Settings2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { projectAPI } from '@/services/api';
import { contentTypeService, ContentType } from '@/services/contentTypeService';
import { useAuthStore } from '@/store';
import { cn } from '@/lib/utils';
import { Moon, Sun, KeyRound } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { NotificationCenter } from '@/components/ui/NotificationCenter';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

interface NavItem {
    label: string;
    icon: React.ElementType;
    href: string;
    badge?: string;
    children?: {
        label: string;
        icon: React.ElementType;
        href: string;
        type?: string;
    }[];
}

export default function ProjectDashboard() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const currentProject = useAuthStore((state) => state.currentProject);

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [expandedSections, setExpandedSections] = useState<string[]>(['content', 'aibots', 'settings']);
    const user = useAuthStore((state) => state.user);
    const [darkMode, setDarkMode] = useState(() => {
        return document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
    });

    const toggleDarkMode = () => {
        const next = !darkMode;
        setDarkMode(next);
        if (next) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    const openCommandPalette = () => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
    };

    // Fetch project details
    const { data: project, isLoading } = useQuery({
        queryKey: ['project', projectId],
        queryFn: async () => {
            const response = await projectAPI.getById(projectId!);
            return response.data.data.project;
        },
        enabled: !!projectId,
    });

    // Fetch project stats
    const { data: stats } = useQuery({
        queryKey: ['project-stats', projectId],
        queryFn: async () => {
            const response = await projectAPI.getStats(projectId!);
            return response.data.data.stats;
        },
        enabled: !!projectId,
    });

    // Fetch custom content types
    const { data: customContentTypes = [] } = useQuery<ContentType[]>({
        queryKey: ['project-content-types', projectId],
        queryFn: async () => {
            return await contentTypeService.getContentTypes(projectId!);
        },
        enabled: !!projectId,
    });

    const toggleSection = (section: string) => {
        setExpandedSections((prev) =>
            prev.includes(section)
                ? prev.filter((s) => s !== section)
                : [...prev, section]
        );
    };

    const navigation: NavItem[] = [
        {
            label: 'Overview',
            icon: LayoutDashboard,
            href: `/dashboard/project/${projectId}`,
        },
        {
            label: 'Content Models',
            icon: Boxes,
            href: `/dashboard/project/${projectId}/content-types`,
            badge: customContentTypes.length > 0 ? String(customContentTypes.length) : undefined,
        },
        {
            label: 'Content',
            icon: Layers,
            href: '#content',
            children: [
                ...(customContentTypes.map((ct) => ({
                    label: ct.displayName || ct.name,
                    icon: FileCode,
                    href: `/dashboard/project/${projectId}/content/${ct._id || ct.name}`,
                    type: ct.name,
                }))),
                { label: 'Headers', icon: Type, href: `/dashboard/project/${projectId}/content/header`, type: 'header' },
                { label: 'Footers', icon: FootprintsIcon, href: `/dashboard/project/${projectId}/content/footer`, type: 'footer' },
                { label: 'Heroes', icon: Sparkles, href: `/dashboard/project/${projectId}/content/hero`, type: 'hero' },
                { label: 'Blogs', icon: BookOpen, href: `/dashboard/project/${projectId}/content/blog`, type: 'blog' },
                { label: 'Pages', icon: FileCode, href: `/dashboard/project/${projectId}/content/page`, type: 'page' },
                { label: 'FAQs', icon: HelpCircle, href: `/dashboard/project/${projectId}/content/faq`, type: 'faq' },
                { label: 'Testimonials', icon: Quote, href: `/dashboard/project/${projectId}/content/testimonial`, type: 'testimonial' },
                { label: 'Banners', icon: Megaphone, href: `/dashboard/project/${projectId}/content/banner`, type: 'banner' },
            ],
        },
        {
            label: 'Locales & i18n',
            icon: Languages,
            href: `/dashboard/project/${projectId}/locales`,
        },
        {
            label: 'AI Bots',
            icon: Bot,
            href: '#aibots',
            children: [
                { label: 'RAG Bots', icon: Bot, href: `/dashboard/project/${projectId}/rag-bots` },
                { label: 'Knowledge Base', icon: Brain, href: `/dashboard/project/${projectId}/chatbot/knowledge` },
                { label: 'Conversations', icon: MessagesSquare, href: `/dashboard/project/${projectId}/chatbot/conversations` },
                { label: 'Legacy Settings', icon: Cog, href: `/dashboard/project/${projectId}/chatbot/settings` },
            ],
        },
        {
            label: 'Media',
            icon: Image,
            href: `/dashboard/project/${projectId}/media`,
        },
        {
            label: 'Analytics',
            icon: BarChart3,
            href: `/dashboard/project/${projectId}/analytics`,
        },
        {
            label: 'API Keys',
            icon: Key,
            href: `/dashboard/project/${projectId}/api-keys`,
        },
        {
            label: 'SEO',
            icon: Search,
            href: '#seo',
            badge: 'Pro',
            children: [
                { label: 'Dashboard', icon: LayoutDashboard, href: `/dashboard/project/${projectId}/seo` },
                { label: 'Site Audit', icon: Activity, href: `/dashboard/project/${projectId}/seo/audit` },
                { label: 'Keyword Tracker', icon: Search, href: `/dashboard/project/${projectId}/seo/keywords` },
                { label: 'Sitemap', icon: Globe, href: `/dashboard/project/${projectId}/seo/sitemap` },
                { label: 'Robots.txt', icon: FileCode, href: `/dashboard/project/${projectId}/seo/robots` },
                { label: 'Schema Builder', icon: Sparkles, href: `/dashboard/project/${projectId}/seo/schema` },
                { label: 'AI Search (GEO)', icon: Bot, href: `/dashboard/project/${projectId}/seo/geo` },
                { label: 'Redirects & 404s', icon: ArrowRightLeft, href: `/dashboard/project/${projectId}/seo/redirects` },
                { label: 'Page Speed', icon: Gauge, href: `/dashboard/project/${projectId}/seo/pagespeed` },
                { label: 'SEO Settings', icon: Settings2, href: `/dashboard/project/${projectId}/seo/settings` },
            ],
        },
        {
            label: 'Team',
            icon: Users,
            href: '#team',
            children: [
                { label: 'Members', icon: Users, href: `/dashboard/project/${projectId}/team` },
                { label: 'Roles', icon: Shield, href: `/dashboard/project/${projectId}/team/roles` },
            ],
        },
        {
            label: 'End Users',
            icon: User,
            href: `/dashboard/project/${projectId}/users`,
        },
        {
            label: 'Webhooks',
            icon: Webhook,
            href: `/dashboard/project/${projectId}/webhooks`,
        },
        {
            label: 'Scheduling',
            icon: Calendar,
            href: `/dashboard/project/${projectId}/schedules`,
            children: [
                { label: 'Calendar View', icon: Calendar, href: `/dashboard/project/${projectId}/calendar` },
                { label: 'Publishing Queue', icon: Clock, href: `/dashboard/project/${projectId}/schedules` },
            ],
        },
        {
            label: 'Workflows',
            icon: GitBranch,
            href: `/dashboard/project/${projectId}/workflows`,
        },
        {
            label: 'Email Marketing',
            icon: Mail,
            href: '#email',
            children: [
                { label: 'Campaigns', icon: Send, href: `/dashboard/project/${projectId}/email/campaigns` },
                { label: 'Audience', icon: Users, href: `/dashboard/project/${projectId}/email/audience` },
                { label: 'Segments', icon: Filter, href: `/dashboard/project/${projectId}/email/segments` },
                { label: 'Templates', icon: FileCode, href: `/dashboard/project/${projectId}/email-templates` },
                { label: 'Email Settings', icon: Cog, href: `/dashboard/project/${projectId}/email/settings` },
            ],
        },
        {
            label: 'Data Management',
            icon: DatabaseBackup,
            href: '#data',
            children: [
                { label: 'Backup & Restore', icon: DatabaseBackup, href: `/dashboard/project/${projectId}/backup` },
                { label: 'Import / Export', icon: FileInput, href: `/dashboard/project/${projectId}/import-export` },
                { label: 'Archive', icon: Archive, href: `/dashboard/project/${projectId}/archive` },
                { label: 'Trash', icon: Trash2, href: `/dashboard/project/${projectId}/trash` },
            ],
        },
        {
            label: 'Settings',
            icon: Settings,
            href: '#settings',
            children: [
                { label: 'General', icon: Settings, href: `/dashboard/project/${projectId}/settings` },
                { label: 'Environment', icon: KeyRound, href: `/dashboard/project/${projectId}/settings/environment` },
                { label: 'Security & MFA', icon: Shield, href: `/dashboard/project/${projectId}/settings/security` },
                { label: 'AI (Bring your own key)', icon: Sparkles, href: `/dashboard/project/${projectId}/settings/ai` },
            ],
        },
    ];

    const isActiveRoute = (href: string) => {
        if (href.startsWith('#')) return false;
        return location.pathname === href || location.pathname.startsWith(href + '/');
    };

    const getContentCount = (type: string) => {
        return stats?.content?.[type]?.total || 0;
    };

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Mobile backdrop overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-50 transition-all duration-300 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col',
                    sidebarCollapsed ? 'w-16' : 'w-64',
                    mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
                    {!sidebarCollapsed && (
                        <div className="flex items-center gap-2 min-w-0">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="shrink-0"
                                onClick={() => navigate('/dashboard')}
                                aria-label="Back to projects"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <div className="truncate">
                                <h2 className="font-semibold text-gray-900 dark:text-white truncate text-sm">
                                    {project?.name || currentProject?.name || 'Project'}
                                </h2>
                                <p className="text-xs text-gray-500 truncate">
                                    {project?.slug || currentProject?.slug}
                                </p>
                            </div>
                        </div>
                    )}
                    <div className="flex items-center gap-1 ml-auto">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className={cn('hidden lg:flex', sidebarCollapsed && 'mx-auto')}
                            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        >
                            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setMobileMenuOpen(false)}
                            className="lg:hidden"
                            aria-label="Close menu"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="p-2 space-y-1 overflow-y-auto flex-1 scrollbar-hide">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const hasChildren = item.children && item.children.length > 0;
                        const isExpanded = expandedSections.includes(item.label.toLowerCase());
                        const isActive = isActiveRoute(item.href);

                        if (hasChildren) {
                            return (
                                <div key={item.label}>
                                    <button
                                        onClick={() => toggleSection(item.label.toLowerCase())}
                                        aria-expanded={isExpanded}
                                        className={cn(
                                            'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer',
                                            'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
                                            sidebarCollapsed && 'justify-center'
                                        )}
                                    >
                                        <Icon className="w-4 h-4 shrink-0" />
                                        {!sidebarCollapsed && (
                                            <>
                                                <span className="flex-1 text-left">{item.label}</span>
                                                {item.badge && (
                                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                                        {item.badge}
                                                    </Badge>
                                                )}
                                                <ChevronDown
                                                    className={cn(
                                                        'w-4 h-4 transition-transform duration-200',
                                                        isExpanded && 'transform rotate-180'
                                                    )}
                                                />
                                            </>
                                        )}
                                    </button>

                                    {/* Submenu */}
                                    {!sidebarCollapsed && isExpanded && (
                                        <div className="ml-4 pl-2 border-l border-gray-200 dark:border-gray-800 space-y-1 mt-1">
                                            {item.children?.map((child) => {
                                                const ChildIcon = child.icon;
                                                const isChildActive = location.pathname === child.href;
                                                const count = child.type ? getContentCount(child.type) : null;

                                                return (
                                                    <Link
                                                        key={child.label}
                                                        to={child.href}
                                                        onClick={() => setMobileMenuOpen(false)}
                                                        className={cn(
                                                            'flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                                                            isChildActive
                                                                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold'
                                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                                        )}
                                                    >
                                                        <ChildIcon className="w-3.5 h-3.5 shrink-0" />
                                                        <span className="flex-1 truncate">{child.label}</span>
                                                        {count !== null && count > 0 && (
                                                            <span className="text-[10px] text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-full">
                                                                {count}
                                                            </span>
                                                        )}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        return (
                            <Link
                                key={item.label}
                                to={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={cn(
                                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
                                    sidebarCollapsed && 'justify-center'
                                )}
                            >
                                <Icon className="w-4 h-4 shrink-0" />
                                {!sidebarCollapsed && (
                                    <>
                                        <span className="flex-1 truncate">{item.label}</span>
                                        {item.badge && (
                                            <Badge variant={isActive ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">
                                                {item.badge}
                                            </Badge>
                                        )}
                                    </>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                {!sidebarCollapsed && (
                    <div className="p-3 border-t border-gray-200 dark:border-gray-800 shrink-0">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Globe className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{project?.domain || 'No domain'}</span>
                            {project?.domain && (
                                <a
                                    href={`https://${project.domain}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-auto text-gray-400 hover:text-indigo-500"
                                    aria-label="Visit project site"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </aside>

            {/* Main Content */}
            <main
                className={cn(
                    'flex-1 min-h-screen transition-all duration-300 w-full flex flex-col',
                    sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64',
                    'ml-0'
                )}
            >
                {/* Unified Desktop & Mobile Header */}
                <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between h-full px-4 lg:px-8">
                        <div className="flex items-center gap-3 min-w-0">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setMobileMenuOpen(true)}
                                className="lg:hidden shrink-0"
                                aria-label="Open navigation menu"
                            >
                                <Menu className="w-5 h-5" />
                            </Button>
                            
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate('/dashboard/projects')}
                                className="hidden sm:inline-flex text-xs text-muted-foreground hover:text-foreground shrink-0"
                            >
                                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                                Projects
                            </Button>

                            <div className="h-4 w-px bg-border hidden sm:block shrink-0" />

                            <div className="truncate">
                                <h2 className="font-semibold text-gray-900 dark:text-white truncate text-sm">
                                    {project?.name || currentProject?.name || 'Project'}
                                </h2>
                                <p className="text-[11px] text-muted-foreground truncate hidden md:block">
                                    {project?.slug || currentProject?.slug}
                                </p>
                            </div>
                        </div>

                        {/* Quick Command Trigger Pill */}
                        <div className="hidden md:flex items-center mx-4 flex-1 max-w-xs">
                            <button
                                type="button"
                                onClick={openCommandPalette}
                                className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-muted-foreground bg-muted/40 hover:bg-muted/80 border border-border rounded-lg transition-colors cursor-pointer"
                            >
                                <span className="flex items-center gap-2">
                                    <Search className="w-3.5 h-3.5" />
                                    <span>Quick search...</span>
                                </span>
                                <kbd className="inline-flex items-center gap-0.5 bg-background border border-border rounded px-1.5 py-0.5 text-[10px] font-mono">
                                    ⌘K
                                </kbd>
                            </button>
                        </div>

                        {/* Right Tools: Notification, Theme, Profile */}
                        <div className="flex items-center gap-1.5">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={openCommandPalette}
                                className="md:hidden h-9 w-9 text-muted-foreground"
                                aria-label="Quick search"
                            >
                                <Search className="w-4 h-4" />
                            </Button>

                            <NotificationCenter />

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleDarkMode}
                                className="h-9 w-9 text-muted-foreground hover:text-foreground"
                                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                            >
                                {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
                            </Button>

                            <div className="h-5 w-px bg-border mx-1 hidden sm:block" />

                            <div className="flex items-center gap-2 pl-1">
                                <Avatar className="w-8 h-8">
                                    <AvatarImage src={user?.avatar} />
                                    <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                                        {(user?.firstName || user?.email || 'U')[0].toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content Container */}
                <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 flex-1 w-full">
                    <Breadcrumbs />
                    <Outlet context={{ project, stats, isLoading }} />
                </div>
            </main>
        </div>
    );
}
