import { useState } from 'react';
import { Bot, MessageSquare, Palette, Bell, Save, ToggleLeft, ToggleRight, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ChatbotSettings {
  enabled: boolean;
  name: string;
  greeting: string;
  fallbackMessage: string;
  position: 'bottom-right' | 'bottom-left';
  theme: 'light' | 'dark' | 'auto';
  avatar: string;
  quickActions: string[];
  collectEmail: boolean;
  showTypingIndicator: boolean;
  soundEnabled: boolean;
}

const DEFAULT_SETTINGS: ChatbotSettings = {
  enabled: true,
  name: 'Assistant',
  greeting: 'Hi there! 👋 How can I help you today?',
  fallbackMessage: "I'm sorry, I don't have information about that. Would you like to speak with a human?",
  position: 'bottom-right',
  theme: 'auto',
  avatar: '',
  quickActions: ['What are your hours?', 'Pricing info', 'Contact support'],
  collectEmail: false,
  showTypingIndicator: true,
  soundEnabled: false,
};

export function ChatbotSettingsPage() {
  const [settings, setSettings] = useState<ChatbotSettings>(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [newAction, setNewAction] = useState('');

  const update = <K extends keyof ChatbotSettings>(key: K, value: ChatbotSettings[K]) => {
    setSettings((s) => ({ ...s, [key]: value }));
  };

  const addQuickAction = () => {
    if (!newAction.trim()) return;
    update('quickActions', [...settings.quickActions, newAction.trim()]);
    setNewAction('');
  };

  const removeQuickAction = (index: number) => {
    update('quickActions', settings.quickActions.filter((_, i) => i !== index));
  };

  const saveSettings = async () => {
    setSaving(true);
    // Simulated save — wire to API: PUT /api/v1/projects/:id with { chatbot: settings }
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    toast.success('Chatbot settings saved!');
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!value)}
      className={`flex items-center gap-2 text-sm font-medium transition-colors ${value ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}
    >
      {value ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
      {value ? 'Enabled' : 'Disabled'}
    </button>
  );

  return (
    <div className="p-6 max-w-3xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chatbot Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Configure the embedded chat widget for your website
          </p>
        </div>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Enable / Disable */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Chatbot Widget</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Show chat widget on your public website</p>
            </div>
          </div>
          <Toggle value={settings.enabled} onChange={(v) => update('enabled', v)} />
        </div>
      </div>

      {settings.enabled && (
        <>
          {/* Identity */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 flex flex-col gap-4">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-500" /> Identity
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bot Name</label>
                <input
                  value={settings.name}
                  onChange={(e) => update('name', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Avatar URL</label>
                <input
                  value={settings.avatar}
                  onChange={(e) => update('avatar', e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Greeting Message</label>
              <input
                value={settings.greeting}
                onChange={(e) => update('greeting', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fallback Message</label>
              <textarea
                value={settings.fallbackMessage}
                onChange={(e) => update('fallbackMessage', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">Shown when no knowledge base match is found</p>
            </div>
          </div>

          {/* Appearance */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 flex flex-col gap-4">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-indigo-500" /> Appearance
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Position</label>
                <select
                  value={settings.position}
                  onChange={(e) => update('position', e.target.value as ChatbotSettings['position'])}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Theme</label>
                <select
                  value={settings.theme}
                  onChange={(e) => update('theme', e.target.value as ChatbotSettings['theme'])}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="auto">Auto (follows system)</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 flex flex-col gap-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Quick Action Buttons</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 -mt-2">Buttons shown to users when they open the chat</p>
            <div className="flex flex-col gap-2">
              {settings.quickActions.map((action, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={action}
                    onChange={(e) => {
                      const updated = [...settings.quickActions];
                      updated[i] = e.target.value;
                      update('quickActions', updated);
                    }}
                    className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={() => removeQuickAction(i)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-2 mt-1">
                <input
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addQuickAction()}
                  placeholder="Add a quick action..."
                  className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={addQuickAction}
                  className="p-2 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Behavior */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 flex flex-col gap-4">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-500" /> Behavior
            </h2>
            {[
              { key: 'collectEmail', label: 'Collect visitor email', desc: 'Ask for email before starting chat' },
              { key: 'showTypingIndicator', label: 'Show typing indicator', desc: 'Animated dots while bot is responding' },
              { key: 'soundEnabled', label: 'Sound notifications', desc: 'Play a sound on new message' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
                </div>
                <Toggle
                  value={settings[key as keyof ChatbotSettings] as boolean}
                  onChange={(v) => update(key as keyof ChatbotSettings, v as any)}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
