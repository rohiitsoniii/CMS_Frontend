import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Archive, 
  RotateCcw, 
  Trash2, 
  Search, 
  Clock,
  FileText,
  Layout,
  AlertCircle
} from 'lucide-react';
import { archiveAPI } from '@/services/api';
import { ArchiveSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export const ArchivePage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteContentId, setDeleteContentId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (projectId) {
      fetchArchive();
    }
  }, [projectId]);

  const fetchArchive = async () => {
    try {
      setLoading(true);
      const response = await archiveAPI.getArchive(projectId!);
      const data = response.data?.data || (Array.isArray(response.data) ? response.data : []);
      setItems(data);
    } catch (error) {
      console.error('Failed to fetch archive:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (contentId: string) => {
    try {
      const response = await archiveAPI.restore(contentId);
      if (response.data.success) {
        setItems(items.filter(item => item._id !== contentId));
        toast({
          title: "Content Restored",
          description: "The entry has been moved back to the active content list.",
        });
      }
    } catch {
      toast({
        title: "Restore Failed",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteContentId) return;
    try {
      setItems(items.filter(item => item._id !== deleteContentId));
      toast({ title: "Permanently Deleted" });
    } catch {
      toast({ title: "Delete Failed", variant: "destructive" });
    } finally {
      setDeleteContentId(null);
    }
  };

  const filteredItems = items.filter(item => 
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="border-b pb-5 dark:border-gray-800">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5">
          <Archive className="w-6 h-6 text-primary" />
          Archive
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          View and restore content entries that were archived to keep your workspace clean.
        </p>
      </div>

      <Card className="border border-border bg-card">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-base font-semibold flex items-center text-card-foreground">
              <Archive className="w-4 h-4 mr-2 text-primary" />
              Archived Entries ({filteredItems.length})
            </CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search archive..." 
                className="pl-9 h-9 w-full bg-background" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <ArchiveSkeleton />
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-border rounded-xl flex flex-col items-center">
               <div className="bg-muted p-4 rounded-full mb-3">
                  <Layout className="w-10 h-10 text-muted-foreground" />
               </div>
               <p className="font-semibold text-gray-900 dark:text-white">Archive is empty</p>
               <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                  When you archive content from the list, it will appear here for temporary storage or permanent deletion.
               </p>
            </div>
          ) : (
            <div className="border border-border rounded-xl overflow-x-auto bg-card">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground font-medium">
                  <tr>
                    <th className="px-6 py-3.5">Entry Name</th>
                    <th className="px-6 py-3.5">Type</th>
                    <th className="px-6 py-3.5">Archived On</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredItems.map((item) => (
                    <tr key={item._id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg text-primary">
                             <FileText className="w-4 h-4" />
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-white">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 capitalize text-muted-foreground font-medium">
                        {item.type}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground/70" />
                          <span>{format(new Date(item.updatedAt || item.createdAt), 'MMM d, yyyy')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="text-xs font-medium">Archived</Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleRestore(item._id)}
                            className="text-primary hover:text-primary hover:bg-primary/10 font-medium"
                          >
                            <RotateCcw className="w-4 h-4 mr-1.5" /> Restore
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setDeleteContentId(item._id)}
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            aria-label="Delete Permanently"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="p-4 border-l-4 border-primary bg-primary/5 rounded-r-xl flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-foreground text-sm">About Archiving</h4>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Archiving content removes it from your active list and public API delivery but preserves all version history and metadata. 
            Restoring an entry will immediately re-enable it for editing and publication.
          </p>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteContentId}
        onOpenChange={(open) => !open && setDeleteContentId(null)}
        title="Permanently Delete"
        description="Are you sure you want to permanently delete this archived item? This cannot be undone."
        confirmText="Delete Permanently"
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default ArchivePage;
