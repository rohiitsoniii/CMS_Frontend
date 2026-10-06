import React, { useState } from 'react';
import { ShieldCheck, Download, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export const PrivacyPage: React.FC = () => {
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const requestExport = async () => {
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const res = await fetch('/api/v1/privacy/export', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(data.message);
      } else {
        setError('Failed to request export');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const requestDeletion = async () => {
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const res = await fetch('/api/v1/privacy/delete', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(data.message);
      } else {
        setError('Failed to trigger deletion');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 space-y-6">
      <div className="border-b pb-5 dark:border-gray-800">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5">
          <ShieldCheck className="w-6 h-6 text-primary" />
          Data Privacy Center (GDPR Toolkit)
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your personal data rights, exports, and account privacy preferences.
        </p>
      </div>
      
      <Card className="border border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
            <Download className="w-4 h-4 text-primary" />
            Right to Access
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Request a comprehensive archive of all personal data and profile records stored across our systems.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={requestExport}
            disabled={loading}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Request Data Export
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/30 bg-destructive/5 dark:bg-destructive/10">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-4 h-4" />
            Right to be Forgotten
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Permanently delete your account and all associated personal data. 
            This action will immediately restrict access and permanently erase your data upon the next deletion cycle.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="destructive"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={loading}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Irreversibly Delete Account
          </Button>
        </CardContent>
      </Card>

      {success && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-800 text-sm">
          {success}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-800 text-sm">
          {error}
        </div>
      )}

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Account and Data"
        description="Are you ABSOLUTELY sure? This will delete your entire account and all associated data within 30 days. This action cannot be undone."
        confirmText="Yes, Delete My Account"
        variant="destructive"
        onConfirm={requestDeletion}
      />
    </div>
  );
};

export default PrivacyPage;
