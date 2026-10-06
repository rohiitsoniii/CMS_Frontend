import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Clock, User, RotateCcw, GitCompare, Trash2, ArrowLeft } from 'lucide-react';
import { versionService, Version } from '@/services/versionService';
import { VersionDiff } from './VersionDiff';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface VersionHistoryProps {
    contentId: string;
    onRestore?: () => void;
}

export function VersionHistory({ contentId, onRestore }: VersionHistoryProps) {
    const [versions, setVersions] = useState<Version[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
    const [compareVersion, setCompareVersion] = useState<Version | null>(null);
    const [showDiff, setShowDiff] = useState(false);
    const [restoreVersionId, setRestoreVersionId] = useState<string | null>(null);
    const [deleteVersionId, setDeleteVersionId] = useState<string | null>(null);

    useEffect(() => {
        loadVersions();
    }, [contentId]);

    const loadVersions = async () => {
        try {
            setLoading(true);
            const data = await versionService.getVersions(contentId);
            setVersions(data);
        } catch (error) {
            console.error('Failed to load versions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async () => {
        if (!restoreVersionId) return;

        try {
            await versionService.restoreVersion(contentId, restoreVersionId);
            await loadVersions();
            onRestore?.();
            toast.success('Version restored successfully!');
        } catch (error) {
            console.error('Failed to restore version:', error);
            toast.error('Failed to restore version');
        } finally {
            setRestoreVersionId(null);
        }
    };

    const handleDelete = async () => {
        if (!deleteVersionId) return;

        try {
            await versionService.deleteVersion(contentId, deleteVersionId);
            setVersions(versions.filter(v => v._id !== deleteVersionId));
            toast.success('Version deleted');
        } catch (error) {
            console.error('Failed to delete version:', error);
            toast.error('Failed to delete version');
        } finally {
            setDeleteVersionId(null);
        }
    };

    const handleCompare = (version: Version) => {
        if (!selectedVersion) {
            setSelectedVersion(version);
        } else if (selectedVersion._id === version._id) {
            setSelectedVersion(null);
        } else {
            setCompareVersion(version);
            setShowDiff(true);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (showDiff && selectedVersion && compareVersion) {
        return (
            <div className="space-y-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        setShowDiff(false);
                        setSelectedVersion(null);
                        setCompareVersion(null);
                    }}
                    className="gap-2 text-primary hover:text-primary"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to version history
                </Button>
                <VersionDiff
                    contentId={contentId}
                    version1Id={selectedVersion._id!}
                    version2Id={compareVersion._id!}
                />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                    Version History ({versions.length})
                </h3>
                {selectedVersion && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedVersion(null)}
                        className="text-xs h-7 text-muted-foreground hover:text-foreground"
                    >
                        Cancel comparison
                    </Button>
                )}
            </div>

            {/* Instructions */}
            {selectedVersion && (
                <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg text-xs text-foreground">
                    <strong>Comparison mode:</strong> Select another version to compare with version {selectedVersion.version}
                </div>
            )}

            {/* Version List */}
            {versions.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-lg">
                    <Clock className="w-10 h-10 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="text-xs text-muted-foreground">
                        No version history recorded yet.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {versions.map((version, index) => (
                        <div
                            key={version._id}
                            className={`group p-4 border rounded-xl transition-all ${
                                selectedVersion?._id === version._id
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border bg-card hover:border-primary/40'
                            }`}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                                        <Badge variant={index === 0 ? 'default' : 'secondary'} className="text-xs">
                                            {index === 0 ? 'Current' : `Version ${version.version}`}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            {new Date(version.createdAt!).toLocaleString()}
                                        </span>
                                    </div>

                                    {version.createdBy && (
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                                            <User className="w-3.5 h-3.5" />
                                            <span>{version.createdBy}</span>
                                        </div>
                                    )}

                                    {version.changes && version.changes.length > 0 && (
                                        <div className="mt-2 text-xs text-muted-foreground">
                                            <span className="font-medium text-foreground">Changes:</span> {version.changes.length} field(s) modified
                                            <div className="mt-1 flex flex-wrap gap-1">
                                                {version.changes.slice(0, 3).map((change, i) => (
                                                    <span
                                                        key={i}
                                                        className="px-1.5 py-0.5 bg-muted rounded text-[11px] font-mono"
                                                    >
                                                        {change.field}
                                                    </span>
                                                ))}
                                                {version.changes.length > 3 && (
                                                    <span className="px-1.5 py-0.5 text-[11px] text-muted-foreground">
                                                        +{version.changes.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity shrink-0">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleCompare(version)}
                                        className="h-8 w-8 text-primary hover:bg-primary/10"
                                        title={selectedVersion ? 'Compare with selected' : 'Select for comparison'}
                                        aria-label="Compare version"
                                    >
                                        <GitCompare className="w-4 h-4" />
                                    </Button>
                                    {index !== 0 && (
                                        <>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => setRestoreVersionId(version._id!)}
                                                className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                                                title="Restore this version"
                                                aria-label="Restore version"
                                            >
                                                <RotateCcw className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => setDeleteVersionId(version._id!)}
                                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                title="Delete this version"
                                                aria-label="Delete version"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ConfirmDialog
                open={!!restoreVersionId}
                onOpenChange={(open) => !open && setRestoreVersionId(null)}
                title="Restore Version"
                description="Are you sure you want to restore this version? This will create a new current version using this snapshot."
                confirmText="Restore Version"
                variant="default"
                onConfirm={handleRestore}
            />

            <ConfirmDialog
                open={!!deleteVersionId}
                onOpenChange={(open) => !open && setDeleteVersionId(null)}
                title="Delete Version"
                description="Are you sure you want to delete this historical version? This action cannot be undone."
                confirmText="Delete"
                variant="destructive"
                onConfirm={handleDelete}
            />
        </div>
    );
}

export default VersionHistory;
