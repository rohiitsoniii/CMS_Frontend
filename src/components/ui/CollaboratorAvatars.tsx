
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface Editor {
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    color: string;
  };
}

export function CollaboratorAvatars({ editors }: { editors: Editor[] }) {
  if (!editors || editors.length === 0) return null;

  return (
    <div className="flex items-center -space-x-2">
      <TooltipProvider>
        {editors.slice(0, 4).map((editor) => (
          <Tooltip key={editor.userId}>
            <TooltipTrigger asChild>
              <Avatar className="w-8 h-8 border-2 border-white dark:border-gray-900 shadow-sm transition-transform hover:scale-110 hover:z-10 cursor-default" style={{ borderColor: editor.user.color }}>
                <AvatarFallback style={{ backgroundColor: editor.user.color, color: '#fff' }} className="text-xs">
                  {editor.user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p>{editor.user.name} is editing</p>
            </TooltipContent>
          </Tooltip>
        ))}
        {editors.length > 4 && (
          <Avatar className="w-8 h-8 border-2 border-white dark:border-gray-900 shadow-sm bg-gray-100 dark:bg-gray-800">
            <AvatarFallback className="text-xs font-medium text-gray-500 dark:text-gray-400">
              +{editors.length - 4}
            </AvatarFallback>
          </Avatar>
        )}
      </TooltipProvider>
    </div>
  );
}
