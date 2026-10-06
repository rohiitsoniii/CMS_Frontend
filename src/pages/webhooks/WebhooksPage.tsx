import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Webhook as WebhookIcon, Trash2, Edit2, Play, CheckCircle, XCircle } from 'lucide-react';
import { webhookService, IWebhook } from '../../services/webhookService';
import { WebhooksSkeleton } from '@/components/skeletons';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export const WebhooksPage: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const [webhooks, setWebhooks] = useState<IWebhook[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingWebhook, setEditingWebhook] = useState<IWebhook | null>(null);
    const [deleteWebhookId, setDeleteWebhookId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        url: '',
        events: [] as string[],
        secret: ''
    });

    const availableEvents = [
        'content.create',
        'content.update',
        'content.delete',
        'content.publish',
        'content.unpublish',
        'media.upload',
        'media.delete'
    ];

    useEffect(() => {
        loadWebhooks();
    }, [projectId]);

    const loadWebhooks = async () => {
        if (!projectId) return;
        try {
            const data = await webhookService.getWebhooks(projectId);
            setWebhooks(data);
        } catch {
            toast.error('Failed to load webhooks');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectId) return;

        try {
            if (editingWebhook) {
                await webhookService.updateWebhook(editingWebhook._id, formData);
                toast.success('Webhook updated');
            } else {
                await webhookService.createWebhook({ ...formData, projectId });
                toast.success('Webhook created');
            }
            setShowModal(false);
            setEditingWebhook(null);
            setFormData({ name: '', url: '', events: [], secret: '' });
            loadWebhooks();
        } catch {
            toast.error('Failed to save webhook');
        }
    };

    const handleDelete = async () => {
        if (!deleteWebhookId) return;
        try {
            await webhookService.deleteWebhook(deleteWebhookId);
            toast.success('Webhook deleted');
            loadWebhooks();
        } catch {
            toast.error('Failed to delete webhook');
        } finally {
            setDeleteWebhookId(null);
        }
    };

    const handleTest = async (id: string) => {
        try {
            await webhookService.testWebhook(id);
            toast.success('Test event sent successfully');
        } catch {
            toast.error('Test failed');
        }
    };

    const toggleEvent = (event: string) => {
        setFormData(prev => ({
            ...prev,
            events: prev.events.includes(event)
                ? prev.events.filter(e => e !== event)
                : [...prev.events, event]
        }));
    };

    const handleEdit = (webhook: IWebhook) => {
        setEditingWebhook(webhook);
        setFormData({
            name: webhook.name,
            url: webhook.url,
            events: webhook.events,
            secret: webhook.secret || ''
        });
        setShowModal(true);
    };

    if (loading) return <WebhooksSkeleton />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5 dark:border-gray-800">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5">
                        <WebhookIcon className="w-6 h-6 text-primary" />
                        Webhooks
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">Manage HTTP callbacks for real-time publishing and media events.</p>
                </div>
                <Button
                    onClick={() => {
                        setEditingWebhook(null);
                        setFormData({ name: '', url: '', events: [], secret: '' });
                        setShowModal(true);
                    }}
                    className="gap-2 shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    <span>New Webhook</span>
                </Button>
            </div>

            <div className="space-y-3">
                {webhooks.map(webhook => (
                    <Card key={webhook._id} className="p-5 border border-border bg-card shadow-sm hover:border-primary/40 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="space-y-2 flex-1 min-w-0">
                                <div className="flex items-center gap-2.5 flex-wrap">
                                    <h3 className="font-semibold text-base text-foreground">{webhook.name}</h3>
                                    {webhook.isEnabled ? (
                                        <Badge variant="outline" className="text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" /> Active
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-xs bg-muted text-muted-foreground flex items-center gap-1">
                                            <XCircle className="w-3 h-3" /> Disabled
                                        </Badge>
                                    )}
                                </div>
                                <code className="text-xs bg-muted/60 px-2.5 py-1 rounded-md text-foreground font-mono inline-block truncate max-w-full">
                                    {webhook.url}
                                </code>
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                    {webhook.events.map(event => (
                                        <span key={event} className="text-[11px] border border-border bg-background px-2 py-0.5 rounded-full text-muted-foreground font-mono">
                                            {event}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-1 self-end sm:self-start shrink-0">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleTest(webhook._id)}
                                    className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                                    title="Test Webhook"
                                    aria-label="Test Webhook"
                                >
                                    <Play className="w-4 h-4" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleEdit(webhook)}
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                                    title="Edit Webhook"
                                    aria-label="Edit Webhook"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => setDeleteWebhookId(webhook._id)}
                                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                    title="Delete Webhook"
                                    aria-label="Delete Webhook"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}

                {webhooks.length === 0 && (
                    <div className="text-center py-16 text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                        <WebhookIcon className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
                        <h3 className="text-base font-semibold text-foreground">No webhooks configured yet</h3>
                        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                            Add a webhook destination to receive HTTP POST payloads when content or media changes.
                        </p>
                    </div>
                )}
            </div>

            {/* Radix Dialog for Create/Edit Webhook */}
            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingWebhook ? 'Edit Webhook' : 'Create Webhook'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-foreground">
                                Name
                            </label>
                            <Input
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Production Deploy"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-foreground">
                                Payload URL
                            </label>
                            <Input
                                type="url"
                                required
                                value={formData.url}
                                onChange={e => setFormData({ ...formData, url: e.target.value })}
                                placeholder="https://api.example.com/webhook"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-foreground">
                                Secret (Optional)
                            </label>
                            <Input
                                type="text"
                                value={formData.secret}
                                onChange={e => setFormData({ ...formData, secret: e.target.value })}
                                className="font-mono text-xs"
                                placeholder="whsec_..."
                            />
                            <p className="text-[11px] text-muted-foreground">Used to sign requests with HMAC SHA-256</p>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-xs font-semibold text-foreground">
                                Trigger Events
                            </label>
                            <div className="space-y-1.5 max-h-40 overflow-y-auto border border-border rounded-lg p-3 bg-muted/20">
                                {availableEvents.map(event => (
                                    <label key={event} className="flex items-center gap-2 cursor-pointer text-xs font-mono text-foreground">
                                        <input
                                            type="checkbox"
                                            checked={formData.events.includes(event)}
                                            onChange={() => toggleEvent(event)}
                                            className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
                                        />
                                        <span>{event}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <DialogFooter className="gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">
                                {editingWebhook ? 'Save Changes' : 'Create Webhook'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={!!deleteWebhookId}
                onOpenChange={(open) => !open && setDeleteWebhookId(null)}
                title="Delete Webhook"
                description="Are you sure you want to delete this webhook? Incoming events will no longer be delivered to this endpoint."
                confirmText="Delete"
                variant="destructive"
                onConfirm={handleDelete}
            />
        </div>
    );
};

export default WebhooksPage;
