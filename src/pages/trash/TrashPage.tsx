import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Trash2, RotateCcw, X, AlertTriangle, CheckSquare, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { trashAPI } from '@/services/api';
import { TrashSkeleton } from '@/components/skeletons';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatDistanceToNow } from 'date-fns';

interface TrashItem {
  _id: string;
  itemType: 'content' | 'media' | 'contentType';
  itemId: string;
  deletedBy: { name: string; email: string };
  deletedAt: string;
  purgeAt: string;
  metadata: {
    title?: string;
    contentTypeName?: string;
  };
}

export function TrashPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [items, setItems] = useState<TrashItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [showEmptyTrashConfirm, setShowEmptyTrashConfirm] = useState(false);

  useEffect(() => {
    loadTrashItems();
  }, [projectId]);

  const loadTrashItems = async () => {
    try {
      if (!projectId) return;
      const response = await trashAPI.getTrash(projectId);
      setItems(response.data.data?.[0]?.items || response.data.data || []);
    } catch {
      toast.error('Failed to load trash items');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (trashId: string) => {
    try {
      await trashAPI.restore(trashId);
      toast.success('Item restored successfully');
      loadTrashItems();
    } catch {
      toast.error('Failed to restore item');
    }
  };

  const handlePermanentDelete = async () => {
    if (!deleteItemId) return;
    try {
      await trashAPI.deletePermanently(deleteItemId);
      toast.success('Item permanently deleted');
      loadTrashItems();
    } catch {
      toast.error('Failed to delete item');
    } finally {
      setDeleteItemId(null);
    }
  };

  const handleBulkRestore = async () => {
    try {
      await trashAPI.bulkRestore(selectedItems);
      toast.success('Items restored successfully');
      setSelectedItems([]);
      loadTrashItems();
    } catch {
      toast.error('Failed to restore items');
    }
  };

  const handleEmptyTrash = async () => {
    try {
      if (!projectId) return;
      await trashAPI.emptyTrash(projectId);
      toast.success('Trash emptied');
      loadTrashItems();
    } catch {
      toast.error('Failed to empty trash');
    } finally {
      setShowEmptyTrashConfirm(false);
    }
  };

  if (loading) return <TrashSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5">
            <Trash2 className="w-6 h-6 text-destructive" />
            Trash
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Soft-deleted items are safely archived here for 30 days before permanent purging.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          {selectedItems.length > 0 && (
            <Button onClick={handleBulkRestore} variant="outline" className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Restore Selected ({selectedItems.length})
            </Button>
          )}
          {items.length > 0 && (
            <Button variant="destructive" onClick={() => setShowEmptyTrashConfirm(true)} className="gap-2">
              <Trash2 className="w-4 h-4" />
              Empty Trash
            </Button>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <Card className="p-16 text-center border-dashed border-2 bg-muted/20">
          <Trash2 className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
          <h3 className="font-semibold text-foreground text-base">Trash is empty</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            Items removed from content lists or media libraries will appear here before being permanently purged.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const isSelected = selectedItems.includes(item._id);
            return (
              <Card key={item._id} className="p-4 border border-border bg-card hover:border-primary/30 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setSelectedItems(selectedItems.filter(id => id !== item._id));
                        } else {
                          setSelectedItems([...selectedItems, item._id]);
                        }
                      }}
                      className="mt-0.5 sm:mt-0 text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                      aria-label={isSelected ? "Deselect item" : "Select item"}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-primary" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm text-foreground">{item.metadata?.title || 'Untitled'}</h3>
                        <Badge variant="outline" className="text-[11px] capitalize">
                          {item.itemType}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Deleted by <span className="text-foreground font-medium">{item.deletedBy?.name || item.deletedBy?.email || 'User'}</span> • {formatDistanceToNow(new Date(item.deletedAt), { addSuffix: true })}
                      </p>
                      <p className="text-[11px] text-destructive flex items-center gap-1.5 mt-1">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        Permanently purged {formatDistanceToNow(new Date(item.purgeAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button size="sm" variant="outline" onClick={() => handleRestore(item._id)} className="h-8 gap-1.5 text-xs">
                      <RotateCcw className="w-3.5 h-3.5" />
                      Restore
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => setDeleteItemId(item._id)}
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      aria-label="Delete Permanently"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteItemId}
        onOpenChange={(open) => !open && setDeleteItemId(null)}
        title="Permanently Delete Item"
        description="Are you sure you want to permanently delete this item? This action cannot be reversed."
        confirmText="Delete Permanently"
        variant="destructive"
        onConfirm={handlePermanentDelete}
      />

      <ConfirmDialog
        open={showEmptyTrashConfirm}
        onOpenChange={setShowEmptyTrashConfirm}
        title="Empty Entire Trash"
        description="Are you sure you want to empty the entire trash? All contained items will be permanently erased immediately."
        confirmText="Empty Trash"
        variant="destructive"
        onConfirm={handleEmptyTrash}
      />
    </div>
  );
}

export default TrashPage;
