
import { useQuery } from '@tanstack/react-query';
import { Link2, AlertTriangle, CheckCircle, FileText, ArrowRight, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ReferencePanelProps {
    contentId: string;
    projectId: string;
}

export function ReferencePanel({ contentId, projectId }: ReferencePanelProps) {
    // Fetch references (what this content links to)
    const { data: referencesData } = useQuery({
        queryKey: ['references', contentId],
        queryFn: async () => {
            const response = await fetch(
                `/api/v1/projects/${projectId}/content/${contentId}/references`
            );
            const result = await response.json();
            return result.data.references;
        },
    });

    // Fetch backlinks (what links to this content)
    const { data: backlinksData } = useQuery({
        queryKey: ['backlinks', contentId],
        queryFn: async () => {
            const response = await fetch(
                `/api/v1/projects/${projectId}/content/${contentId}/backlinks`
            );
            const result = await response.json();
            return result.data.backlinks;
        },
    });

    // Fetch usage stats
    const { data: usageData } = useQuery({
        queryKey: ['usage', contentId],
        queryFn: async () => {
            const response = await fetch(
                `/api/v1/projects/${projectId}/content/${contentId}/usage`
            );
            const result = await response.json();
            return result.data;
        },
    });

    // Check if can delete
    const { data: canDeleteData } = useQuery({
        queryKey: ['can-delete', contentId],
        queryFn: async () => {
            const response = await fetch(
                `/api/v1/projects/${projectId}/content/${contentId}/can-delete`
            );
            const result = await response.json();
            return result.data;
        },
    });

    return (
        <div className="space-y-4">
            {/* Usage Stats */}
            {usageData && (
                <Card className="p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Link2 className="w-5 h-5" />
                            Usage Statistics
                        </h3>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                {usageData.referencesCount}
                            </div>
                            <div className="text-sm text-gray-600">References</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                                {usageData.backlinksCount}
                            </div>
                            <div className="text-sm text-gray-600">Backlinks</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                                {usageData.usedIn.length}
                            </div>
                            <div className="text-sm text-gray-600">Content Types</div>
                        </div>
                    </div>

                    {usageData.usedIn.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                            <div className="text-sm text-gray-600 mb-2">Used in:</div>
                            <div className="flex flex-wrap gap-2">
                                {usageData.usedIn.map((type: string) => (
                                    <Badge key={type} variant="outline">
                                        {type}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>
            )}

            {/* Delete Warning */}
            {canDeleteData && !canDeleteData.canDelete && (
                <Alert variant="destructive">
                    <AlertTriangle className="w-4 h-4" />
                    <AlertDescription>
                        {canDeleteData.message}
                    </AlertDescription>
                </Alert>
            )}

            {canDeleteData && canDeleteData.canDelete && (
                <Alert>
                    <CheckCircle className="w-4 h-4" />
                    <AlertDescription>
                        This content can be safely deleted (no references found)
                    </AlertDescription>
                </Alert>
            )}

            {/* References and Backlinks Tabs */}
            <Tabs defaultValue="backlinks">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="backlinks">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Backlinks ({backlinksData?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="references">
                        <ArrowRight className="w-4 h-4 mr-2" />
                        References ({referencesData?.length || 0})
                    </TabsTrigger>
                </TabsList>

                {/* Backlinks Tab */}
                <TabsContent value="backlinks">
                    <Card className="p-4">
                        <div className="mb-4">
                            <h3 className="font-semibold text-sm text-gray-600">
                                Content that links to this item
                            </h3>
                        </div>

                        {backlinksData && backlinksData.length > 0 ? (
                            <div className="space-y-2">
                                {backlinksData.map((backlink: any, index: number) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <div className="font-medium">{backlink.contentName}</div>
                                                <div className="text-sm text-gray-500">
                                                    via <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">
                                                        {backlink.fieldName}
                                                    </code>
                                                </div>
                                            </div>
                                        </div>
                                        <Badge variant="outline">{backlink.contentType}</Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Link2 className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                <p>No backlinks found</p>
                                <p className="text-sm">This content is not referenced by any other content</p>
                            </div>
                        )}
                    </Card>
                </TabsContent>

                {/* References Tab */}
                <TabsContent value="references">
                    <Card className="p-4">
                        <div className="mb-4">
                            <h3 className="font-semibold text-sm text-gray-600">
                                Content that this item links to
                            </h3>
                        </div>

                        {referencesData && referencesData.length > 0 ? (
                            <div className="space-y-2">
                                {referencesData.map((reference: any, index: number) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <div className="font-medium">
                                                    {reference.toContentId}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    via <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">
                                                        {reference.fieldName}
                                                    </code>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Link2 className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                <p>No references found</p>
                                <p className="text-sm">This content doesn't reference any other content</p>
                            </div>
                        )}
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
