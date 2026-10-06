import { useState, useEffect } from 'react';
import { Globe, Plus, CheckCircle2, AlertCircle, Trash2, ShieldCheck, RefreshCw, Star } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { domainAPI } from '@/services/api';
import toast from 'react-hot-toast';

interface DomainRecord {
  id?: string;
  _id?: string;
  domain: string;
  isVerified?: boolean;
  verified?: boolean;
  isActive?: boolean;
  active?: boolean;
  isPrimary?: boolean;
  primary?: boolean;
  sslStatus?: 'active' | 'pending' | 'failed';
  createdAt?: string;
}

interface DomainSettingsCardProps {
  projectId?: string;
}

export function DomainSettingsCard({ projectId }: DomainSettingsCardProps) {
  const [domains, setDomains] = useState<DomainRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newDomain, setNewDomain] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DomainRecord | null>(null);

  const fetchDomains = async () => {
    setIsLoading(true);
    try {
      const res = await domainAPI.getAll(projectId);
      const list = res.data?.data || res.data || [];
      setDomains(Array.isArray(list) ? list : []);
    } catch (error) {
      console.warn('Could not fetch domains, initializing empty list');
      setDomains([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, [projectId]);

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;

    setIsSubmitting(true);
    try {
      await domainAPI.add(newDomain.trim().toLowerCase(), projectId);
      toast.success('Custom domain added. Please configure DNS records.');
      setNewDomain('');
      fetchDomains();
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Failed to add domain');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (domainId: string) => {
    try {
      await domainAPI.verify(domainId);
      toast.success('DNS verification checked successfully');
      fetchDomains();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'DNS verification incomplete. Please allow time for DNS propagation.');
    }
  };

  const handleSetPrimary = async (domainId: string) => {
    try {
      await domainAPI.setPrimary(domainId);
      toast.success('Set as primary delivery domain');
      fetchDomains();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to set primary domain');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const domainId = deleteTarget._id || deleteTarget.id || '';
    try {
      await domainAPI.delete(domainId, projectId);
      toast.success('Domain removed');
      setDomains(prev => prev.filter(d => (d._id || d.id) !== domainId));
    } catch (error: any) {
      toast.error('Failed to remove domain');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <Card className="border border-slate-200 dark:border-slate-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Custom Domains</CardTitle>
              <CardDescription>
                Map custom domains and subdomains to deliver content via CDN
              </CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchDomains} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add domain form */}
        <form onSubmit={handleAddDomain} className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="domain-input" className="sr-only">Domain Name</Label>
            <Input
              id="domain-input"
              placeholder="e.g. content.mybrand.com"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              className="bg-white dark:bg-slate-900"
            />
          </div>
          <Button
            type="submit"
            disabled={isSubmitting || !newDomain.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Domain
          </Button>
        </form>

        {/* DNS Configuration Helper Banner */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
          <p className="font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> DNS Configuration Required:
          </p>
          <p>
            Create a <code className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[11px]">CNAME</code> record pointing your host to <code className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[11px]">cname.headlesscms.cloud</code> with automatic SSL certificate issuance.
          </p>
        </div>

        {/* Domains List */}
        <div className="space-y-3">
          {domains.length === 0 ? (
            <div className="text-center py-8 border border-dashed rounded-xl dark:border-slate-800">
              <Globe className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No custom domains connected</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Add your own domain above to serve published content from your brand URL.
              </p>
            </div>
          ) : (
            domains.map((item) => {
              const domId = item._id || item.id || item.domain;
              const isVerified = item.isVerified || item.verified;
              const isPrimary = item.isPrimary || item.primary;

              return (
                <div
                  key={domId}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Globe className="w-5 h-5 text-indigo-500 shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                          {item.domain}
                        </span>
                        {isPrimary && (
                          <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            Primary
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {isVerified ? (
                          <span className="inline-flex items-center text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Verified & SSL Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[11px] font-medium text-amber-600 dark:text-amber-400">
                            <AlertCircle className="w-3 h-3 mr-1" /> Pending Verification
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!isVerified && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleVerify(domId)}
                        className="text-xs h-8"
                      >
                        Verify DNS
                      </Button>
                    )}

                    {!isPrimary && isVerified && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSetPrimary(domId)}
                        className="text-xs h-8 text-slate-600 dark:text-slate-400 hover:text-amber-600"
                        title="Set as Primary"
                      >
                        <Star className="w-3.5 h-3.5 mr-1" /> Set Primary
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteTarget(item)}
                      className="text-xs h-8 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Remove Custom Domain?"
        description={`Are you sure you want to delete ${deleteTarget?.domain}? Content served through this domain will stop resolving immediately.`}
        confirmText="Remove Domain"
        onConfirm={confirmDelete}
      />
    </Card>
  );
}
