import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Eye, ExternalLink, Loader2, Copy, Check } from 'lucide-react';
import { api } from '@/services/api';
import toast from 'react-hot-toast';

interface PreviewButtonProps {
  contentId: string;
  projectId: string;
  contentTypeId: string;
  disabled?: boolean;
}

export function PreviewButton({ contentId, projectId, contentTypeId, disabled }: PreviewButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGeneratePreview = async () => {
    setLoading(true);
    try {
      const { data } = await api.post(`/projects/${projectId}/content/${contentId}/preview`, {
        expiresIn: 60,
        projectId,
        contentTypeId
      });
      setPreviewUrl(data.previewUrl);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to generate preview');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (previewUrl) {
      await navigator.clipboard.writeText(previewUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setPreviewUrl(null);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        disabled={disabled || loading}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4 mr-2" />}
        Preview
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Content Preview</DialogTitle>
            <DialogDescription>
              Generate a preview link to share this content before publishing.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {!previewUrl ? (
              <Button onClick={handleGeneratePreview} className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Generate Preview Link
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-muted rounded-lg flex items-center gap-2">
                  <code className="flex-1 text-sm break-all">{previewUrl}</code>
                  <Button variant="ghost" size="icon" onClick={handleCopy}>
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  This link expires in 60 minutes.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={handleGeneratePreview}>
                    Generate New
                  </Button>
                  <Button className="flex-1" asChild>
                    <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Preview
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}