import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Edit2, Trash2, Copy, Shield, Check } from 'lucide-react';
import { roleService, IRole, IRolePermissions } from '../../services/roleService';
import { RoleManagementSkeleton } from '@/components/skeletons';
import { toast } from 'react-hot-toast';

export const RolesPage: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const [roles, setRoles] = useState<IRole[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedRole, setSelectedRole] = useState<IRole | null>(null);
    const [editedRole, setEditedRole] = useState<Partial<IRole>>({
        name: '',
        description: '',
        permissions: {} as IRolePermissions
    });

    useEffect(() => {
        loadRoles();
    }, [projectId]);

    const loadRoles = async () => {
        if (!projectId) return;
        try {
            const data = await roleService.getRoles(projectId);
            setRoles(data);
        } catch (error) {
            toast.error('Failed to load roles');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedRole(null);
        setEditedRole({
            name: '',
            description: '',
            permissions: getDefaultPermissions(),
            projectId
        });
        setIsEditing(true);
    };

    const handleEdit = (role: IRole) => {
        setSelectedRole(role);
        setEditedRole({ ...role });
        setIsEditing(true);
    };

    const handleClone = async (role: IRole) => {
        if (!confirm(`Clone role "${role.name}"?`)) return;
        try {
            await roleService.cloneRole(role._id, `${role.name} (Copy)`);
            toast.success('Role cloned successfully');
            loadRoles();
        } catch (error) {
            toast.error('Failed to clone role');
        }
    };

    const handleDelete = async (role: IRole) => {
        if (role.isSystemRole) return;
        if (!confirm(`Delete role "${role.name}"? This cannot be undone.`)) return;
        try {
            await roleService.deleteRole(role._id);
            toast.success('Role deleted successfully');
            loadRoles();
        } catch (error) {
            toast.error('Failed to delete role');
        }
    };

    const handleSave = async () => {
        try {
            if (selectedRole) {
                await roleService.updateRole(selectedRole._id, editedRole);
                toast.success('Role updated successfully');
            } else {
                await roleService.createRole(editedRole);
                toast.success('Role created successfully');
            }
            setIsEditing(false);
            loadRoles();
        } catch (error) {
            toast.error('Failed to save role');
        }
    };

    const getDefaultPermissions = (): IRolePermissions => {
        const resources = [
            'content', 'contentTypes', 'media', 'workflows', 'schedules',
            'locales', 'versions', 'team', 'roles', 'endUsers',
            'emailTemplates', 'supportTickets', 'emailCampaigns',
            'settings', 'analytics', 'project'
        ];

        const perms: any = { custom: {} };
        resources.forEach(res => {
            perms[res] = { create: false, read: false, update: false, delete: false };
            if (res === 'content') perms[res] = { ...perms[res], publish: false, unpublish: false, archive: false };
            // Add other specific actions as needed
        });
        return perms;
    };

    const TogglePermission = ({ resource, action, value }: { resource: string, action: string, value: boolean }) => (
        <button
            onClick={() => {
                const newPerms = { ...editedRole.permissions } as any;
                if (!newPerms[resource]) newPerms[resource] = {};
                newPerms[resource][action] = !value;
                setEditedRole({ ...editedRole, permissions: newPerms });
            }}
            className={`w-12 h-6 rounded-full transition-colors relative ${value ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
        >
            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${value ? 'left-7' : 'left-1'}`} />
        </button>
    );

    if (loading) return <RoleManagementSkeleton />;

    if (isEditing) {
        return (
            <div className="p-8 max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold dark:text-white">
                        {selectedRole ? 'Edit Role' : 'Create Role'}
                    </h1>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Save Role
                        </button>
                    </div>
                </div>

                <div className="grid gap-6">
                    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="grid gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Role Name
                                </label>
                                <input
                                    type="text"
                                    value={editedRole.name}
                                    onChange={e => setEditedRole({ ...editedRole, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent dark:text-white"
                                    placeholder="e.g. Content Editor"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={editedRole.description}
                                    onChange={e => setEditedRole({ ...editedRole, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent dark:text-white"
                                    placeholder="What can this role do?"
                                    rows={2}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold mb-4 dark:text-white">Permissions</h3>
                        <div className="space-y-6">
                            {Object.entries(editedRole.permissions || {}).map(([resource, actions]: [string, any]) => (
                                resource !== 'custom' && (
                                    <div key={resource} className="border-b border-gray-100 dark:border-gray-700 pb-4 last:border-0">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                                                {resource.replace(/([A-Z])/g, ' $1').trim()}
                                            </h4>
                                            <button
                                                onClick={() => {
                                                    const allTrue = Object.values(actions).every(v => v === true);
                                                    const newActions = Object.keys(actions).reduce((acc, key) => ({ ...acc, [key]: !allTrue }), {});
                                                    const newPerms = { ...editedRole.permissions, [resource]: newActions } as any;
                                                    setEditedRole({ ...editedRole, permissions: newPerms });
                                                }}
                                                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                            >
                                                Toggle All
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {Object.entries(actions).map(([action, value]: [string, any]) => (
                                                <div key={action} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                                                        {action}
                                                    </span>
                                                    <TogglePermission
                                                        resource={resource}
                                                        action={action}
                                                        value={value}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">Roles & Permissions</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage access control for your team</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Create Role
                </button>
            </div>

            <div className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {roles.map(role => (
                        <div
                            key={role._id}
                            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <div className="flex gap-2">
                                    {role.isSystemRole ? (
                                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-500 dark:text-gray-400 rounded">
                                            System
                                        </span>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleEdit(role)}
                                                className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(role)}
                                                className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => handleClone(role)}
                                        className="p-1 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400"
                                        title="Clone Role"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <h3 className="font-semibold text-lg dark:text-white mb-2">{role.name}</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                                {role.description}
                            </p>
                            <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-700 pt-4">
                                <span>Updated {new Date(role.updatedAt).toLocaleDateString()}</span>
                                {!role.isSystemRole && (
                                    <span className="flex items-center gap-1">
                                        <Check className="w-3 h-3 text-green-500" />
                                        Custom
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
