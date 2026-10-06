import React, { useState } from 'react';
import { 
  Building2, Search, Filter, ShieldAlert, CheckCircle, 
  ExternalLink, Ban, RotateCcw, Plus, HardDrive, Zap 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from 'react-hot-toast';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'suspended';
  projectsCount: number;
  storageUsedGb: number;
  storageLimitGb: number;
  apiRequestsToday: number;
  apiLimit: number;
  createdAt: string;
}

export const TenantManagementPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [suspendTarget, setSuspendTarget] = useState<Tenant | null>(null);

  const [tenants, setTenants] = useState<Tenant[]>([
    {
      id: 'ten_1',
      name: 'Acme Corporation',
      slug: 'acme-corp',
      plan: 'enterprise',
      status: 'active',
      projectsCount: 8,
      storageUsedGb: 14.2,
      storageLimitGb: 100,
      apiRequestsToday: 182400,
      apiLimit: 1000000,
      createdAt: '2026-01-15'
    },
    {
      id: 'ten_2',
      name: 'Pixel Perfect Studios',
      slug: 'pixel-studios',
      plan: 'pro',
      status: 'active',
      projectsCount: 3,
      storageUsedGb: 8.4,
      storageLimitGb: 25,
      apiRequestsToday: 42100,
      apiLimit: 250000,
      createdAt: '2026-03-22'
    },
    {
      id: 'ten_3',
      name: 'NextGen Retail Inc.',
      slug: 'nextgen-retail',
      plan: 'pro',
      status: 'active',
      projectsCount: 2,
      storageUsedGb: 3.1,
      storageLimitGb: 25,
      apiRequestsToday: 19400,
      apiLimit: 250000,
      createdAt: '2026-05-10'
    },
    {
      id: 'ten_4',
      name: 'Indie Creator Collective',
      slug: 'indie-collective',
      plan: 'free',
      status: 'active',
      projectsCount: 1,
      storageUsedGb: 0.8,
      storageLimitGb: 2,
      apiRequestsToday: 1200,
      apiLimit: 10000,
      createdAt: '2026-07-04'
    },
    {
      id: 'ten_5',
      name: 'Spammy Botnet Labs',
      slug: 'spam-bot-demo',
      plan: 'free',
      status: 'suspended',
      projectsCount: 1,
      storageUsedGb: 1.9,
      storageLimitGb: 2,
      apiRequestsToday: 9940,
      apiLimit: 10000,
      createdAt: '2026-09-12'
    }
  ]);

  const handleToggleSuspend = () => {
    if (!suspendTarget) return;
    const nextStatus = suspendTarget.status === 'active' ? 'suspended' : 'active';
    setTenants(prev => prev.map(t => t.id === suspendTarget.id ? { ...t, status: nextStatus } : t));
    toast.success(`Tenant ${suspendTarget.name} has been ${nextStatus}.`);
    setSuspendTarget(null);
  };

  const filteredTenants = tenants.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.slug.toLowerCase().includes(search.toLowerCase());
    const matchesPlan = planFilter === 'all' || t.plan === planFilter;
    return matchesSearch && matchesPlan;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-primary" />
            Tenant & Organization Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Global multi-tenant governance, plan subscription enforcement, and bandwidth/storage quota meters.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search tenants by name or slug..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="text-xs border border-border rounded-lg bg-background px-3 py-2 text-foreground focus:ring-1 focus:ring-primary focus:outline-none w-full sm:w-44"
        >
          <option value="all">All Plans</option>
          <option value="enterprise">Enterprise</option>
          <option value="pro">Pro</option>
          <option value="free">Free</option>
        </select>
      </div>

      {/* Tenants Table */}
      <Card className="border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-medium text-xs">
              <tr>
                <th className="px-6 py-3.5">Tenant Organization</th>
                <th className="px-6 py-3.5">Plan</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Storage Quota</th>
                <th className="px-6 py-3.5">API Quota (Today)</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTenants.map((t) => {
                const storagePercent = Math.round((t.storageUsedGb / t.storageLimitGb) * 100);
                const apiPercent = Math.round((t.apiRequestsToday / t.apiLimit) * 100);
                return (
                  <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-foreground text-sm">{t.name}</div>
                        <div className="text-xs text-muted-foreground font-mono">/{t.slug} • {t.projectsCount} projects</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge 
                        variant="outline" 
                        className={`text-xs uppercase font-semibold ${
                          t.plan === 'enterprise' ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' :
                          t.plan === 'pro' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' :
                          'bg-muted text-muted-foreground'
                        }`}
                      >
                        {t.plan}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge 
                        variant="outline"
                        className={`text-xs capitalize ${
                          t.status === 'active' 
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-destructive/10 text-destructive border-destructive/30'
                        }`}
                      >
                        {t.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-36 space-y-1">
                        <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                          <span>{t.storageUsedGb} GB</span>
                          <span>{t.storageLimitGb} GB</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-1.5 rounded-full ${storagePercent > 85 ? 'bg-destructive' : 'bg-primary'}`}
                            style={{ width: `${storagePercent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-36 space-y-1">
                        <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                          <span>{(t.apiRequestsToday / 1000).toFixed(1)}k</span>
                          <span>{(t.apiLimit / 1000).toFixed(0)}k</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-1.5 rounded-full ${apiPercent > 85 ? 'bg-destructive' : 'bg-emerald-500'}`}
                            style={{ width: `${apiPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        size="sm"
                        variant={t.status === 'active' ? 'ghost' : 'outline'}
                        onClick={() => setSuspendTarget(t)}
                        className={`h-8 text-xs ${t.status === 'active' ? 'text-destructive hover:bg-destructive/10' : 'text-emerald-600'}`}
                      >
                        {t.status === 'active' ? (
                          <>
                            <Ban className="w-3.5 h-3.5 mr-1" /> Suspend
                          </>
                        ) : (
                          <>
                            <RotateCcw className="w-3.5 h-3.5 mr-1" /> Activate
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <ConfirmDialog
        open={!!suspendTarget}
        onOpenChange={(open) => !open && setSuspendTarget(null)}
        title={suspendTarget?.status === 'active' ? 'Suspend Tenant Organization' : 'Reactivate Tenant Organization'}
        description={`Are you sure you want to ${suspendTarget?.status === 'active' ? 'suspend' : 'reactivate'} tenant "${suspendTarget?.name}"? ${suspendTarget?.status === 'active' ? 'All associated project public APIs and admin logins will be immediately halted.' : 'Services will resume normal operations.'}`}
        confirmText={suspendTarget?.status === 'active' ? 'Suspend Tenant' : 'Activate Tenant'}
        variant={suspendTarget?.status === 'active' ? 'destructive' : 'default'}
        onConfirm={handleToggleSuspend}
      />
    </div>
  );
};

export default TenantManagementPage;
