import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Plus,
    Key,
    Copy,
    Trash2,
    Eye,
    EyeOff,
    Shield,
    Globe,
    Calendar,
    Check,
    AlertTriangle,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { authAPI } from '@/services/api';
import { APIKeysSkeleton } from '@/components/skeletons';
import { cn } from '@/lib/utils';

const createKeySchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    allowedOrigins: z.string().optional(),
});

type CreateKeyForm = z.infer<typeof createKeySchema>;

interface APIKey {
    _id: string;
    name: string;
    description?: string;
    /** Only a non-secret prefix is returned after creation; the full key is shown once. */
    keyPrefix?: string;
    permissions: string[];
    allowedOrigins: string[];
    isActive: boolean;
    lastUsedAt?: string;
    usageCount: number;
    expiresAt?: string;
    createdAt: string;
}

interface NewKeyData {
    id: string;
    name: string;
    apiKey: string;
    secretKey: string;
    permissions: string[];
    allowedOrigins: string[];
    expiresAt?: string;
    createdAt: string;
}

export default function APIKeysPage() {
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; key?: APIKey }>({ open: false });
    const [newKeyData, setNewKeyData] = useState<NewKeyData | null>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [showSecretKey, setShowSecretKey] = useState(false);
    const [readPermission, setReadPermission] = useState(true);
    const [writePermission, setWritePermission] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CreateKeyForm>({
        resolver: zodResolver(createKeySchema),
    });

    // Fetch API keys
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['apiKeys'],
        queryFn: async () => {
            const response = await authAPI.getAPIKeys();
            return response.data.data.apiKeys as APIKey[];
        },
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (data: { name: string; description?: string; permissions?: string[]; allowedOrigins?: string[] }) =>
            authAPI.createAPIKey(data),
        onSuccess: (response) => {
            setNewKeyData(response.data.data);
            setCreateDialogOpen(false);
            reset();
            refetch();
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => authAPI.deleteAPIKey(id),
        onSuccess: () => {
            setDeleteDialog({ open: false });
            refetch();
        },
    });

    const onCreateSubmit = (data: CreateKeyForm) => {
        const permissions = [];
        if (readPermission) permissions.push('content:read');
        if (writePermission) permissions.push('content:write');

        createMutation.mutate({
            name: data.name,
            description: data.description,
            permissions,
            allowedOrigins: data.allowedOrigins?.split(',').map(o => o.trim()).filter(Boolean) || [],
        });
    };

    const handleDelete = () => {
        if (deleteDialog.key) {
            deleteMutation.mutate(deleteDialog.key._id);
        }
    };

    const copyToClipboard = async (text: string, field: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">API Keys</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage API keys for accessing your content</p>
                </div>
                <Button variant="gradient" onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="w-4 h-4" />
                    Create API Key
                </Button>
            </div>

            {/* Info Card */}
            <Card className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-200 dark:border-indigo-900">
                <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-500 flex items-center justify-center shrink-0">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">How to use API Keys</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Include your API key in requests using the <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">X-API-Key</code> header.
                                For write operations, also include <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">X-API-Secret</code>.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* API Keys List */}
            {isLoading ? (
                <APIKeysSkeleton />
            ) : data?.length === 0 ? (
                <Card className="py-16">
                    <CardContent className="flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                            <Key className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No API keys yet</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-sm">
                            Create an API key to start fetching content from your websites.
                        </p>
                        <Button variant="gradient" onClick={() => setCreateDialogOpen(true)}>
                            <Plus className="w-4 h-4" />
                            Create API Key
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {data?.map((key) => (
                        <Card key={key._id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className={cn(
                                            'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                                            key.isActive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-gray-100 text-gray-400'
                                        )}>
                                            <Key className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-gray-900 dark:text-white">{key.name}</h3>
                                                <Badge variant={key.isActive ? 'success' : 'secondary'}>
                                                    {key.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </div>
                                            {key.description && (
                                                <p className="text-sm text-gray-500 mb-2">{key.description}</p>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono" title="The full key was shown once when it was created">
                                                    {key.keyPrefix ? `${key.keyPrefix}…` : 'hidden'}
                                                </code>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    Created {formatDate(key.createdAt)}
                                                </span>
                                                {key.lastUsedAt && (
                                                    <span>Last used {formatDate(key.lastUsedAt)}</span>
                                                )}
                                                <span>{key.usageCount.toLocaleString()} requests</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 sm:self-start">
                                        <div className="flex gap-1">
                                            {key.permissions.map((p) => (
                                                <Badge key={p} variant="outline" className="text-xs">
                                                    {p.split(':')[1]}
                                                </Badge>
                                            ))}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => setDeleteDialog({ open: true, key })}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create API Key</DialogTitle>
                        <DialogDescription>
                            Create a new API key to access your content from external applications.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onCreateSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name *</Label>
                            <Input
                                id="name"
                                placeholder="e.g., Production Website"
                                {...register('name')}
                                className={errors.name ? 'border-red-500' : ''}
                            />
                            {errors.name && (
                                <p className="text-xs text-red-500">{errors.name.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                placeholder="What is this key used for?"
                                {...register('description')}
                            />
                        </div>

                        <div className="space-y-3">
                            <Label>Permissions</Label>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between p-3 rounded-lg border">
                                    <div>
                                        <p className="font-medium text-sm">Read Access</p>
                                        <p className="text-xs text-gray-500">Can fetch published content</p>
                                    </div>
                                    <Switch checked={readPermission} onCheckedChange={setReadPermission} />
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg border">
                                    <div>
                                        <p className="font-medium text-sm">Write Access</p>
                                        <p className="text-xs text-gray-500">Can create and update content</p>
                                    </div>
                                    <Switch checked={writePermission} onCheckedChange={setWritePermission} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="allowedOrigins">
                                <Globe className="w-4 h-4 inline mr-1" />
                                Allowed Origins
                            </Label>
                            <Input
                                id="allowedOrigins"
                                placeholder="https://mysite.com, https://app.mysite.com"
                                {...register('allowedOrigins')}
                            />
                            <p className="text-xs text-gray-500">Comma-separated list. Leave empty to allow all origins.</p>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="gradient" disabled={createMutation.isPending}>
                                {createMutation.isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    'Create Key'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* New Key Created Dialog */}
            <Dialog open={!!newKeyData} onOpenChange={() => setNewKeyData(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-emerald-600">
                            <Check className="w-5 h-5" />
                            API Key Created
                        </DialogTitle>
                        <DialogDescription>
                            Save these credentials now. The secret key will never be shown again.
                        </DialogDescription>
                    </DialogHeader>

                    {newKeyData && (
                        <div className="space-y-4">
                            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                                <div className="flex gap-2">
                                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                                    <p className="text-sm text-amber-800 dark:text-amber-200">
                                        <strong>Important:</strong> Copy and save the secret key now. You won't be able to see it again!
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <Label className="text-xs text-gray-500">API Key</Label>
                                    <div className="flex items-center gap-2">
                                        <code className="flex-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono break-all">
                                            {newKeyData.apiKey}
                                        </code>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => copyToClipboard(newKeyData.apiKey, 'newApiKey')}
                                        >
                                            {copiedField === 'newApiKey' ? (
                                                <Check className="w-4 h-4 text-emerald-500" />
                                            ) : (
                                                <Copy className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs text-gray-500">Secret Key</Label>
                                    <div className="flex items-center gap-2">
                                        <code className="flex-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono break-all">
                                            {showSecretKey ? newKeyData.secretKey : '•'.repeat(40)}
                                        </code>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setShowSecretKey(!showSecretKey)}
                                        >
                                            {showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => copyToClipboard(newKeyData.secretKey, 'newSecretKey')}
                                        >
                                            {copiedField === 'newSecretKey' ? (
                                                <Check className="w-4 h-4 text-emerald-500" />
                                            ) : (
                                                <Copy className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="gradient" onClick={() => setNewKeyData(null)}>
                            I've saved these credentials
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete API Key</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{deleteDialog.key?.name}"? Any applications using this key will stop working.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialog({ open: false })}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
                            {deleteMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete Key'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
