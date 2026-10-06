import { useState } from 'react';
import { CheckSquare, Trash2, Eye, EyeOff, Tag, Calendar, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';
import axios from 'axios';

interface BulkOperationsToolbarProps {
  selectedIds: string[];
  onComplete: () => void;
  projectId: string;
}

export function BulkOperationsToolbar({ selectedIds, onComplete, projectId }: BulkOperationsToolbarProps) {
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [tags, setTags] = useState('');
  const [publishAt, setPublishAt] = useState('');
  const [unpublishAt, setUnpublishAt] = useState('');

  if (selectedIds.length === 0) return null;

  const handleBulkPublish = async () => {
    try {
      await axios.post('/api/v1/bulk-operations/bulk/publish', { contentIds: selectedIds });
      toast.success(`Published ${selectedIds.length} items`);
      onComplete();
    } catch (error) {
      toast.error('Failed to publish items');
    }
  };

  const handleBulkUnpublish = async () => {
    try {
      await axios.post('/api/v1/bulk-operations/bulk/unpublish', { contentIds: selectedIds });
      toast.success(`Unpublished ${selectedIds.length} items`);
      onComplete();
    } catch (error) {
      toast.error('Failed to unpublish items');
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.length} items?`)) return;

    try {
      await axios.post(`/api/v1/bulk-operations/projects/${projectId}/bulk/delete`, { contentIds: selectedIds });
      toast.success(`Deleted ${selectedIds.length} items`);
      onComplete();
    } catch (error) {
      toast.error('Failed to delete items');
    }
  };

  const handleBulkDuplicate = async () => {
    try {
      await axios.post('/api/v1/duplication/content/bulk-duplicate', { 
        contentIds: selectedIds,
        options: { includeRelationships: false }
      });
      toast.success(`Duplicated ${selectedIds.length} items`);
      onComplete();
    } catch (error) {
      toast.error('Failed to duplicate items');
    }
  };

  const handleAddTags = async () => {
    const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
    if (tagArray.length === 0) return;

    try {
      await axios.post('/api/v1/bulk-operations/bulk/add-tags', { 
        contentIds: selectedIds,
        tags: tagArray
      });
      toast.success('Tags added');
      setShowTagDialog(false);
      setTags('');
      onComplete();
    } catch (error) {
      toast.error('Failed to add tags');
    }
  };

  const handleSchedule = async () => {
    if (!publishAt) return;

    try {
      await axios.post('/api/v1/bulk-operations/bulk/schedule', {
        contentIds: selectedIds,
        publishAt,
        unpublishAt: unpublishAt || undefined
      });
      toast.success('Content scheduled');
      setShowScheduleDialog(false);
      setPublishAt('');
      setUnpublishAt('');
      onComplete();
    } catch (error) {
      toast.error('Failed to schedule content');
    }
  };

  return (
    <>
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-lg border p-4 flex items-center gap-4 z-50">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-blue-600" />
          <span className="font-medium">{selectedIds.length} selected</span>
        </div>

        <div className="h-6 w-px bg-gray-300" />

        <div className="flex gap-2">
          <Button size="sm" onClick={handleBulkPublish}>
            <Eye className="w-4 h-4 mr-2" />
            Publish
          </Button>

          <Button size="sm" variant="outline" onClick={handleBulkUnpublish}>
            <EyeOff className="w-4 h-4 mr-2" />
            Unpublish
          </Button>

          <Button size="sm" variant="outline" onClick={() => setShowTagDialog(true)}>
            <Tag className="w-4 h-4 mr-2" />
            Add Tags
          </Button>

          <Button size="sm" variant="outline" onClick={() => setShowScheduleDialog(true)}>
            <Calendar className="w-4 h-4 mr-2" />
            Schedule
          </Button>

          <Button size="sm" variant="outline" onClick={handleBulkDuplicate}>
            <Copy className="w-4 h-4 mr-2" />
            Duplicate
          </Button>

          <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <Dialog open={showTagDialog} onOpenChange={setShowTagDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Tags</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tags (comma-separated)</Label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="tag1, tag2, tag3"
              />
            </div>
            <Button onClick={handleAddTags}>Add Tags</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Content</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Publish At</Label>
              <Input
                type="datetime-local"
                value={publishAt}
                onChange={(e) => setPublishAt(e.target.value)}
              />
            </div>
            <div>
              <Label>Unpublish At (Optional)</Label>
              <Input
                type="datetime-local"
                value={unpublishAt}
                onChange={(e) => setUnpublishAt(e.target.value)}
              />
            </div>
            <Button onClick={handleSchedule}>Schedule</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
