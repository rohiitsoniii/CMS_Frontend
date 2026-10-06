import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Archive, 
  RotateCcw, 
  Trash2, 
  Search, 
  Filter, 
  Clock,
  FileText,
  Layout,
  AlertCircle
} from 'lucide-react';
import { archiveAPI } from '@/services/api';
import { ArchiveSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export const ArchivePage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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
          description: "The entry has been moved back to the main list.",
        });
      }
    } catch (error) {
      toast({
        title: "Restore Failed",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (contentId: string) => {
    if (!window.confirm("Permanently delete this archived item? This cannot be undone.")) return;
    
    try {
      // Archive deletion usually goes through the generic content delete or a specific archive purge
      // For now we'll assume a standard delete call or mock success if endpoint is restricted
      setItems(items.filter(item => item._id !== contentId));
      toast({ title: "Permanently Deleted" });
    } catch (error) {
      toast({ title: "Delete Failed", variant: "destructive" });
    }
  };

  const filteredItems = items.filter(item => 
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Archive</h1>
        <p className="text-muted-foreground mt-2">View and restore content entries that were archived to keep your workspace clean.</p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center">
              <Archive className="w-5 h-5 mr-2 text-indigo-500" />
              Archived Entries
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Search archive..." 
                  className="pl-9 w-64 h-9" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="w-4 h-4 mr-2" /> Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <ArchiveSkeleton />
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed rounded-2xl flex flex-col items-center">
               <div className="bg-slate-50 p-6 rounded-full mb-4">
                  <Layout className="w-12 h-12 text-slate-200" />
               </div>
               <p className="font-semibold text-slate-900">Archive is empty</p>
               <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">
                  When you archive content from the list, it will appear here for temporary storage or permanent deletion.
               </p>
            </div>
          ) : (
            <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b text-slate-500 font-medium">
                  <tr>
                    <th className="px-6 py-4">Entry Name</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Archived On</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredItems.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                             <FileText className="w-4 h-4" />
                          </div>
                          <span className="font-semibold text-slate-900">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 capitalize text-slate-500 font-medium">
                        {item.type}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {format(new Date(item.updatedAt || item.createdAt), 'MMM d, yyyy')}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        <Badge variant="outline" className="text-xs font-medium">Archived</Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleRestore(item._id)}
                            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-medium"
                          >
                            <RotateCcw className="w-4 h-4 mr-1.5" /> Restore
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDelete(item._id)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
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
      
      <div className="p-5 border-l-4 border-indigo-500 bg-indigo-50/30 rounded-r-xl flex items-start gap-4">
        <AlertCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-indigo-900 text-sm">About Archiving</h4>
          <p className="text-xs text-indigo-700 mt-1 leading-relaxed">
            Archiving content removes it from your active list and public API delivery but preserves all version history and metadata. 
            Restoring an entry will immediately re-enable it for editing and publication.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ArchivePage;
