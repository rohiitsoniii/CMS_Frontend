import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { Clock, User, RotateCcw, GitCompare, Trash2 } from 'lucide-react';
import { versionService, Version } from '@/services/versionService';
import { VersionDiff } from './VersionDiff';

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

    const handleRestore = async (versionId: string) => {
        if (!confirm('Are you sure you want to restore this version? This will create a new version with this content.')) {
            return;
        }

        try {
            await versionService.restoreVersion(contentId, versionId);
            await loadVersions();
            onRestore?.();
            toast.success('Version restored successfully!');
        } catch (error) {
            console.error('Failed to restore version:', error);
            toast.error('Failed to restore version');
        }
    };

    const handleDelete = async (versionId: string) => {
        if (!confirm('Are you sure you want to delete this version? This action cannot be undone.')) {
            return;
        }

        try {
            await versionService.deleteVersion(contentId, versionId);
            setVersions(versions.filter(v => v._id !== versionId));
        } catch (error) {
            console.error('Failed to delete version:', error);
            toast.error('Failed to delete version');
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (showDiff && selectedVersion && compareVersion) {
        return (
            <div>
                <button
                    onClick={() => {
                        setShowDiff(false);
                        setSelectedVersion(null);
                        setCompareVersion(null);
                    }}
                    className="mb-4 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                    â† Back to version history
                </button>
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Version History ({versions.length})
                </h3>
                {selectedVersion && (
                    <button
                        onClick={() => setSelectedVersion(null)}
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                        Cancel comparison
                    </button>
                )}
            </div>

            {/* Instructions */}
            {selectedVersion && (
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg text-sm text-indigo-700 dark:text-indigo-300">
                    <strong>Comparison mode:</strong> Select another version to compare with version {selectedVersion.version}
                </div>
            )}

            {/* Version List */}
            {versions.length === 0 ? (
                <div className="text-center py-12">
                    <Clock className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">
                        No version history yet
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {versions.map((version, index) => (
                        <div
                            key={version._id}
                            className={`group p-4 border-2 rounded-xl transition-all ${selectedVersion?._id === version._id
                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${index === 0
                                                ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                                                : 'bg-gray-100 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400'
                                            }`}>
                                            {index === 0 ? 'Current' : `Version ${version.version}`}
                                        </span>
                                        <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {new Date(version.createdAt!).toLocaleString()}
                                        </span>
                                    </div>

                                    {version.createdBy && (
                                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mb-2">
                                            <User className="w-4 h-4" />
                                            <span>{version.createdBy}</span>
                                        </div>
                                    )}

                                    {version.changes && version.changes.length > 0 && (
                                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                            <strong>Changes:</strong> {version.changes.length} field(s) modified
                                            <div className="mt-1 flex flex-wrap gap-1">
                                                {version.changes.slice(0, 3).map((change, i) => (
                                                    <span
                                                        key={i}
                                                        className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs"
                                                    >
                                                        {change.field}
                                                    </span>
                                                ))}
                                                {version.changes.length > 3 && (
                                                    <span className="px-2 py-0.5 text-xs text-gray-500">
                                                        +{version.changes.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleCompare(version)}
                                        className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                                        title={selectedVersion ? 'Compare with selected' : 'Select for comparison'}
                                    >
                                        <GitCompare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                    </button>
                                    {index !== 0 && (
                                        <>
                                            <button
                                                onClick={() => handleRestore(version._id!)}
                                                className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                                title="Restore this version"
                                            >
                                                <RotateCcw className="w-4 h-4 text-green-600 dark:text-green-400" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(version._id!)}
                                                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="Delete this version"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
