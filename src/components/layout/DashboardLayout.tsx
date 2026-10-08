import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    Image,
    Settings,
    Key,
    BarChart3,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Moon,
    Sun,
    Menu,
    X,
    Layers,
    Navigation,
    ImageIcon,
    MessageSquare,
    HelpCircle,
    Newspaper,
    ScrollText,
    FolderKanban,
    CreditCard,
    ShieldAlert,
    Gauge,
    Sparkles,
    Puzzle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/store';
import { NotificationCenter } from '@/components/ui/NotificationCenter';
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

const navigation = [
    { name: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
    { name: 'Content', href: '/dashboard/content', icon: FileText },
    { name: 'Media Library', href: '/dashboard/media', icon: Image },
    { name: 'API Keys', href: '/dashboard/api-keys', icon: Key },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
    { name: 'Usage', href: '/dashboard/usage', icon: Gauge },
    { name: 'AI Settings', href: '/dashboard/settings/ai', icon: Sparkles },
    { name: 'Plugins', href: '/dashboard/plugins', icon: Puzzle },
    { name: 'Audit Logs', href: '/dashboard/audit-logs', icon: ScrollText },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    { name: 'Support', href: '/dashboard/support', icon: HelpCircle },
];

export default function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const { user, tenant, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        document.documentElement.classList.toggle('dark');
    };

    const getInitials = (firstName?: string, lastName?: string) => {
        return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Mobile menu overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300',
                    sidebarOpen ? 'w-64' : 'w-20',
                    mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                )}
            >
                {/* Logo */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Layers className="w-5 h-5 text-white" />
                        </div>
                        {sidebarOpen && (
                            <span className="font-bold text-lg gradient-text animate-fade-in">
                                CMS
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="lg:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-hide">
                    <ul className="space-y-1">
                        {navigation.map((item) => (
                            <li key={item.name}>
                                <NavLink
                                    to={item.href}
                                    end={item.href === '/dashboard'}
                                    className={({ isActive }) =>
                                        cn(
                                            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                                            isActive
                                                ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                                        )
                                    }
                                >
                                    <item.icon className={cn('w-5 h-5 shrink-0', !sidebarOpen && 'mx-auto')} />
                                    {sidebarOpen && <span>{item.name}</span>}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* User section */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className={cn('flex items-center gap-3', !sidebarOpen && 'justify-center')}>
                        <Avatar className="w-10 h-10">
                            <AvatarImage src={user?.avatar} />
                            <AvatarFallback>{getInitials(user?.firstName, user?.lastName)}</AvatarFallback>
                        </Avatar>
                        {sidebarOpen && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {user?.firstName} {user?.lastName}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {tenant?.name}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Collapse button */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 items-center justify-center shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                    {sidebarOpen ? (
                        <ChevronLeft className="w-4 h-4 text-gray-500" />
                    ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                    )}
                </button>
            </aside>

            {/* Main content */}
            <div className={cn('transition-all duration-300', sidebarOpen ? 'lg:pl-64' : 'lg:pl-20')}>
                {/* Top bar */}
                <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between h-full px-4 lg:px-8">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setMobileMenuOpen(true)}
                                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {tenant?.name || 'Dashboard'}
                                </h1>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {tenant?.subscription?.plan?.toUpperCase()} Plan
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <LanguageSwitcher />
                            <NotificationCenter />
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleDarkMode}
                                className="rounded-xl"
                            >
                                {darkMode ? (
                                    <Sun className="w-5 h-5" />
                                ) : (
                                    <Moon className="w-5 h-5" />
                                )}
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleLogout}
                                className="rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                                <LogOut className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main id="main-content" className="p-4 lg:p-8">
                    <div className="mb-6">
                        <Breadcrumbs />
                    </div>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
