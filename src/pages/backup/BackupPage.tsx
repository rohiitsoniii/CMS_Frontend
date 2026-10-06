import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Database, 
  Plus, 
  RotateCcw, 
  Trash2, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  FileArchive,
  RefreshCw
} from 'lucide-react';
import { backupAPI } from '@/services/api';
import { BackupSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export const BackupPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [backups, setBackups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoreBackupId, setRestoreBackupId] = useState<string | null>(null);
  const [deleteBackupId, setDeleteBackupId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (projectId) {
      fetchBackups();
    }
  }, [projectId]);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const response = await backupAPI.getAll(projectId!);
      if (response.data.success) {
        setBackups(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch backups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setCreating(true);
      const response = await backupAPI.create(projectId!);
      if (response.data.success) {
        toast({
          title: "Backup Created",
          description: "Your project backup has been successfully created.",
        });
        fetchBackups();
      }
    } catch {
      toast({
        title: "Backup Failed",
        description: "There was an error creating the backup.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleRestore = async () => {
    if (!restoreBackupId) return;
    try {
      const response = await backupAPI.restore(restoreBackupId);
      if (response.data.success) {
        toast({
          title: "Restore Successful",
          description: "Project data has been restored from backup.",
        });
      }
    } catch {
      toast({
        title: "Restore Failed",
        description: "There was an error restoring the data.",
        variant: "destructive",
      });
    } finally {
      setRestoreBackupId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteBackupId) return;
    try {
      const response = await backupAPI.delete(deleteBackupId);
      if (response.data.success) {
        setBackups(backups.filter(b => b._id !== deleteBackupId));
        toast({
          title: "Backup Deleted",
        });
      }
    } catch {
      toast({
        title: "Delete Failed",
        variant: "destructive",
      });
    } finally {
      setDeleteBackupId(null);
    }
  };

  if (loading) return <BackupSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5">
            <Database className="w-6 h-6 text-primary" />
            Backup & Restore
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage project snapshots and point-in-time recoveries.</p>
        </div>
        <Button onClick={handleCreateBackup} disabled={creating} className="shrink-0 gap-2">
          {creating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          <span>Create New Backup</span>
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
        <Card className="bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center text-emerald-800 dark:text-emerald-300">
              <ShieldCheck className="w-4 h-4 mr-2" /> System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-200">Protected</div>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">Daily auto-backups are active</p>
          </CardContent>
        </Card>
        
        <Card className="border border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center text-muted-foreground">
              <Database className="w-4 h-4 mr-2" /> Total Backups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{backups.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Stored across secure cloud targets</p>
          </CardContent>
        </Card>

        <Card className="bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-800/60 sm:col-span-2 md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 mr-2" /> Retention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900 dark:text-amber-200">30 Days</div>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">Snapshots older than 30 days are pruned</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">History</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">A list of all project-level backups available for restoration.</CardDescription>
        </CardHeader>
        <CardContent>
          {backups.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-border rounded-xl">
              <FileArchive className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">No backups found</p>
              <p className="text-xs text-muted-foreground mt-1">Create your first snapshot manually using the button above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {backups.map((backup) => (
                <div key={backup._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border rounded-xl hover:bg-muted/30 transition-colors gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-foreground">{backup.name || `Backup_${format(new Date(backup.createdAt), 'yyyyMMdd_HHmm')}`}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground/70" />
                        <span>{format(new Date(backup.createdAt), 'PPP p')}</span>
                        <span>•</span>
                        <span>{((backup.size || 0) / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-2.5">
                    <Badge variant={backup.status === 'completed' ? 'default' : 'secondary'} className="text-xs capitalize">
                      {backup.status}
                    </Badge>
                    <div className="flex items-center gap-1 border-l pl-2 dark:border-gray-800">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setRestoreBackupId(backup._id)} 
                        className="text-primary hover:text-primary hover:bg-primary/10 font-medium h-8"
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Restore
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setDeleteBackupId(backup._id)} 
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        aria-label="Delete Backup"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="bg-primary text-primary-foreground rounded-xl p-5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="bg-primary-foreground/15 p-2.5 rounded-lg shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold text-sm">Advanced Encryption Enabled</div>
            <div className="text-xs text-primary-foreground/80 mt-0.5">All backups are AES-256 encrypted at rest and validated before restoration.</div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!restoreBackupId}
        onOpenChange={(open) => !open && setRestoreBackupId(null)}
        title="Restore Backup"
        description="Are you sure you want to restore this backup? Current project data will be overwritten with the snapshot state."
        confirmText="Restore Now"
        variant="destructive"
        onConfirm={handleRestore}
      />

      <ConfirmDialog
        open={!!deleteBackupId}
        onOpenChange={(open) => !open && setDeleteBackupId(null)}
        title="Delete Backup"
        description="Permanently delete this backup archive? This action cannot be reversed."
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default BackupPage;
