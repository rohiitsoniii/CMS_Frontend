import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Activity,
    AlertCircle,
    Ticket,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Moon,
    Sun,
    Menu,
    X,
    ShieldAlert,
    Database,
    Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/store';

const navigation = [
    { name: 'System Overview', href: '/admin/system', icon: LayoutDashboard },
    { name: 'Tenants', href: '/admin/system/tenants', icon: Globe },
    { name: 'Platform Users', href: '/admin/system/users', icon: Users },
    { name: 'Error Logs', href: '/admin/system/errors', icon: ShieldAlert },
    { name: 'Audit Logs', href: '/admin/system/audit', icon: Activity },
    { name: 'Coupons', href: '/admin/system/coupons', icon: Ticket },
    { name: 'Infrastructure', href: '/admin/system/health', icon: Database },
    { name: 'System Settings', href: '/admin/system/settings', icon: Settings },
];

export default function SuperAdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const { user, logout } = useAuthStore();
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
        return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'SA';
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
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
                    'fixed inset-y-0 left-0 z-50 flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300',
                    sidebarOpen ? 'w-64' : 'w-20',
                    mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                )}
            >
                {/* Logo */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg shadow-red-500/20">
                            <ShieldAlert className="w-5 h-5 text-white" />
                        </div>
                        {sidebarOpen && (
                            <div className="flex flex-col">
                                <span className="font-bold text-lg text-white">
                                    Super Admin
                                </span>
                                <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">
                                    Platform Control
                                </span>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="lg:hidden p-1 rounded-lg hover:bg-slate-800 text-slate-400"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-6 px-3 scrollbar-hide">
                    <ul className="space-y-1.5">
                        {navigation.map((item) => (
                            <li key={item.name}>
                                <NavLink
                                    to={item.href}
                                    end={item.href === '/admin/system'}
                                    className={({ isActive }) =>
                                        cn(
                                            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                                            isActive
                                                ? 'bg-red-500/10 text-red-500'
                                                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
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
                <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                    <div className={cn('flex items-center gap-3', !sidebarOpen && 'justify-center')}>
                        <Avatar className="w-10 h-10 border-2 border-slate-800">
                            <AvatarImage src={user?.avatar} />
                            <AvatarFallback className="bg-slate-800 text-slate-200">{getInitials(user?.firstName, user?.lastName)}</AvatarFallback>
                        </Avatar>
                        {sidebarOpen && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                    {user?.firstName} {user?.lastName}
                                </p>
                                <p className="text-[10px] text-red-500 font-bold uppercase truncate">
                                    Global Master
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Collapse button */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 items-center justify-center shadow-sm hover:bg-slate-700 transition-colors"
                >
                    {sidebarOpen ? (
                        <ChevronLeft className="w-4 h-4 text-slate-400" />
                    ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
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
                            <div className="flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-red-500 animate-pulse" />
                                <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight">
                                    System Administration Mode
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
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
                <main className="p-4 lg:p-8 bg-slate-50 dark:bg-slate-900/50 min-h-[calc(100vh-64px)]">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
