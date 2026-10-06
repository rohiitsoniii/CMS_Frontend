import React, { useEffect, useState, MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Settings, FileText, Blocks, LayoutDashboard, 
  FolderKanban, Image, BarChart3, CreditCard, ScrollText, 
  Bot, Brain, GitBranch, Calendar, Mail, Globe, 
  Key, Webhook, KeyRound, Users, DatabaseBackup, 
  Archive, Trash2, Sun, Moon, HelpCircle
} from 'lucide-react';

interface CommandItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path?: string;
  action?: () => void;
}

interface CommandGroup {
  group: string;
  items: CommandItem[];
}

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  // Toggle the menu when ⌘K or Ctrl+K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const commands: CommandGroup[] = [
    {
      group: 'Workspace & Core',
      items: [
        { label: 'Overview Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { label: 'All Projects', icon: FolderKanban, path: '/dashboard/projects' },
        { label: 'Content Models (Schema)', icon: Blocks, path: '/dashboard/content-types' },
        { label: 'Content Entries', icon: FileText, path: '/dashboard/content' },
        { label: 'Media Library', icon: Image, path: '/dashboard/media' },
        { label: 'Analytics Dashboard', icon: BarChart3, path: '/dashboard/analytics' },
        { label: 'Billing & Plans', icon: CreditCard, path: '/dashboard/billing' },
        { label: 'Audit Logs', icon: ScrollText, path: '/dashboard/audit-logs' },
      ]
    },
    {
      group: 'AI & Automation',
      items: [
        { label: 'AI RAG Bots', icon: Bot, path: '/dashboard/rag-bots' },
        { label: 'Knowledge Base', icon: Brain, path: '/dashboard/chatbot/knowledge' },
        { label: 'Workflow Automations', icon: GitBranch, path: '/dashboard/workflows' },
        { label: 'Content Scheduling', icon: Calendar, path: '/dashboard/schedules' },
        { label: 'Email Templates', icon: Mail, path: '/dashboard/email-templates' },
      ]
    },
    {
      group: 'SEO Suite',
      items: [
        { label: 'SEO Command Center', icon: Globe, path: '/dashboard/seo' },
        { label: 'Site Audit Engine', icon: Globe, path: '/dashboard/seo/audit' },
        { label: 'Keyword Tracker', icon: Search, path: '/dashboard/seo/keywords' },
        { label: 'Sitemap Configuration', icon: Globe, path: '/dashboard/seo/sitemap' },
        { label: 'Robots.txt Editor', icon: FileText, path: '/dashboard/seo/robots' },
      ]
    },
    {
      group: 'Settings & Security',
      items: [
        { label: 'API Keys', icon: Key, path: '/dashboard/api-keys' },
        { label: 'Webhooks & Events', icon: Webhook, path: '/dashboard/webhooks' },
        { label: 'Environment Variables', icon: KeyRound, path: '/dashboard/settings/environment' },
        { label: 'Team Members & Roles', icon: Users, path: '/dashboard/team' },
        { label: 'Backup & Restore', icon: DatabaseBackup, path: '/dashboard/backup' },
        { label: 'Archive', icon: Archive, path: '/dashboard/archive' },
        { label: 'Trash Purge', icon: Trash2, path: '/dashboard/trash' },
        { label: 'Project Settings', icon: Settings, path: '/dashboard/settings' },
        { label: 'Support & Help', icon: HelpCircle, path: '/dashboard/support' },
      ]
    },
    {
      group: 'Actions',
      items: [
        { 
          label: 'Toggle Theme (Dark / Light)', 
          icon: document.documentElement.classList.contains('dark') ? Sun : Moon, 
          action: () => {
            const isDark = document.documentElement.classList.contains('dark');
            if (isDark) {
              document.documentElement.classList.remove('dark');
              localStorage.setItem('theme', 'light');
            } else {
              document.documentElement.classList.add('dark');
              localStorage.setItem('theme', 'dark');
            }
          }
        }
      ]
    }
  ];

  const filteredCommands = commands.map(group => ({
    ...group,
    items: group.items.filter(item => 
      item.label.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(group => group.items.length > 0);

  const flatItems = filteredCommands.flatMap(g => g.items);

  // Keyboard navigation up/down/enter
  useEffect(() => {
    const handleNavigation = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, flatItems.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + flatItems.length) % Math.max(1, flatItems.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = flatItems[selectedIndex];
        if (selected) {
          executeCommand(selected);
        }
      }
    };

    window.addEventListener('keydown', handleNavigation);
    return () => window.removeEventListener('keydown', handleNavigation);
  }, [open, selectedIndex, flatItems]);

  const executeCommand = (item: CommandItem) => {
    setOpen(false);
    setSearch('');
    if (item.action) {
      item.action();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  if (!open) return null;

  let globalIndexCounter = -1;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200" 
      onClick={() => setOpen(false)}
    >
      <div 
        className="w-full max-w-2xl bg-card text-card-foreground border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh]" 
        onClick={(e: MouseEvent) => e.stopPropagation()}
      >
        <div className="flex items-center border-b border-border px-4 py-3 bg-muted/20">
          <Search className="w-5 h-5 text-muted-foreground mr-3 shrink-0" />
          <input 
            autoFocus 
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or jump to feature..." 
            className="flex-1 bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground text-sm font-medium"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 bg-muted border border-border rounded px-2 h-6 text-[10px] font-mono text-muted-foreground">
            ESC
          </kbd>
        </div>

        <div className="overflow-y-auto p-2 space-y-3">
          {filteredCommands.length === 0 && (
            <div className="py-12 text-sm text-center text-muted-foreground">
              No matching commands or pages found.
            </div>
          )}

          {filteredCommands.map(group => (
            <div key={group.group} className="space-y-1">
              <div className="px-3 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                {group.group}
              </div>
              <div className="space-y-0.5">
                {group.items.map(item => {
                  globalIndexCounter++;
                  const isHighlighted = globalIndexCounter === selectedIndex;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => executeCommand(item)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left cursor-pointer ${
                        isHighlighted 
                          ? 'bg-primary text-primary-foreground shadow-sm' 
                          : 'text-foreground hover:bg-muted/60'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </span>
                      {item.path && (
                        <span className={`text-[10px] font-mono opacity-60 ${isHighlighted ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                          {item.path}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-border px-4 py-2 bg-muted/30 flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>Use <kbd className="font-mono bg-muted px-1 rounded border border-border">↑</kbd> <kbd className="font-mono bg-muted px-1 rounded border border-border">↓</kbd> to navigate</span>
            <span><kbd className="font-mono bg-muted px-1 rounded border border-border">↵</kbd> to select</span>
          </div>
          <span><kbd className="font-mono bg-muted px-1 rounded border border-border">ESC</kbd> to close</span>
        </div>
      </div>
    </div>
  );
}

export default CommandMenu;
