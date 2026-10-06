import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contentAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Clock,
    RotateCcw,
    Eye,
    User,
    Calendar,
    FileText,
    AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface VersionHistoryProps {
    projectId: string;
    contentId: string;
    currentVersion: number;
    onRestore?: () => void;
}

export function VersionHistory({
    projectId,
    contentId,
    currentVersion,
    onRestore,
}: VersionHistoryProps) {
    const [selectedVersion, setSelectedVersion] = useState<any>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
    const queryClient = useQueryClient();

    // Fetch version history
    const { data: versions, isLoading } = useQuery({
        queryKey: ['content-versions', projectId, contentId],
        queryFn: async () => {
            const response = await contentAPI.getVersionHistory(projectId, contentId);
            return response.data.data.versions;
        },
    });

    // Restore version mutation
    const restoreMutation = useMutation({
        mutationFn: async (version: number) => {
            return contentAPI.restoreVersion(projectId, contentId, version);
        },
        onSuccess: () => {
            toast.success('Version restored successfully');
            queryClient.invalidateQueries({ queryKey: ['content', projectId, contentId] });
            queryClient.invalidateQueries({ queryKey: ['content-versions', projectId, contentId] });
            setIsRestoreDialogOpen(false);
            onRestore?.();
        },
        onError: () => {
            toast.error('Failed to restore version');
        },
    });

    const handlePreview = (version: any) => {
        setSelectedVersion(version);
        setIsPreviewOpen(true);
    };

    const handleRestoreClick = (version: any) => {
        setSelectedVersion(version);
        setIsRestoreDialogOpen(true);
    };

    const handleConfirmRestore = () => {
        if (selectedVersion) {
            restoreMutation.mutate(selectedVersion.version);
        }
    };

    const getStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            draft: 'bg-gray-100 text-gray-800',
            published: 'bg-green-100 text-green-800',
            scheduled: 'bg-blue-100 text-blue-800',
            archived: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-500">Loading version history...</p>
                </div>
            </div>
        );
    }

    if (!versions || versions.length === 0) {
        return (
            <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Version History</h3>
                <p className="text-gray-500">
                    Version history will appear here as you make changes to this content.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <h3 className="text-lg font-semibold">Version History</h3>
                    <Badge variant="outline">{versions.length} versions</Badge>
                </div>
                <div className="text-sm text-gray-500">
                    Current: v{currentVersion}
                </div>
            </div>

            {/* Timeline */}
            <div className="space-y-3">
                {versions.map((version: any, index: number) => {
                    const isCurrentVersion = version.version === currentVersion;
                    const isMostRecent = index === 0;

                    return (
                        <Card
                            key={version.version}
                            className={`p-4 ${isCurrentVersion ? 'border-2 border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : ''
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                {/* Version Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                                                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                                    v{version.version}
                                                </span>
                                            </div>
                                            {isCurrentVersion && (
                                                <Badge variant="default">Current</Badge>
                                            )}
                                            {isMostRecent && !isCurrentVersion && (
                                                <Badge variant="outline">Latest</Badge>
                                            )}
                                        </div>
                                        <Badge className={getStatusBadge(version.status)}>
                                            {version.status}
                                        </Badge>
                                    </div>

                                    {/* Metadata */}
                                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            <span>{version.changedBy?.name || 'Unknown'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            <span>{format(new Date(version.changedAt), 'PPpp')}</span>
                                        </div>
                                        {version.changeNote && (
                                            <div className="flex items-start gap-2 mt-2">
                                                <FileText className="w-4 h-4 mt-0.5" />
                                                <span className="italic">{version.changeNote}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePreview(version)}
                                    >
                                        <Eye className="w-4 h-4 mr-2" />
                                        Preview
                                    </Button>
                                    {!isCurrentVersion && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleRestoreClick(version)}
                                        >
                                            <RotateCcw className="w-4 h-4 mr-2" />
                                            Restore
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Preview Dialog */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            Version {selectedVersion?.version} Preview
                        </DialogTitle>
                    </DialogHeader>
                    {selectedVersion && (
                        <div className="space-y-4">
                            {/* Metadata */}
                            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <div>
                                    <div className="text-sm text-gray-500">Changed By</div>
                                    <div className="font-medium">{selectedVersion.changedBy?.name || 'Unknown'}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Changed At</div>
                                    <div className="font-medium">
                                        {format(new Date(selectedVersion.changedAt), 'PPpp')}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Status</div>
                                    <Badge className={getStatusBadge(selectedVersion.status)}>
                                        {selectedVersion.status}
                                    </Badge>
                                </div>
                                {selectedVersion.changeNote && (
                                    <div className="col-span-2">
                                        <div className="text-sm text-gray-500">Change Note</div>
                                        <div className="font-medium italic">{selectedVersion.changeNote}</div>
                                    </div>
                                )}
                            </div>

                            {/* Content Data */}
                            <div>
                                <h4 className="font-semibold mb-2">Content Data</h4>
                                <pre className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-x-auto text-sm">
                                    {JSON.stringify(selectedVersion.data, null, 2)}
                                </pre>
                            </div>

                            {/* Localized Data */}
                            {selectedVersion.localizedData && Object.keys(selectedVersion.localizedData).length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-2">Localized Data</h4>
                                    <pre className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-x-auto text-sm">
                                        {JSON.stringify(selectedVersion.localizedData, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Restore Confirmation Dialog */}
            <Dialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Restore Version {selectedVersion?.version}?</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
                            <div className="text-sm text-yellow-800 dark:text-yellow-200">
                                <p className="font-medium mb-1">This will restore the content to version {selectedVersion?.version}.</p>
                                <p>Your current changes will be saved as a new version before restoring.</p>
                            </div>
                        </div>
                        {selectedVersion && (
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Version:</span>
                                    <span className="font-medium">v{selectedVersion.version}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Changed By:</span>
                                    <span className="font-medium">{selectedVersion.changedBy?.name || 'Unknown'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Changed At:</span>
                                    <span className="font-medium">
                                        {format(new Date(selectedVersion.changedAt), 'PPpp')}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsRestoreDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmRestore}
                            disabled={restoreMutation.isPending}
                        >
                            {restoreMutation.isPending ? 'Restoring...' : 'Restore Version'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
