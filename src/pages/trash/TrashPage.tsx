import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Trash2, RotateCcw, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { trashAPI } from '@/services/api';
import { TrashSkeleton } from '@/components/skeletons';
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
  const { projectId } = useParams();
  const [items, setItems] = useState<TrashItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  useEffect(() => {
    loadTrashItems();
  }, [projectId]);

  const loadTrashItems = async () => {
    try {
      if (!projectId) return;
      const response = await trashAPI.getTrash(projectId);
      setItems(response.data.data?.[0]?.items || response.data.data || []);
    } catch (error) {
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
    } catch (error) {
      toast.error('Failed to restore item');
    }
  };


  const handlePermanentDelete = async (trashId: string) => {
    if (!confirm('Are you sure? This action cannot be undone.')) return;

    try {
      await trashAPI.deletePermanently(trashId);
      toast.success('Item permanently deleted');
      loadTrashItems();
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };


  const handleBulkRestore = async () => {
    try {
      await trashAPI.bulkRestore(selectedItems);
      toast.success('Items restored successfully');
      setSelectedItems([]);
      loadTrashItems();
    } catch (error) {
      toast.error('Failed to restore items');
    }
  };


  const handleEmptyTrash = async () => {
    if (!confirm('Empty entire trash? This cannot be undone!')) return;

    try {
      if (!projectId) return;
      await trashAPI.emptyTrash(projectId);
      toast.success('Trash emptied');
      loadTrashItems();
    } catch (error) {
      toast.error('Failed to empty trash');
    }
  };


  if (loading) return <TrashSkeleton />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Trash</h1>
          <p className="text-gray-600">Items will be permanently deleted after 30 days</p>
        </div>
        <div className="flex gap-2">
          {selectedItems.length > 0 && (
            <Button onClick={handleBulkRestore}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Restore Selected ({selectedItems.length})
            </Button>
          )}
          <Button variant="destructive" onClick={handleEmptyTrash}>
            <Trash2 className="w-4 h-4 mr-2" />
            Empty Trash
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <Card className="p-12 text-center">
          <Trash2 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Trash is empty</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Card key={item._id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems([...selectedItems, item._id]);
                      } else {
                        setSelectedItems(selectedItems.filter(id => id !== item._id));
                      }
                    }}
                  />
                  <div>
                    <h3 className="font-medium">{item.metadata.title || 'Untitled'}</h3>
                    <p className="text-sm text-gray-600">
                      {item.itemType} • Deleted by {item.deletedBy.name} • {formatDistanceToNow(new Date(item.deletedAt), { addSuffix: true })}
                    </p>
                    <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                      <AlertTriangle className="w-3 h-3" />
                      Will be permanently deleted {formatDistanceToNow(new Date(item.purgeAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleRestore(item._id)}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Restore
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handlePermanentDelete(item._id)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
