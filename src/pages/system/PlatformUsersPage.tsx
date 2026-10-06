import React, { useState } from 'react';
import { 
  Users, Search, ShieldCheck, ShieldAlert, Key, 
  Ban, RotateCcw, Mail, Building 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from 'react-hot-toast';

interface PlatformUser {
  id: string;
  name: string;
  email: string;
  tenantName: string;
  role: 'superadmin' | 'tenant_admin' | 'editor' | 'viewer';
  status: 'active' | 'suspended';
  twoFactorEnabled: boolean;
  lastLogin: string;
}

export const PlatformUsersPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [actionUser, setActionUser] = useState<PlatformUser | null>(null);

  const [users, setUsers] = useState<PlatformUser[]>([
    {
      id: 'usr_1',
      name: 'System Root',
      email: 'admin@headless-cms.internal',
      tenantName: 'Global Platform',
      role: 'superadmin',
      status: 'active',
      twoFactorEnabled: true,
      lastLogin: 'Just now'
    },
    {
      id: 'usr_2',
      name: 'Alice Johnson',
      email: 'alice@acme.com',
      tenantName: 'Acme Corporation',
      role: 'tenant_admin',
      status: 'active',
      twoFactorEnabled: true,
      lastLogin: '2 hours ago'
    },
    {
      id: 'usr_3',
      name: 'Mark Henderson',
      email: 'mark@pixelstudios.design',
      tenantName: 'Pixel Perfect Studios',
      role: 'editor',
      status: 'active',
      twoFactorEnabled: false,
      lastLogin: '1 day ago'
    },
    {
      id: 'usr_4',
      name: 'Devin Lee',
      email: 'devin@nextgenretail.com',
      tenantName: 'NextGen Retail Inc.',
      role: 'editor',
      status: 'active',
      twoFactorEnabled: true,
      lastLogin: '3 days ago'
    },
    {
      id: 'usr_5',
      name: 'Suspicious Bot Account',
      email: 'crawler99@temp-mail.org',
      tenantName: 'Spammy Botnet Labs',
      role: 'viewer',
      status: 'suspended',
      twoFactorEnabled: false,
      lastLogin: '2 weeks ago'
    }
  ]);

  const handleToggleUserStatus = () => {
    if (!actionUser) return;
    const nextStatus = actionUser.status === 'active' ? 'suspended' : 'active';
    setUsers(prev => prev.map(u => u.id === actionUser.id ? { ...u, status: nextStatus } : u));
    toast.success(`User ${actionUser.email} has been ${nextStatus}.`);
    setActionUser(null);
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || 
      u.email.toLowerCase().includes(search.toLowerCase()) || 
      u.tenantName.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-primary" />
            Platform User Directory
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Global cross-tenant user oversight, security posture, 2FA status, and privilege assignments.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search by name, email, or tenant..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="text-xs border border-border rounded-lg bg-background px-3 py-2 text-foreground focus:ring-1 focus:ring-primary focus:outline-none w-full sm:w-44"
        >
          <option value="all">All Roles</option>
          <option value="superadmin">Super Admin</option>
          <option value="tenant_admin">Tenant Admin</option>
          <option value="editor">Editor</option>
          <option value="viewer">Viewer</option>
        </select>
      </div>

      <Card className="border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-medium text-xs">
              <tr>
                <th className="px-6 py-3.5">User</th>
                <th className="px-6 py-3.5">Tenant Organization</th>
                <th className="px-6 py-3.5">Global Role</th>
                <th className="px-6 py-3.5">2FA</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-foreground text-sm truncate">{u.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-foreground font-medium">
                    {u.tenantName}
                  </td>
                  <td className="px-6 py-4">
                    <Badge 
                      variant="outline"
                      className={`text-xs capitalize ${
                        u.role === 'superadmin' ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800' :
                        u.role === 'tenant_admin' ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' :
                        'bg-muted text-muted-foreground'
                      }`}
                    >
                      {u.role.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    {u.twoFactorEnabled ? (
                      <span className="text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-1 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5" /> Enforced
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs flex items-center gap-1">
                        Disabled
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Badge 
                      variant="outline"
                      className={`text-xs capitalize ${
                        u.status === 'active' 
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : 'bg-destructive/10 text-destructive border-destructive/30'
                      }`}
                    >
                      {u.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {u.role !== 'superadmin' && (
                      <Button
                        size="sm"
                        variant={u.status === 'active' ? 'ghost' : 'outline'}
                        onClick={() => setActionUser(u)}
                        className={`h-8 text-xs ${u.status === 'active' ? 'text-destructive hover:bg-destructive/10' : 'text-emerald-600'}`}
                      >
                        {u.status === 'active' ? (
                          <>
                            <Ban className="w-3.5 h-3.5 mr-1" /> Suspend
                          </>
                        ) : (
                          <>
                            <RotateCcw className="w-3.5 h-3.5 mr-1" /> Activate
                          </>
                        )}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <ConfirmDialog
        open={!!actionUser}
        onOpenChange={(open) => !open && setActionUser(null)}
        title={actionUser?.status === 'active' ? 'Suspend User Account' : 'Reactivate User Account'}
        description={`Are you sure you want to ${actionUser?.status === 'active' ? 'suspend' : 'reactivate'} user account ${actionUser?.email}? ${actionUser?.status === 'active' ? 'They will be immediately logged out and forbidden from making API requests.' : 'Their access privileges will be restored.'}`}
        confirmText={actionUser?.status === 'active' ? 'Suspend User' : 'Activate User'}
        variant={actionUser?.status === 'active' ? 'destructive' : 'default'}
        onConfirm={handleToggleUserStatus}
      />
    </div>
  );
};

export default PlatformUsersPage;
