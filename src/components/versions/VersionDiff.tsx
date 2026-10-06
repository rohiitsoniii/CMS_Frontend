import { useState, useEffect } from 'react';
import { Plus, Minus, Edit, ArrowRight } from 'lucide-react';
import { versionService, VersionDiff as VersionDiffType } from '@/services/versionService';

interface VersionDiffProps {
    contentId?: string;
    version1Id: string;
    version2Id: string;
}

export function VersionDiff({ contentId, version1Id, version2Id }: VersionDiffProps) {
    const [diffs, setDiffs] = useState<VersionDiffType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDiff();
    }, [contentId, version1Id, version2Id]);

    const loadDiff = async () => {
        try {
            setLoading(true);
            const data = contentId
                ? await versionService.compareVersions(contentId, version1Id, version2Id)
                : await versionService.compareVersions(version1Id, version2Id);
            setDiffs(data);
        } catch (error) {
            console.error('Failed to load diff:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatValue = (value: any): string => {
        if (value === null || value === undefined) {
            return '(empty)';
        }
        if (typeof value === 'object') {
            return JSON.stringify(value, null, 2);
        }
        return String(value);
    };

    const getDiffIcon = (type: string) => {
        switch (type) {
            case 'added':
                return <Plus className="w-4 h-4" />;
            case 'removed':
                return <Minus className="w-4 h-4" />;
            case 'modified':
                return <Edit className="w-4 h-4" />;
            default:
                return null;
        }
    };

    const getDiffColor = (type: string) => {
        switch (type) {
            case 'added':
                return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300';
            case 'removed':
                return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300';
            case 'modified':
                return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300';
            default:
                return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Version Comparison
                </h3>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    {diffs.length} change{diffs.length !== 1 ? 's' : ''} found
                </span>
            </div>

            {/* No Changes */}
            {diffs.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-600 dark:text-gray-400">
                        No differences found between these versions
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {diffs.map((diff, index) => (
                        <div
                            key={index}
                            className={`p-4 border rounded-xl ${getDiffColor(diff.type)}`}
                        >
                            {/* Field Name */}
                            <div className="flex items-center gap-2 mb-3">
                                {getDiffIcon(diff.type)}
                                <span className="font-semibold capitalize">
                                    {diff.field}
                                </span>
                                <span className="text-xs px-2 py-0.5 bg-white dark:bg-gray-800 rounded">
                                    {diff.type}
                                </span>
                            </div>

                            {/* Value Comparison */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Old Value */}
                                {diff.type !== 'added' && (
                                    <div>
                                        <div className="text-xs font-medium mb-1 opacity-75">
                                            Previous Value
                                        </div>
                                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                                            <pre className="text-sm whitespace-pre-wrap break-words font-mono">
                                                {formatValue(diff.oldValue)}
                                            </pre>
                                        </div>
                                    </div>
                                )}

                                {/* Arrow */}
                                {diff.type === 'modified' && (
                                    <div className="hidden md:flex items-center justify-center">
                                        <ArrowRight className="w-6 h-6 opacity-50" />
                                    </div>
                                )}

                                {/* New Value */}
                                {diff.type !== 'removed' && (
                                    <div className={diff.type === 'added' ? 'md:col-span-2' : ''}>
                                        <div className="text-xs font-medium mb-1 opacity-75">
                                            {diff.type === 'added' ? 'Added Value' : 'New Value'}
                                        </div>
                                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                                            <pre className="text-sm whitespace-pre-wrap break-words font-mono">
                                                {formatValue(diff.newValue)}
                                            </pre>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Change Summary */}
                            <div className="mt-3 text-xs opacity-75">
                                {diff.type === 'added' && 'This field was added in the newer version'}
                                {diff.type === 'removed' && 'This field was removed in the newer version'}
                                {diff.type === 'modified' && 'This field was modified'}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Summary */}
            {diffs.length > 0 && (
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Change Summary
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {diffs.filter(d => d.type === 'added').length}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Added</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {diffs.filter(d => d.type === 'modified').length}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Modified</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                {diffs.filter(d => d.type === 'removed').length}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Removed</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
