import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Database, 
  Plus, 
  RotateCcw, 
  Trash2, 
  Download, 
  Clock, 
  ShieldCheck,
  AlertTriangle,
  FileArchive
} from 'lucide-react';
import { backupAPI } from '@/services/api';
import { BackupSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export const BackupPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [backups, setBackups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
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
    } catch (error) {
      toast({
        title: "Backup Failed",
        description: "There was an error creating the backup.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleRestore = async (backupId: string) => {
    if (!window.confirm("Are you sure you want to restore this backup? Current data will be overwritten.")) return;
    
    try {
      const response = await backupAPI.restore(backupId);
      if (response.data.success) {
        toast({
          title: "Restore Successful",
          description: "Project data has been restored from backup.",
        });
      }
    } catch (error) {
      toast({
        title: "Restore Failed",
        description: "There was an error restoring the data.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (backupId: string) => {
    if (!window.confirm("Delete this backup permanently?")) return;
    
    try {
      const response = await backupAPI.delete(backupId);
      if (response.data.success) {
        setBackups(backups.filter(b => b._id !== backupId));
        toast({
          title: "Backup Deleted",
        });
      }
    } catch (error) {
      toast({
        title: "Delete Failed",
        variant: "destructive",
      });
    }
  };

  if (loading) return <BackupSkeleton />;

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Backup & Restore</h1>
          <p className="text-muted-foreground mt-2">Manage project snapshots and system snapshots.</p>
        </div>
        <Button onClick={handleCreateBackup} disabled={creating} className="bg-indigo-600 hover:bg-indigo-700">
          {creating ? <Clock className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
          Create New Backup
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-green-50/50 border-green-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center text-green-700">
              <ShieldCheck className="w-4 h-4 mr-2" /> System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">Protected</div>
            <p className="text-xs text-green-600">Daily auto-backups are enabled</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center text-muted-foreground">
              <Database className="w-4 h-4 mr-2" /> Total Backups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{backups.length}</div>
            <p className="text-xs text-muted-foreground">Across all storage providers</p>
          </CardContent>
        </Card>

        <Card className="bg-amber-50/50 border-amber-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center text-amber-700">
              <AlertTriangle className="w-4 h-4 mr-2" /> Retention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-800">30 Days</div>
            <p className="text-xs text-amber-600">Backups older than 30 days are purged</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
          <CardDescription>A list of all project-level backups available for restoration.</CardDescription>
        </CardHeader>
        <CardContent>
          {backups.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <FileArchive className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground">No backups found. Create your first snapshot manually.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {backups.map((backup) => (
                <div key={backup._id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold">{backup.name || `Backup_${format(new Date(backup.createdAt), 'yyyyMMdd_HHmm')}`}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {format(new Date(backup.createdAt), 'PPP p')}
                        <span>•</span>
                        <span>{(backup.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={backup.status === 'completed' ? 'default' : 'secondary'}>
                      {backup.status}
                    </Badge>
                    <div className="flex border-l ml-2 pl-2 gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleRestore(backup._id)} className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                        <RotateCcw className="w-4 h-4 mr-1" /> Restore
                      </Button>
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-indigo-600">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(backup._id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
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
      
      <div className="bg-indigo-600 text-white rounded-2xl p-6 flex items-center justify-between bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-xl border border-white/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="font-bold text-lg text-white">Advanced Security Feature</div>
            <div className="text-white/80 text-sm">All backups are AES-256 encrypted at rest and validated before restoration.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupPage;
