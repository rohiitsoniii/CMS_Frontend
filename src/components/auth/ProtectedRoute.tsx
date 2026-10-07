import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store';

interface ProtectedRouteProps {
    children?: React.ReactNode;
    requiredRole?: 'superAdmin' | string;
    redirectTo?: string;
}

export default function ProtectedRoute({ children, requiredRole, redirectTo = '/login' }: ProtectedRouteProps) {
    const { isAuthenticated, user } = useAuthStore();

    if (!isAuthenticated) {
        return <Navigate to={redirectTo} replace />;
    }

    if (requiredRole === 'superAdmin') {
        const role = user?.role?.toLowerCase();
        const isSuperAdmin = role === 'superadmin' || role === 'super_admin' || role === 'owner';
        if (!isSuperAdmin) {
            return <Navigate to="/dashboard" replace />;
        }
    }

    return children ? <>{children}</> : <Outlet />;
}
