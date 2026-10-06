import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Webhook as WebhookIcon, Trash2, Edit2, Play, CheckCircle, XCircle } from 'lucide-react';
import { webhookService, IWebhook } from '../../services/webhookService';
import { WebhooksSkeleton } from '@/components/skeletons';
import { toast } from 'react-hot-toast';

export const WebhooksPage: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const [webhooks, setWebhooks] = useState<IWebhook[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingWebhook, setEditingWebhook] = useState<IWebhook | null>(null);

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
        } catch (error) {
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
        } catch (error) {
            toast.error('Failed to save webhook');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this webhook?')) return;
        try {
            await webhookService.deleteWebhook(id);
            toast.success('Webhook deleted');
            loadWebhooks();
        } catch (error) {
            toast.error('Failed to delete webhook');
        }
    };

    const handleTest = async (id: string) => {
        try {
            await webhookService.testWebhook(id);
            toast.success('Test event sent successfully');
        } catch (error) {
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
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                        <WebhookIcon className="w-6 h-6" />
                        Webhooks
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage callbacks for real-time updates</p>
                </div>
                <button
                    onClick={() => {
                        setEditingWebhook(null);
                        setFormData({ name: '', url: '', events: [], secret: '' });
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    New Webhook
                </button>
            </div>

            <div className="space-y-4">
                {webhooks.map(webhook => (
                    <div key={webhook._id} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-lg dark:text-white">{webhook.name}</h3>
                                {webhook.isEnabled ? (
                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" /> Active
                                    </span>
                                ) : (
                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400 flex items-center gap-1">
                                        <XCircle className="w-3 h-3" /> Disabled
                                    </span>
                                )}
                            </div>
                            <code className="text-sm bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded text-gray-600 dark:text-gray-300 block mb-3 w-fit">
                                {webhook.url}
                            </code>
                            <div className="flex flex-wrap gap-2">
                                {webhook.events.map(event => (
                                    <span key={event} className="text-xs border border-gray-200 dark:border-gray-700 px-2 py-1 rounded-full text-gray-500 dark:text-gray-400">
                                        {event}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleTest(webhook._id)}
                                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title="Test Webhook"
                            >
                                <Play className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleEdit(webhook)}
                                className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                title="Edit"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDelete(webhook._id)}
                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}

                {webhooks.length === 0 && (
                    <div className="text-center py-12 text-gray-500 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                        <WebhookIcon className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                        <p>No webhooks configured yet.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-6 dark:text-white">
                            {editingWebhook ? 'Edit Webhook' : 'Create Webhook'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent dark:text-white"
                                    placeholder="e.g. Production Deploy"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Payload URL
                                </label>
                                <input
                                    type="url"
                                    required
                                    value={formData.url}
                                    onChange={e => setFormData({ ...formData, url: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent dark:text-white"
                                    placeholder="https://api.example.com/webhook"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Secret (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.secret}
                                    onChange={e => setFormData({ ...formData, secret: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent dark:text-white font-mono text-sm"
                                    placeholder="whsec_..."
                                />
                                <p className="text-xs text-gray-500 mt-1">Used to sign requests (HMAC SHA-256)</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Trigger Events
                                </label>
                                <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                                    {availableEvents.map(event => (
                                        <label key={event} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.events.includes(event)}
                                                onChange={() => toggleEvent(event)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                                                {event}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    {editingWebhook ? 'Save Changes' : 'Create Webhook'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
