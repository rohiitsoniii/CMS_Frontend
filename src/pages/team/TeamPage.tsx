import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Users, UserX, RefreshCw } from 'lucide-react';
import { teamService, ITeamMember } from '../../services/teamService';
import { roleService, IRole } from '../../services/roleService';
import { TeamListSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from 'react-hot-toast';

export const TeamPage: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const [members, setMembers] = useState<ITeMemberWithUser[]>([]);
    const [roles, setRoles] = useState<IRole[]>([]);
    const [loading, setLoading] = useState(true);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [removeMember, setRemoveMember] = useState<ITeamMember | null>(null);

    const [inviteData, setInviteData] = useState({
        email: '',
        name: '',
        roleId: ''
    });

    useEffect(() => {
        loadData();
    }, [projectId]);

    const loadData = async () => {
        if (!projectId) return;
        try {
            const [membersData, rolesData] = await Promise.all([
                teamService.getMembers(projectId),
                roleService.getRoles(projectId)
            ]);
            setMembers(membersData);
            setRoles(rolesData);
            if (rolesData.length > 0 && !inviteData.roleId) {
                setInviteData(prev => ({ ...prev, roleId: rolesData[0]._id }));
            }
        } catch {
            toast.error('Failed to load team data');
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectId) return;
        try {
            await teamService.inviteMember(projectId, inviteData.email, inviteData.name, inviteData.roleId);
            toast.success('Invitation sent successfully');
            setShowInviteModal(false);
            setInviteData({ email: '', name: '', roleId: roles[0]?._id || '' });
            loadData();
        } catch {
            toast.error('Failed to send invitation');
        }
    };

    const handleConfirmRemove = async () => {
        if (!removeMember) return;
        try {
            await teamService.removeMember(removeMember._id);
            toast.success('Member removed successfully');
            loadData();
        } catch {
            toast.error('Failed to remove member');
        } finally {
            setRemoveMember(null);
        }
    };

    const handleResendInvite = async (member: ITeamMember) => {
        try {
            await teamService.resendInvitation(member._id);
            toast.success('Invitation resent successfully');
        } catch {
            toast.error('Failed to resend invitation');
        }
    };

    const handleRoleChange = async (member: ITeamMember, newRoleId: string) => {
        try {
            await teamService.changeRole(member._id, newRoleId);
            toast.success('Role updated successfully');
            loadData();
        } catch {
            toast.error('Failed to update role');
        }
    };

    if (loading) return <TeamListSkeleton />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5 dark:border-gray-800">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5">
                        <Users className="w-6 h-6 text-primary" />
                        Team Members
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">Manage project collaborators, invitations, and role assignments.</p>
                </div>
                <Button
                    onClick={() => setShowInviteModal(true)}
                    className="gap-2 shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    <span>Invite Member</span>
                </Button>
            </div>

            <Card className="border border-border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 border-b border-border text-muted-foreground font-medium">
                            <tr>
                                <th className="px-6 py-3.5">Member</th>
                                <th className="px-6 py-3.5">Role</th>
                                <th className="px-6 py-3.5">Status</th>
                                <th className="px-6 py-3.5">Joined</th>
                                <th className="px-6 py-3.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {members.map(member => (
                                <tr key={member._id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {member.userId?.avatar ? (
                                                <img className="h-9 w-9 rounded-full object-cover shrink-0" src={member.userId.avatar} alt="" />
                                            ) : (
                                                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                                                    {member.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <div className="font-semibold text-foreground text-sm truncate">{member.name}</div>
                                                <div className="text-xs text-muted-foreground truncate">{member.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={(member.roleId as any)?._id || member.roleId}
                                            onChange={(e) => handleRoleChange(member, e.target.value)}
                                            className="text-xs border border-border rounded-md bg-background px-2 py-1 text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                                        >
                                            {roles.map(role => (
                                                <option key={role._id} value={role._id}>{role.name}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge 
                                            variant="outline" 
                                            className={`text-xs capitalize ${
                                                member.status === 'active' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' :
                                                member.status === 'invited' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' :
                                                'bg-muted text-muted-foreground'
                                            }`}
                                        >
                                            {member.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-muted-foreground">
                                        {new Date(member.invitedAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            {member.status === 'invited' && (
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => handleResendInvite(member)}
                                                    className="h-8 w-8 text-primary hover:bg-primary/10"
                                                    title="Resend Invitation"
                                                    aria-label="Resend Invitation"
                                                >
                                                    <RefreshCw className="w-4 h-4" />
                                                </Button>
                                            )}
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => setRemoveMember(member)}
                                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                title="Remove Member"
                                                aria-label="Remove Member"
                                            >
                                                <UserX className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Radix Invite Modal */}
            <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Invite Team Member</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleInvite} className="space-y-4 pt-2">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-foreground">
                                Full Name
                            </label>
                            <Input
                                required
                                value={inviteData.name}
                                onChange={e => setInviteData({ ...inviteData, name: e.target.value })}
                                placeholder="John Doe"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-foreground">
                                Email Address
                            </label>
                            <Input
                                type="email"
                                required
                                value={inviteData.email}
                                onChange={e => setInviteData({ ...inviteData, email: e.target.value })}
                                placeholder="john@example.com"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-foreground">
                                Role
                            </label>
                            <select
                                required
                                value={inviteData.roleId}
                                onChange={e => setInviteData({ ...inviteData, roleId: e.target.value })}
                                className="w-full text-xs border border-border rounded-lg bg-background px-3 py-2 text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                            >
                                {roles.map(role => (
                                    <option key={role._id} value={role._id}>{role.name}</option>
                                ))}
                            </select>
                        </div>
                        <DialogFooter className="gap-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowInviteModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">
                                Send Invite
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={!!removeMember}
                onOpenChange={(open) => !open && setRemoveMember(null)}
                title="Remove Team Member"
                description={`Are you sure you want to remove ${removeMember?.name || 'this member'} from the team? They will immediately lose access to this project.`}
                confirmText="Remove Member"
                variant="destructive"
                onConfirm={handleConfirmRemove}
            />
        </div>
    );
};

// Internal interface helper for member with populated userId
type ITeMemberWithUser = ITeamMember & {
    userId?: { avatar?: string };
};

export default TeamPage;
