import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditAPI } from '@/services/api';
import { AuditLogsSkeleton } from '@/components/skeletons';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AuditLogsPage() {
    const [page, setPage] = useState(1);
    const [action, setAction] = useState<string>('all');
    const [resourceType, setResourceType] = useState<string>('all');

    const { data, isLoading } = useQuery({
        queryKey: ['audit-logs', page, action, resourceType],
        queryFn: () => auditAPI.getLogs({
            page,
            limit: 20,
            action: action === 'all' ? undefined : action,
            resourceType: resourceType === 'all' ? undefined : resourceType,
        }),
    });

    const logs = data?.data.data.logs || [];
    const pagination = data?.data.data.pagination;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
                <p className="text-muted-foreground">
                    View and filter system activity logs.
                </p>
            </div>

            <div className="flex gap-4">
                <div className="w-[200px]">
                    <Select value={action} onValueChange={setAction}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by Action" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Actions</SelectItem>
                            <SelectItem value="content.create">Content Create</SelectItem>
                            <SelectItem value="content.update">Content Update</SelectItem>
                            <SelectItem value="content.publish">Content Publish</SelectItem>
                            <SelectItem value="content.archive">Content Archive</SelectItem>
                            <SelectItem value="project.update">Project Update</SelectItem>
                            <SelectItem value="project.create">Project Create</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="w-[200px]">
                    <Select value={resourceType} onValueChange={setResourceType}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by Resource" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Resources</SelectItem>
                            <SelectItem value="Content">Content</SelectItem>
                            <SelectItem value="Project">Project</SelectItem>
                            <SelectItem value="User">User</SelectItem>
                            <SelectItem value="APIKey">APIKey</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Activity History</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <AuditLogsSkeleton />
                    ) : (
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm caption-bottom text-sm text-left">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Timestamp</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Actor</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Action</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Resource</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {logs.map((log: any) => (
                                        <tr key={log._id} className="border-b transition-colors hover:bg-muted/50">
                                            <td className="p-4 align-middle whitespace-nowrap">
                                                {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm:ss')}
                                            </td>
                                            <td className="p-4 align-middle">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{log.actor.name}</span>
                                                    <span className="text-xs text-muted-foreground">{log.actor.email}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle">
                                                <Badge variant="outline">{log.action}</Badge>
                                            </td>
                                            <td className="p-4 align-middle">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{log.resource.type}</span>
                                                    <span className="text-xs text-muted-foreground truncate max-w-[150px]" title={log.resource.name || log.resource.id}>
                                                        {log.resource.name || log.resource.id}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle text-muted-foreground font-mono text-xs">
                                                <div className="truncate max-w-[200px]" title={JSON.stringify(log.metadata, null, 2)}>
                                                    {log.metadata ? JSON.stringify(log.metadata) : '-'}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {logs.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="p-4 text-center text-muted-foreground">
                                                No logs found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {pagination && (
                                <div className="flex items-center justify-end space-x-2 py-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                    >
                                        Previous
                                    </Button>
                                    <div className="text-sm text-muted-foreground">
                                        Page {page} of {pagination.pages}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(p => p + 1)}
                                        disabled={page >= pagination.pages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
