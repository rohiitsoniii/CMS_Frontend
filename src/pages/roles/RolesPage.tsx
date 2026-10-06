import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Shield, Plus, Edit2, Trash2, Copy, Check, ArrowLeft } from 'lucide-react';
import { roleService, IRole } from '../../services/roleService';
import { RoleManagementSkeleton } from '@/components/skeletons';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export const RolesPage: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const [roles, setRoles] = useState<IRole[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedRole, setSelectedRole] = useState<IRole | null>(null);
    const [cloneRoleTarget, setCloneRoleTarget] = useState<IRole | null>(null);
    const [deleteRoleTarget, setDeleteRoleTarget] = useState<IRole | null>(null);

    const [editedRole, setEditedRole] = useState<any>({
        name: '',
        description: '',
        permissions: {}
    });

    useEffect(() => {
        loadRoles();
    }, [projectId]);

    const loadRoles = async () => {
        if (!projectId) return;
        try {
            const data = await roleService.getRoles(projectId);
            setRoles(data);
        } catch {
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

    const handleConfirmClone = async () => {
        if (!cloneRoleTarget) return;
        try {
            await roleService.cloneRole(cloneRoleTarget._id, `${cloneRoleTarget.name} (Copy)`);
            toast.success('Role cloned successfully');
            loadRoles();
        } catch {
            toast.error('Failed to clone role');
        } finally {
            setCloneRoleTarget(null);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteRoleTarget || deleteRoleTarget.isSystemRole) return;
        try {
            await roleService.deleteRole(deleteRoleTarget._id);
            toast.success('Role deleted successfully');
            loadRoles();
        } catch {
            toast.error('Failed to delete role');
        } finally {
            setDeleteRoleTarget(null);
        }
    };

    const handleSave = async () => {
        try {
            if (selectedRole) {
                await roleService.updateRole(selectedRole._id, editedRole);
                toast.success('Role updated successfully');
            } else {
                await roleService.createRole({ ...editedRole, projectId } as any);
                toast.success('Role created successfully');
            }
            setIsEditing(false);
            loadRoles();
        } catch {
            toast.error('Failed to save role');
        }
    };

    const getDefaultPermissions = () => {
        const resources = ['content', 'media', 'schema', 'webhooks', 'settings'];
        const perms: any = { custom: {} };
        resources.forEach(res => {
            perms[res] = { create: false, read: false, update: false, delete: false };
            if (res === 'content') perms[res] = { ...perms[res], publish: false, unpublish: false, archive: false };
        });
        return perms;
    };

    const TogglePermission = ({ resource, action, value }: { resource: string, action: string, value: boolean }) => (
        <button
            type="button"
            onClick={() => {
                const newPerms = { ...editedRole.permissions } as any;
                if (!newPerms[resource]) newPerms[resource] = {};
                newPerms[resource][action] = !value;
                setEditedRole({ ...editedRole, permissions: newPerms });
            }}
            className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${value ? 'bg-primary' : 'bg-muted-foreground/30'}`}
            aria-label={`Toggle ${action} for ${resource}`}
        >
            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${value ? 'left-6' : 'left-1'}`} />
        </button>
    );

    if (loading) return <RoleManagementSkeleton />;

    if (isEditing) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsEditing(false)}
                            className="h-8 w-8"
                            aria-label="Back to roles"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            {selectedRole ? 'Edit Role' : 'Create Role'}
                        </h1>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsEditing(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                        >
                            Save Role
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6">
                    <Card className="p-6 border border-border bg-card">
                        <div className="grid gap-4">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-foreground">
                                    Role Name
                                </label>
                                <Input
                                    type="text"
                                    value={editedRole.name}
                                    onChange={e => setEditedRole({ ...editedRole, name: e.target.value })}
                                    placeholder="e.g. Content Editor"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-foreground">
                                    Description
                                </label>
                                <Textarea
                                    value={editedRole.description}
                                    onChange={e => setEditedRole({ ...editedRole, description: e.target.value })}
                                    placeholder="What capabilities and access scopes does this role possess?"
                                    rows={2}
                                    className="resize-none"
                                />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 border border-border bg-card">
                        <h3 className="text-base font-semibold mb-4 text-foreground">Permissions Matrix</h3>
                        <div className="space-y-6">
                            {Object.entries(editedRole.permissions || {}).map(([resource, actions]: [string, any]) => (
                                resource !== 'custom' && (
                                    <div key={resource} className="border-b border-border pb-5 last:border-0 last:pb-0">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-semibold text-sm text-foreground capitalize">
                                                {resource.replace(/([A-Z])/g, ' $1').trim()}
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const allTrue = Object.values(actions).every(v => v === true);
                                                    const newActions = Object.keys(actions).reduce((acc, key) => ({ ...acc, [key]: !allTrue }), {});
                                                    const newPerms = { ...editedRole.permissions, [resource]: newActions } as any;
                                                    setEditedRole({ ...editedRole, permissions: newPerms });
                                                }}
                                                className="text-xs text-primary hover:underline font-medium"
                                            >
                                                Toggle All
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {Object.entries(actions).map(([action, value]: [string, any]) => (
                                                <div key={action} className="flex items-center justify-between p-3 bg-muted/30 border border-border/50 rounded-lg">
                                                    <span className="text-xs text-foreground font-medium capitalize">
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
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5 dark:border-gray-800">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5">
                        <Shield className="w-6 h-6 text-primary" />
                        Roles & Permissions
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">Configure role-based access control policies for team members.</p>
                </div>
                <Button
                    onClick={handleCreate}
                    className="gap-2 shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    <span>Create Role</span>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map(role => (
                    <Card
                        key={role._id}
                        className="p-6 border border-border bg-card shadow-sm hover:shadow-md transition-shadow relative group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                                <Shield className="w-5 h-5" />
                            </div>
                            <div className="flex items-center gap-1">
                                {role.isSystemRole ? (
                                    <Badge variant="outline" className="text-xs font-medium">
                                        System
                                    </Badge>
                                ) : (
                                    <>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => handleEdit(role)}
                                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                            title="Edit Role"
                                            aria-label="Edit Role"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => setDeleteRoleTarget(role)}
                                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                            title="Delete Role"
                                            aria-label="Delete Role"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </>
                                )}
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => setCloneRoleTarget(role)}
                                    className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                                    title="Clone Role"
                                    aria-label="Clone Role"
                                >
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                        <h3 className="font-semibold text-base text-foreground mb-1">{role.name}</h3>
                        <p className="text-muted-foreground text-xs leading-relaxed mb-4 line-clamp-2 min-h-[32px]">
                            {role.description || 'No role description provided.'}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-4">
                            <span>Updated {new Date(role.updatedAt).toLocaleDateString()}</span>
                            {!role.isSystemRole && (
                                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                                    <Check className="w-3 h-3" />
                                    Custom
                                </span>
                            )}
                        </div>
                    </Card>
                ))}
            </div>

            <ConfirmDialog
                open={!!cloneRoleTarget}
                onOpenChange={(open) => !open && setCloneRoleTarget(null)}
                title="Clone Role"
                description={`Create a duplicate copy of role "${cloneRoleTarget?.name}" with identical permission configurations?`}
                confirmText="Clone Role"
                variant="default"
                onConfirm={handleConfirmClone}
            />

            <ConfirmDialog
                open={!!deleteRoleTarget}
                onOpenChange={(open) => !open && setDeleteRoleTarget(null)}
                title="Delete Role"
                description={`Delete role "${deleteRoleTarget?.name}"? Members assigned to this role must be reassigned.`}
                confirmText="Delete"
                variant="destructive"
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
};

export default RolesPage;
