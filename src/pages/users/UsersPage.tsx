import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Users, Search, Trash2, Ban, CheckCircle, XCircle } from 'lucide-react';
import { endUserService, IEndUser } from '../../services/endUserService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from 'react-hot-toast';

export const UsersPage: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const [users, setUsers] = useState<IEndUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
    const [suspendUserTarget, setSuspendUserTarget] = useState<IEndUser | null>(null);
    const [deleteUserTarget, setDeleteUserTarget] = useState<IEndUser | null>(null);

    useEffect(() => {
        loadUsers();
    }, [projectId, pagination.page]);

    const loadUsers = async () => {
        if (!projectId) return;
        try {
            const data = await endUserService.getUsers(projectId, pagination.page, pagination.limit);
            setUsers(data.data);
            setPagination(data.pagination);
        } catch {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmSuspend = async () => {
        if (!suspendUserTarget) return;
        try {
            await endUserService.suspendUser(suspendUserTarget._id);
            toast.success('User suspended successfully');
            loadUsers();
        } catch {
            toast.error('Failed to suspend user');
        } finally {
            setSuspendUserTarget(null);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteUserTarget) return;
        try {
            await endUserService.deleteUser(deleteUserTarget._id);
            toast.success('User deleted successfully');
            loadUsers();
        } catch {
            toast.error('Failed to delete user');
        } finally {
            setDeleteUserTarget(null);
        }
    };

    const filteredUsers = users.filter(user => {
        const query = searchQuery.toLowerCase();
        return (
            user.email?.toLowerCase().includes(query) ||
            user.firstName?.toLowerCase().includes(query) ||
            user.lastName?.toLowerCase().includes(query)
        );
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
                Loading users...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5 dark:border-gray-800">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5">
                        <Users className="w-6 h-6 text-primary" />
                        End Users
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">Manage registered application end-users, login statistics, and accounts.</p>
                </div>
                <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-background"
                    />
                </div>
            </div>

            <Card className="border border-border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 border-b border-border text-muted-foreground font-medium">
                            <tr>
                                <th className="px-6 py-3.5">User</th>
                                <th className="px-6 py-3.5">Activity</th>
                                <th className="px-6 py-3.5">Status</th>
                                <th className="px-6 py-3.5">Verified</th>
                                <th className="px-6 py-3.5">Joined</th>
                                <th className="px-6 py-3.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredUsers.map(user => (
                                <tr key={user._id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {user.avatar ? (
                                                <img className="h-9 w-9 rounded-full object-cover shrink-0" src={user.avatar} alt="" />
                                            ) : (
                                                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                                                    {(user.firstName || user.email || 'U').charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <div className="font-semibold text-foreground text-sm truncate">
                                                    {user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Unnamed'}
                                                </div>
                                                <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs font-semibold text-foreground">
                                            {user.loginCount || 0} logins
                                        </div>
                                        <div className="text-[11px] text-muted-foreground">
                                            Last: {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge 
                                            variant="outline" 
                                            className={`text-xs capitalize ${
                                                user.status === 'active' 
                                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
                                                    : 'bg-destructive/10 text-destructive border-destructive/20'
                                            }`}
                                        >
                                            {user.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.emailVerified ? (
                                            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                        ) : (
                                            <XCircle className="w-4 h-4 text-muted-foreground/40" />
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-xs text-muted-foreground">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => setSuspendUserTarget(user)}
                                                className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                                                title="Suspend User"
                                                aria-label="Suspend User"
                                            >
                                                <Ban className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => setDeleteUserTarget(user)}
                                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                title="Delete User"
                                                aria-label="Delete User"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-xs text-muted-foreground">
                                        No users matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="bg-muted/40 px-6 py-3.5 border-t border-border flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                        Page {pagination.page} of {Math.max(1, pagination.pages)} ({pagination.total} users)
                    </span>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.page <= 1}
                            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                            className="h-8 text-xs"
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.page >= pagination.pages}
                            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                            className="h-8 text-xs"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </Card>

            <ConfirmDialog
                open={!!suspendUserTarget}
                onOpenChange={(open) => !open && setSuspendUserTarget(null)}
                title="Suspend User Account"
                description={`Are you sure you want to suspend account ${suspendUserTarget?.email}? They will no longer be able to log in.`}
                confirmText="Suspend User"
                variant="destructive"
                onConfirm={handleConfirmSuspend}
            />

            <ConfirmDialog
                open={!!deleteUserTarget}
                onOpenChange={(open) => !open && setDeleteUserTarget(null)}
                title="Delete User Account"
                description={`Delete account ${deleteUserTarget?.email}? This action cannot be undone and will permanently erase user records.`}
                confirmText="Delete"
                variant="destructive"
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
};

export default UsersPage;
