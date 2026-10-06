import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { TeamListSkeleton } from '@/components/skeletons';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    UserPlus,
    Mail,
    Shield,
    MoreVertical,
    Trash2,
    Edit,
    CheckCircle,
    XCircle,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const ROLES = [
    { value: 'owner', label: 'Owner', description: 'Full access to everything' },
    { value: 'admin', label: 'Admin', description: 'Manage content and users' },
    { value: 'editor', label: 'Editor', description: 'Create and edit content' },
    { value: 'viewer', label: 'Viewer', description: 'View content only' },
];

export function TeamManagementPage() {
    const queryClient = useQueryClient();
    const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('editor');
    const [editingUser, setEditingUser] = useState<any>(null);

    // Fetch team members
    const { data: users, isLoading } = useQuery({
        queryKey: ['team-members'],
        queryFn: async () => {
            const response = await fetch('/api/v1/users');
            const data = await response.json();
            return data.data.users;
        },
    });

    // Invite user mutation
    const inviteMutation = useMutation({
        mutationFn: async (data: { email: string; role: string }) => {
            const response = await fetch('/api/v1/users/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to invite user');
            return response.json();
        },
        onSuccess: () => {
            toast.success('Invitation sent successfully');
            setIsInviteDialogOpen(false);
            setInviteEmail('');
            setInviteRole('editor');
            queryClient.invalidateQueries({ queryKey: ['team-members'] });
        },
        onError: () => {
            toast.error('Failed to send invitation');
        },
    });

    // Update user role mutation
    const updateRoleMutation = useMutation({
        mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
            const response = await fetch(`/api/v1/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role }),
            });
            if (!response.ok) throw new Error('Failed to update role');
            return response.json();
        },
        onSuccess: () => {
            toast.success('User role updated');
            setEditingUser(null);
            queryClient.invalidateQueries({ queryKey: ['team-members'] });
        },
        onError: () => {
            toast.error('Failed to update user role');
        },
    });

    // Remove user mutation
    const removeMutation = useMutation({
        mutationFn: async (userId: string) => {
            const response = await fetch(`/api/v1/users/${userId}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to remove user');
            return response.json();
        },
        onSuccess: () => {
            toast.success('User removed from team');
            queryClient.invalidateQueries({ queryKey: ['team-members'] });
        },
        onError: () => {
            toast.error('Failed to remove user');
        },
    });

    const handleInvite = () => {
        if (!inviteEmail.trim()) {
            toast.error('Please enter an email address');
            return;
        }
        inviteMutation.mutate({ email: inviteEmail, role: inviteRole });
    };

    const getRoleBadgeColor = (role: string) => {
        const colors: Record<string, string> = {
            owner: 'bg-purple-100 text-purple-800',
            admin: 'bg-blue-100 text-blue-800',
            editor: 'bg-green-100 text-green-800',
            viewer: 'bg-gray-100 text-gray-800',
        };
        return colors[role] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold">Team Management</h1>
                        <p className="text-gray-600 mt-1">
                            Manage your team members and their permissions
                        </p>
                    </div>
                    <Button onClick={() => setIsInviteDialogOpen(true)}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Invite Team Member
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="p-4">
                    <div className="text-sm text-gray-500">Total Members</div>
                    <div className="text-2xl font-bold">{users?.length || 0}</div>
                </Card>
                <Card className="p-4">
                    <div className="text-sm text-gray-500">Owners</div>
                    <div className="text-2xl font-bold text-purple-600">
                        {users?.filter((u: any) => u.role === 'owner').length || 0}
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="text-sm text-gray-500">Admins</div>
                    <div className="text-2xl font-bold text-blue-600">
                        {users?.filter((u: any) => u.role === 'admin').length || 0}
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="text-sm text-gray-500">Editors</div>
                    <div className="text-2xl font-bold text-green-600">
                        {users?.filter((u: any) => u.role === 'editor').length || 0}
                    </div>
                </Card>
            </div>

            {/* Team Members Table */}
            <Card>
                {isLoading ? (
                    <TeamListSkeleton />
                ) : !users || users.length === 0 ? (
                    <div className="p-12 text-center">
                        <UserPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">No team members yet</h3>
                        <p className="text-gray-500 mb-4">
                            Invite your first team member to get started
                        </p>
                        <Button onClick={() => setIsInviteDialogOpen(true)}>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Invite Team Member
                        </Button>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user: any) => (
                                <TableRow key={user._id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                                                {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-medium">{user.name || 'Unnamed User'}</div>
                                                {user.isCurrentUser && (
                                                    <Badge variant="outline" className="text-xs">You</Badge>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            {user.email}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getRoleBadgeColor(user.role)}>
                                            <Shield className="w-3 h-3 mr-1" />
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {user.isActive ? (
                                            <Badge className="bg-green-100 text-green-800">
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Active
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-gray-600">
                                                <XCircle className="w-3 h-3 mr-1" />
                                                Inactive
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-sm text-gray-500">
                                        {format(new Date(user.createdAt), 'PP')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => setEditingUser(user)}>
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Change Role
                                                </DropdownMenuItem>
                                                {!user.isCurrentUser && (
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            if (confirm(`Remove ${user.name || user.email} from the team?`)) {
                                                                removeMutation.mutate(user._id);
                                                            }
                                                        }}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Remove
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Card>

            {/* Invite Dialog */}
            <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Invite Team Member</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Email Address</Label>
                            <Input
                                type="email"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder="colleague@example.com"
                            />
                        </div>
                        <div>
                            <Label>Role</Label>
                            <Select value={inviteRole} onValueChange={setInviteRole}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ROLES.map((role) => (
                                        <SelectItem key={role.value} value={role.value}>
                                            <div>
                                                <div className="font-medium">{role.label}</div>
                                                <div className="text-xs text-gray-500">{role.description}</div>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleInvite} disabled={inviteMutation.isPending}>
                            {inviteMutation.isPending ? 'Sending...' : 'Send Invitation'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Role Dialog */}
            <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change User Role</DialogTitle>
                    </DialogHeader>
                    {editingUser && (
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <div className="font-medium">{editingUser.name || editingUser.email}</div>
                                <div className="text-sm text-gray-500">{editingUser.email}</div>
                            </div>
                            <div>
                                <Label>New Role</Label>
                                <Select
                                    defaultValue={editingUser.role}
                                    onValueChange={(role) => {
                                        updateRoleMutation.mutate({ userId: editingUser._id, role });
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ROLES.map((role) => (
                                            <SelectItem key={role.value} value={role.value}>
                                                <div>
                                                    <div className="font-medium">{role.label}</div>
                                                    <div className="text-xs text-gray-500">{role.description}</div>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingUser(null)}>
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
