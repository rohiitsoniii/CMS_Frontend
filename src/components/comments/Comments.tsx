import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Check, Trash2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from 'react-hot-toast';
import { api } from '@/services/api';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  _id: string;
  author: { name: string; email: string };
  content: string;
  createdAt: string;
  resolved: boolean;
  replies?: Comment[];
}

interface CommentsProps {
  contentId: string;
  projectId: string;
  fieldPath?: string;
}

export function Comments({ contentId, projectId, fieldPath }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [showResolved, setShowResolved] = useState(false);
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);

  useEffect(() => {
    loadComments();
  }, [contentId, showResolved]);

  const loadComments = async () => {
    try {
      const url = fieldPath
        ? `/comments/content/${contentId}/comments/field/${fieldPath}`
        : `/comments/content/${contentId}/comments?includeResolved=${showResolved}`;
      
      const response = await api.get(url);
      setComments(response.data);
    } catch {
      toast.error('Failed to load comments');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await api.post(`/comments/projects/${projectId}/content/${contentId}/comments`, {
        content: newComment,
        fieldPath,
        parentId: replyTo
      });
      
      setNewComment('');
      setReplyTo(null);
      loadComments();
      toast.success('Comment added');
    } catch {
      toast.error('Failed to add comment');
    }
  };

  const handleResolve = async (commentId: string) => {
    try {
      await api.post(`/comments/comments/${commentId}/resolve`);
      loadComments();
      toast.success('Comment resolved');
    } catch {
      toast.error('Failed to resolve comment');
    }
  };

  const handleDelete = async () => {
    if (!deleteCommentId) return;

    try {
      await api.delete(`/comments/comments/${deleteCommentId}`);
      loadComments();
      toast.success('Comment deleted');
    } catch {
      toast.error('Failed to delete comment');
    } finally {
      setDeleteCommentId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
          <MessageSquare className="w-4 h-4 text-primary" />
          <span>Comments ({comments.length})</span>
        </h3>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowResolved(!showResolved)}
          className="text-xs h-7"
        >
          {showResolved ? 'Hide Resolved' : 'Show Resolved'}
        </Button>
      </div>

      <div className="space-y-2.5">
        {comments.map((comment) => (
          <Card key={comment._id} className={`p-3.5 border border-border bg-card transition-opacity ${comment.resolved ? 'opacity-60 bg-muted/30' : ''}`}>
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 text-xs">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {(comment.author?.name || comment.author?.email || 'U')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1 gap-2">
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-semibold text-xs text-foreground truncate">{comment.author?.name || comment.author?.email}</span>
                    <span className="text-[11px] text-muted-foreground shrink-0">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!comment.resolved && (
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => handleResolve(comment._id)}
                        className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                        title="Mark Resolved"
                        aria-label="Mark Resolved"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => setDeleteCommentId(comment._id)}
                      className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      title="Delete Comment"
                      aria-label="Delete Comment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                {comment.resolved && (
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-1.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Resolved
                  </span>
                )}
              </div>
            </div>
          </Card>
        ))}

        {comments.length === 0 && (
          <div className="text-center py-6 text-xs text-muted-foreground border border-dashed rounded-lg">
            No comments yet. Start the conversation below.
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment... (use @username to mention)"
          rows={2}
          className="text-xs bg-background resize-none"
        />
        <Button onClick={handleAddComment} className="self-end h-9 w-9 p-0 shrink-0" aria-label="Send Comment">
          <Send className="w-4 h-4" />
        </Button>
      </div>

      <ConfirmDialog
        open={!!deleteCommentId}
        onOpenChange={(open) => !open && setDeleteCommentId(null)}
        title="Delete Comment"
        description="Are you sure you want to delete this comment? This action cannot be reversed."
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default Comments;
