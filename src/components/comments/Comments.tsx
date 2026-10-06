import { useState, useEffect } from 'react';
import { MessageSquare, Send, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'react-hot-toast';
import axios from 'axios';
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

  useEffect(() => {
    loadComments();
  }, [contentId, showResolved]);

  const loadComments = async () => {
    try {
      const url = fieldPath
        ? `/api/v1/comments/content/${contentId}/comments/field/${fieldPath}`
        : `/api/v1/comments/content/${contentId}/comments?includeResolved=${showResolved}`;
      
      const response = await axios.get(url);
      setComments(response.data);
    } catch (error) {
      toast.error('Failed to load comments');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await axios.post(`/api/v1/comments/projects/${projectId}/content/${contentId}/comments`, {
        content: newComment,
        fieldPath,
        parentId: replyTo
      });
      
      setNewComment('');
      setReplyTo(null);
      loadComments();
      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const handleResolve = async (commentId: string) => {
    try {
      await axios.post(`/api/v1/comments/comments/${commentId}/resolve`);
      loadComments();
      toast.success('Comment resolved');
    } catch (error) {
      toast.error('Failed to resolve comment');
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;

    try {
      await axios.delete(`/api/v1/comments/comments/${commentId}`);
      loadComments();
      toast.success('Comment deleted');
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Comments
        </h3>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowResolved(!showResolved)}
        >
          {showResolved ? 'Hide' : 'Show'} Resolved
        </Button>
      </div>

      <div className="space-y-3">
        {comments.map((comment) => (
          <Card key={comment._id} className={`p-4 ${comment.resolved ? 'opacity-60' : ''}`}>
            <div className="flex gap-3">
              <Avatar>
                <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-medium">{comment.author.name}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {!comment.resolved && (
                      <Button size="sm" variant="ghost" onClick={() => handleResolve(comment._id)}>
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(comment._id)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm">{comment.content}</p>
                {comment.resolved && (
                  <span className="text-xs text-green-600 mt-2 inline-block">✓ Resolved</span>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex gap-2">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment... Use @username to mention someone"
          rows={3}
        />
        <Button onClick={handleAddComment}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
