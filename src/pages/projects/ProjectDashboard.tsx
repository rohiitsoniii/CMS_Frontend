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
    Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { projectAPI } from '@/services/api';
import { useAuthStore } from '@/store';
import { cn } from '@/lib/utils';

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
    const [expandedSections, setExpandedSections] = useState<string[]>(['content', 'aibots']);

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
            label: 'Content',
            icon: Layers,
            href: '#content',
            children: [
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
            label: 'Templates',
            icon: Mail,
            href: `/dashboard/project/${projectId}/email-templates`,
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
            href: `/dashboard/project/${projectId}/settings`,
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
            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed left-0 top-0 z-40 h-screen transition-all duration-300 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800',
                    sidebarCollapsed ? 'w-16' : 'w-64'
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
                    {!sidebarCollapsed && (
                        <div className="flex items-center gap-2 min-w-0">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="shrink-0"
                                onClick={() => navigate('/dashboard')}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <div className="truncate">
                                <h2 className="font-semibold text-gray-900 dark:text-white truncate">
                                    {project?.name || currentProject?.name || 'Project'}
                                </h2>
                                <p className="text-xs text-gray-500 truncate">
                                    {project?.slug || currentProject?.slug}
                                </p>
                            </div>
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className={sidebarCollapsed ? 'mx-auto' : ''}
                    >
                        {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                    </Button>
                </div>

                {/* Navigation */}
                <nav className="p-2 space-y-1 overflow-y-auto h-[calc(100vh-8rem)]">
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
                                        className={cn(
                                            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                                            'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
                                            sidebarCollapsed && 'justify-center'
                                        )}
                                    >
                                        <Icon className="w-5 h-5 shrink-0" />
                                        {!sidebarCollapsed && (
                                            <>
                                                <span className="flex-1 text-left">{item.label}</span>
                                                {item.badge && (
                                                    <Badge variant="success" className="text-[10px] px-1.5 py-0">
                                                        {item.badge}
                                                    </Badge>
                                                )}
                                                <ChevronDown
                                                    className={cn(
                                                        'w-4 h-4 transition-transform',
                                                        isExpanded && 'rotate-180'
                                                    )}
                                                />
                                            </>
                                        )}
                                    </button>

                                    {!sidebarCollapsed && isExpanded && (
                                        <div className="ml-4 pl-4 mt-1 space-y-1 border-l border-gray-200 dark:border-gray-700">
                                            {item.children!.map((child) => {
                                                const ChildIcon = child.icon;
                                                const count = child.type ? getContentCount(child.type) : null;
                                                return (
                                                    <Link
                                                        key={child.href}
                                                        to={child.href}
                                                        className={cn(
                                                            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                                                            isActiveRoute(child.href)
                                                                ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                                        )}
                                                    >
                                                        <ChildIcon className="w-4 h-4" />
                                                        <span className="flex-1">{child.label}</span>
                                                        {count !== null && count > 0 && (
                                                            <span className="text-xs text-gray-400">{count}</span>
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
                                className={cn(
                                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
                                    sidebarCollapsed && 'justify-center'
                                )}
                            >
                                <Icon className="w-5 h-5 shrink-0" />
                                {!sidebarCollapsed && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                {!sidebarCollapsed && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Globe className="w-4 h-4" />
                            <span className="truncate">{project?.domain || 'No domain'}</span>
                            {project?.domain && (
                                <a
                                    href={`https://${project.domain}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-auto"
                                >
                                    <ExternalLink className="w-4 h-4 hover:text-indigo-500" />
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </aside>

            {/* Main Content */}
            <main
                className={cn(
                    'flex-1 transition-all duration-300',
                    sidebarCollapsed ? 'ml-16' : 'ml-64'
                )}
            >
                <div className="p-6">
                    <Outlet context={{ project, stats, isLoading }} />
                </div>
            </main>
        </div>
    );
}
