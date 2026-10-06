import { useEffect, useState, MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Settings, FileText, Blocks, LayoutDashboard } from 'lucide-react';

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = (path: string) => {
    setOpen(false);
    setSearch('');
    navigate(path);
  };

  if (!open) return null;

  const commands = [
    {
      group: 'Navigation',
      items: [
        { label: 'Go to Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { label: 'Manage Content', icon: FileText, path: '/dashboard/content' },
        { label: 'Schema Builder', icon: Blocks, path: '/dashboard/content-types' },
      ]
    },
    {
      group: 'Settings',
      items: [
        { label: 'Project Settings', icon: Settings, path: '/dashboard/settings' },
      ]
    }
  ];

  const filteredCommands = commands.map(group => ({
    ...group,
    items: group.items.filter(item => 
      item.label.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(group => group.items.length > 0);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/40 backdrop-blur-sm" 
      onClick={() => setOpen(false)}
    >
      <div 
        className="w-full max-w-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl overflow-hidden flex flex-col" 
        onClick={(e: MouseEvent) => e.stopPropagation()}
      >
        <div className="flex items-center border-b border-gray-100 dark:border-gray-800 px-4 py-3">
          <Search className="w-5 h-5 text-gray-400 mr-2" />
          <input 
            autoFocus 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a command or search..." 
            className="flex-1 bg-transparent border-0 outline-none text-gray-900 dark:text-white placeholder:text-gray-400 text-sm"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 h-6 text-[10px] font-medium text-gray-500">
            ESC
          </kbd>
        </div>

        <div className="max-h-[300px] overflow-y-auto p-2">
          {filteredCommands.length === 0 && (
            <div className="p-4 text-sm text-center text-gray-500">No results found.</div>
          )}

          {filteredCommands.map(group => (
            <div key={group.group} className="mb-2">
              <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {group.group}
              </div>
              <div className="space-y-1">
                {group.items.map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      onClick={() => runCommand(item.path)}
                      className="w-full flex items-center px-2 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
