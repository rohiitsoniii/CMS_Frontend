import { useState } from 'react';
import { usePlugins } from '../../plugins/core/PluginProvider';
import { Plugin, PluginType } from '../../plugins/core/PluginSystem';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Puzzle,
    Search,
    Check,
    X,
    Settings,
    ExternalLink,
} from 'lucide-react';

const PLUGIN_TYPE_LABELS: Record<PluginType, string> = {
    field: 'Field Type',
    widget: 'Widget',
    integration: 'Integration',
    transformer: 'Transformer',
    validator: 'Validator',
    action: 'Action',
};

const PLUGIN_TYPE_COLORS: Record<PluginType, string> = {
    field: 'bg-blue-100 text-blue-800',
    widget: 'bg-purple-100 text-purple-800',
    integration: 'bg-green-100 text-green-800',
    transformer: 'bg-yellow-100 text-yellow-800',
    validator: 'bg-red-100 text-red-800',
    action: 'bg-indigo-100 text-indigo-800',
};

export function PluginManagerPage() {
    const { plugins, enabledPlugins, enablePlugin, disablePlugin } = usePlugins();
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState<PluginType | 'all'>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'enabled' | 'disabled'>('all');

    // Filter plugins
    const filteredPlugins = plugins.filter((plugin: Plugin) => {
        const matchesSearch =
            plugin.metadata.name.toLowerCase().includes(search.toLowerCase()) ||
            plugin.metadata.description.toLowerCase().includes(search.toLowerCase());

        const matchesType = filterType === 'all' || plugin.metadata.type === filterType;

        const matchesStatus =
            filterStatus === 'all' ||
            (filterStatus === 'enabled' && plugin.config.enabled) ||
            (filterStatus === 'disabled' && !plugin.config.enabled);

        return matchesSearch && matchesType && matchesStatus;
    });

    const handleTogglePlugin = async (plugin: Plugin) => {
        try {
            if (plugin.config.enabled) {
                await disablePlugin(plugin.metadata.id);
            } else {
                await enablePlugin(plugin.metadata.id);
            }
        } catch (error) {
            console.error('Error toggling plugin:', error);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <Puzzle className="w-8 h-8 text-indigo-600" />
                    <h1 className="text-3xl font-bold">Plugin Manager</h1>
                </div>
                <p className="text-gray-600">
                    Extend your CMS with custom plugins. Add new field types, widgets, and integrations.
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="p-4">
                    <div className="text-sm text-gray-500">Total Plugins</div>
                    <div className="text-2xl font-bold">{plugins.length}</div>
                </Card>
                <Card className="p-4">
                    <div className="text-sm text-gray-500">Enabled</div>
                    <div className="text-2xl font-bold text-green-600">{enabledPlugins.length}</div>
                </Card>
                <Card className="p-4">
                    <div className="text-sm text-gray-500">Disabled</div>
                    <div className="text-2xl font-bold text-gray-400">
                        {plugins.length - enabledPlugins.length}
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="text-sm text-gray-500">Field Types</div>
                    <div className="text-2xl font-bold text-blue-600">
                        {plugins.filter((p: Plugin) => p.metadata.type === 'field').length}
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <Card className="p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search plugins..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Type Filter */}
                    <Select value={filterType} onValueChange={(value) => setFilterType(value as any)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            {Object.entries(PLUGIN_TYPE_LABELS).map(([type, label]) => (
                                <SelectItem key={type} value={type}>
                                    {label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Status Filter */}
                    <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as any)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="enabled">Enabled</SelectItem>
                            <SelectItem value="disabled">Disabled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </Card>

            {/* Plugin List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPlugins.map((plugin: Plugin) => (
                    <Card key={plugin.metadata.id} className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="text-3xl">{plugin.metadata.icon || '🔌'}</div>
                                <div>
                                    <h3 className="font-bold text-lg">{plugin.metadata.name}</h3>
                                    <p className="text-sm text-gray-500">v{plugin.metadata.version}</p>
                                </div>
                            </div>
                            <Switch
                                checked={plugin.config.enabled}
                                onCheckedChange={() => handleTogglePlugin(plugin)}
                            />
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-600 mb-4">{plugin.metadata.description}</p>

                        {/* Metadata */}
                        <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Type:</span>
                                <Badge className={PLUGIN_TYPE_COLORS[plugin.metadata.type]}>
                                    {PLUGIN_TYPE_LABELS[plugin.metadata.type]}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Author:</span>
                                <span className="font-medium">{plugin.metadata.author}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Status:</span>
                                <Badge variant={plugin.config.enabled ? 'default' : 'outline'}>
                                    {plugin.config.enabled ? (
                                        <>
                                            <Check className="w-3 h-3 mr-1" /> Enabled
                                        </>
                                    ) : (
                                        <>
                                            <X className="w-3 h-3 mr-1" /> Disabled
                                        </>
                                    )}
                                </Badge>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            {plugin.metadata.homepage && (
                                <Button variant="outline" size="sm" className="flex-1" asChild>
                                    <a href={plugin.metadata.homepage} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        Docs
                                    </a>
                                </Button>
                            )}
                            <Button variant="outline" size="sm" className="flex-1">
                                <Settings className="w-4 h-4 mr-2" />
                                Settings
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Empty State */}
            {filteredPlugins.length === 0 && (
                <div className="text-center py-12">
                    <Puzzle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No plugins found</h3>
                    <p className="text-gray-500">
                        Try adjusting your search or filters
                    </p>
                </div>
            )}
        </div>
    );
}
