import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, UserX, RefreshCw } from 'lucide-react';
import { teamService, ITeamMember } from '../../services/teamService';
import { roleService, IRole } from '../../services/roleService';
import { toast } from 'react-hot-toast';
import { TeamListSkeleton } from '@/components/skeletons';

export const TeamPage: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const [members, setMembers] = useState<ITeamMember[]>([]);
    const [roles, setRoles] = useState<IRole[]>([]);
    const [loading, setLoading] = useState(true);
    const [showInviteModal, setShowInviteModal] = useState(false);
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
            if (rolesData.length > 0) {
                setInviteData(prev => ({ ...prev, roleId: rolesData[0]._id }));
            }
        } catch (error) {
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
        } catch (error) {
            toast.error('Failed to send invitation');
        }
    };

    const handleRemove = async (member: ITeamMember) => {
        if (!confirm(`Remove ${member.name} from the team?`)) return;
        try {
            await teamService.removeMember(member._id);
            toast.success('Member removed successfully');
            loadData();
        } catch (error) {
            toast.error('Failed to remove member');
        }
    };

    const handleResendInvite = async (member: ITeamMember) => {
        try {
            await teamService.resendInvitation(member._id);
            toast.success('Invitation resent successfully');
        } catch (error) {
            toast.error('Failed to resend invitation');
        }
    };

    const handleRoleChange = async (member: ITeamMember, newRoleId: string) => {
        try {
            await teamService.changeRole(member._id, newRoleId);
            toast.success('Role updated successfully');
            loadData();
        } catch (error) {
            toast.error('Failed to update role');
        }
    };

    if (loading) return <TeamListSkeleton />;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">Team Members</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage your team and their roles</p>
                </div>
                <button
                    onClick={() => setShowInviteModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Invite Member
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Member</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined</th>
                            <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {members.map(member => (
                            <tr key={member._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 flex-shrink-0">
                                            {member.userId?.avatar ? (
                                                <img className="h-10 w-10 rounded-full" src={member.userId.avatar} alt="" />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold">
                                                    {member.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{member.name}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{member.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <select
                                        value={(member.roleId as any)._id || member.roleId}
                                        onChange={(e) => handleRoleChange(member, e.target.value)}
                                        className="text-sm border-gray-300 dark:border-gray-600 rounded-md bg-transparent dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        {roles.map(role => (
                                            <option key={role._id} value={role._id}>{role.name}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${member.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                            member.status === 'invited' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                                        {member.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(member.invitedAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right text-sm font-medium">
                                    <div className="flex items-center justify-end gap-2">
                                        {member.status === 'invited' && (
                                            <button
                                                onClick={() => handleResendInvite(member)}
                                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                title="Resend Invitation"
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleRemove(member)}
                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                            title="Remove Member"
                                        >
                                            <UserX className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
                        <h2 className="text-xl font-bold mb-4 dark:text-white">Invite Team Member</h2>
                        <form onSubmit={handleInvite} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={inviteData.name}
                                    onChange={e => setInviteData({ ...inviteData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent dark:text-white"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={inviteData.email}
                                    onChange={e => setInviteData({ ...inviteData, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent dark:text-white"
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Role
                                </label>
                                <select
                                    required
                                    value={inviteData.roleId}
                                    onChange={e => setInviteData({ ...inviteData, roleId: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent dark:text-white"
                                >
                                    {roles.map(role => (
                                        <option key={role._id} value={role._id}>{role.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowInviteModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Send Invite
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
