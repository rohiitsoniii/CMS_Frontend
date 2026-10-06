
import { useCollaboration } from '@/hooks/useCollaboration';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Users, Wifi, WifiOff } from 'lucide-react';

interface CollaborationIndicatorProps {
    contentId?: string;
    onContentChange?: (changes: any) => void;
}

export function CollaborationIndicator({
    contentId,
    onContentChange,
}: CollaborationIndicatorProps) {
    const { connected, editors } = useCollaboration({
        contentId,
        onContentChange,
        enabled: Boolean(contentId),
    });

    if (!contentId) return null;

    return (
        <div className="flex items-center gap-2">
            {/* Connection Status */}
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center gap-1">
                            {connected ? (
                                <Wifi className="w-4 h-4 text-green-500" />
                            ) : (
                                <WifiOff className="w-4 h-4 text-gray-400" />
                            )}
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        {connected ? 'Connected to collaboration server' : 'Disconnected'}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            {/* Active Editors */}
            {editors.length > 0 && (
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <div className="flex -space-x-2">
                        {editors.slice(0, 3).map((editor) => (
                            <TooltipProvider key={editor.userId}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Avatar
                                            className="w-8 h-8 border-2 border-white dark:border-gray-900"
                                            style={{ borderColor: editor.user.color }}
                                        >
                                            <AvatarFallback
                                                style={{ backgroundColor: editor.user.color }}
                                                className="text-white text-xs font-semibold"
                                            >
                                                {editor.user.name.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <div className="text-sm">
                                            <div className="font-semibold">{editor.user.name}</div>
                                            <div className="text-xs text-gray-500">{editor.user.email}</div>
                                            <div className="text-xs text-green-500 mt-1">● Editing now</div>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ))}
                        {editors.length > 3 && (
                            <Avatar className="w-8 h-8 border-2 border-white dark:border-gray-900">
                                <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
                                    +{editors.length - 3}
                                </AvatarFallback>
                            </Avatar>
                        )}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                        {editors.length} editing
                    </Badge>
                </div>
            )}
        </div>
    );
}

interface CollaborativeCursorProps {
    editors: Array<{
        userId: string;
        user: { name: string; color: string };
        cursorPosition?: number;
    }>;
}

export function CollaborativeCursors({ editors }: CollaborativeCursorProps) {
    return (
        <div className="relative">
            {editors.map((editor) => {
                if (!editor.cursorPosition) return null;

                return (
                    <div
                        key={editor.userId}
                        className="absolute pointer-events-none"
                        style={{
                            top: `${editor.cursorPosition}px`,
                            left: 0,
                        }}
                    >
                        <div
                            className="w-0.5 h-5 animate-pulse"
                            style={{ backgroundColor: editor.user.color }}
                        />
                        <div
                            className="text-xs px-2 py-1 rounded text-white whitespace-nowrap"
                            style={{ backgroundColor: editor.user.color }}
                        >
                            {editor.user.name}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

interface PresenceListProps {
    presence: Array<{
        socketId: string;
        user: { name: string; email: string; color: string };
        contentId?: string;
    }>;
}

export function PresenceList({ presence }: PresenceListProps) {
    if (presence.length === 0) {
        return (
            <div className="text-sm text-gray-500 text-center py-4">
                No one else is online
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Online ({presence.length})
            </div>
            {presence.map((p) => (
                <div key={p.socketId} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: p.user.color }}
                    />
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{p.user.name}</div>
                        <div className="text-xs text-gray-500 truncate">{p.user.email}</div>
                    </div>
                    {p.contentId && (
                        <Badge variant="outline" className="text-xs">
                            Editing
                        </Badge>
                    )}
                </div>
            ))}
        </div>
    );
}
