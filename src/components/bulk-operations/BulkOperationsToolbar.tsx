import React, { useState } from 'react';
import { CheckSquare, Trash2, Eye, EyeOff, Tag, Calendar, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tags, setTags] = useState('');
  const [publishAt, setPublishAt] = useState('');
  const [unpublishAt, setUnpublishAt] = useState('');

  if (selectedIds.length === 0) return null;

  const handleBulkPublish = async () => {
    try {
      await axios.post('/api/v1/bulk-operations/bulk/publish', { contentIds: selectedIds });
      toast.success(`Published ${selectedIds.length} items`);
      onComplete();
    } catch {
      toast.error('Failed to publish items');
    }
  };

  const handleBulkUnpublish = async () => {
    try {
      await axios.post('/api/v1/bulk-operations/bulk/unpublish', { contentIds: selectedIds });
      toast.success(`Unpublished ${selectedIds.length} items`);
      onComplete();
    } catch {
      toast.error('Failed to unpublish items');
    }
  };

  const handleBulkDelete = async () => {
    try {
      await axios.post(`/api/v1/bulk-operations/projects/${projectId}/bulk/delete`, { contentIds: selectedIds });
      toast.success(`Deleted ${selectedIds.length} items`);
      onComplete();
    } catch {
      toast.error('Failed to delete items');
    } finally {
      setShowDeleteConfirm(false);
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
    } catch {
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
    } catch {
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
    } catch {
      toast.error('Failed to schedule content');
    }
  };

  return (
    <>
      <aside aria-label="Bulk actions toolbar" className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-card/95 backdrop-blur-md text-card-foreground shadow-2xl rounded-2xl border border-border p-3 flex flex-wrap items-center gap-3 z-50">
        <div className="flex items-center gap-2 pl-2">
          <CheckSquare className="w-4 h-4 text-primary" />
          <span className="font-semibold text-xs tracking-tight">{selectedIds.length} selected</span>
        </div>

        <div className="h-5 w-px bg-border" />

        <div className="flex items-center gap-1.5 flex-wrap">
          <Button size="sm" variant="default" onClick={handleBulkPublish} className="h-8 gap-1.5 text-xs">
            <Eye className="w-3.5 h-3.5" />
            Publish
          </Button>

          <Button size="sm" variant="outline" onClick={handleBulkUnpublish} className="h-8 gap-1.5 text-xs">
            <EyeOff className="w-3.5 h-3.5" />
            Unpublish
          </Button>

          <Button size="sm" variant="outline" onClick={() => setShowTagDialog(true)} className="h-8 gap-1.5 text-xs">
            <Tag className="w-3.5 h-3.5" />
            Add Tags
          </Button>

          <Button size="sm" variant="outline" onClick={() => setShowScheduleDialog(true)} className="h-8 gap-1.5 text-xs">
            <Calendar className="w-3.5 h-3.5" />
            Schedule
          </Button>

          <Button size="sm" variant="outline" onClick={handleBulkDuplicate} className="h-8 gap-1.5 text-xs">
            <Copy className="w-3.5 h-3.5" />
            Duplicate
          </Button>

          <Button size="sm" variant="destructive" onClick={() => setShowDeleteConfirm(true)} className="h-8 gap-1.5 text-xs">
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </Button>
        </div>
      </aside>

      <Dialog open={showTagDialog} onOpenChange={setShowTagDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Tags to {selectedIds.length} Items</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Tags (comma-separated)</Label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="news, featured, archived"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowTagDialog(false)}>Cancel</Button>
              <Button onClick={handleAddTags}>Save Tags</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule {selectedIds.length} Items</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Publish At</Label>
              <Input
                type="datetime-local"
                value={publishAt}
                onChange={(e) => setPublishAt(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Unpublish At (Optional)</Label>
              <Input
                type="datetime-local"
                value={unpublishAt}
                onChange={(e) => setUnpublishAt(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>Cancel</Button>
              <Button onClick={handleSchedule}>Confirm Schedule</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Selected Items"
        description={`Are you sure you want to delete these ${selectedIds.length} items? This action cannot be reversed.`}
        confirmText={`Delete ${selectedIds.length} Items`}
        variant="destructive"
        onConfirm={handleBulkDelete}
      />
    </>
  );
}

export default BulkOperationsToolbar;
