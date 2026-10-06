import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Plugin, PluginType, pluginRegistry } from './PluginSystem';

interface PluginContextType {
    plugins: Plugin[];
    enabledPlugins: Plugin[];
    getPlugin: (id: string) => Plugin | undefined;
    getPluginsByType: (type: PluginType) => Plugin[];
    enablePlugin: (id: string) => Promise<void>;
    disablePlugin: (id: string) => Promise<void>;
    executeHook: (hookName: string, ...args: any[]) => Promise<any[]>;
    refresh: () => void;
}

const PluginContext = createContext<PluginContextType | undefined>(undefined);

export function PluginProvider({ children }: { children: ReactNode }) {
    const [plugins, setPlugins] = useState<Plugin[]>([]);
    const [enabledPlugins, setEnabledPlugins] = useState<Plugin[]>([]);

    const refresh = () => {
        setPlugins(pluginRegistry.getAll());
        setEnabledPlugins(pluginRegistry.getEnabled());
    };

    useEffect(() => {
        refresh();
    }, []);

    const getPlugin = (id: string) => {
        return pluginRegistry.get(id);
    };

    const getPluginsByType = (type: PluginType) => {
        return pluginRegistry.getByType(type);
    };

    const enablePlugin = async (id: string) => {
        await pluginRegistry.enable(id);
        refresh();
    };

    const disablePlugin = async (id: string) => {
        await pluginRegistry.disable(id);
        refresh();
    };

    const executeHook = async (hookName: string, ...args: any[]) => {
        return pluginRegistry.executeHook(hookName, ...args);
    };

    return (
        <PluginContext.Provider
            value={{
                plugins,
                enabledPlugins,
                getPlugin,
                getPluginsByType,
                enablePlugin,
                disablePlugin,
                executeHook,
                refresh,
            }}
        >
            {children}
        </PluginContext.Provider>
    );
}

export function usePlugins() {
    const context = useContext(PluginContext);
    if (!context) {
        throw new Error('usePlugins must be used within PluginProvider');
    }
    return context;
}
