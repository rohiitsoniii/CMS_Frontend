/**
 * Plugin System - Core Types and Interfaces
 * 
 * This defines the plugin architecture for the Headless CMS.
 * Plugins can extend functionality without modifying core code.
 */

export type PluginType = 
  | 'field'           // Custom field types
  | 'widget'          // Dashboard widgets
  | 'integration'     // Third-party integrations
  | 'transformer'     // Data transformers
  | 'validator'       // Custom validators
  | 'action';         // Custom actions

export interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  type: PluginType;
  icon?: string;
  homepage?: string;
  repository?: string;
}

export interface PluginHooks {
  // Lifecycle hooks
  onInstall?: () => void | Promise<void>;
  onUninstall?: () => void | Promise<void>;
  onEnable?: () => void | Promise<void>;
  onDisable?: () => void | Promise<void>;
  
  // Content hooks
  beforeContentCreate?: (data: any) => any | Promise<any>;
  afterContentCreate?: (content: any) => void | Promise<void>;
  beforeContentUpdate?: (id: string, data: any) => any | Promise<any>;
  afterContentUpdate?: (content: any) => void | Promise<void>;
  beforeContentDelete?: (id: string) => void | Promise<void>;
  afterContentDelete?: (id: string) => void | Promise<void>;
  
  // Render hooks
  renderField?: (props: any) => React.ReactNode;
  renderWidget?: (props: any) => React.ReactNode;
}

export interface PluginConfig {
  enabled: boolean;
  settings?: Record<string, any>;
}

export interface Plugin {
  metadata: PluginMetadata;
  hooks: PluginHooks;
  config: PluginConfig;
  
  // Plugin-specific methods
  install?: () => void | Promise<void>;
  uninstall?: () => void | Promise<void>;
  configure?: (settings: Record<string, any>) => void | Promise<void>;
}

// Field Plugin Interface
export interface FieldPlugin extends Plugin {
  metadata: PluginMetadata & { type: 'field' };
  fieldType: string;
  defaultValue: any;
  validate?: (value: any) => boolean | string;
  transform?: (value: any) => any;
  component: React.ComponentType<FieldComponentProps>;
}

export interface FieldComponentProps {
  value: any;
  onChange: (value: any) => void;
  label: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  config?: Record<string, any>;
}

// Widget Plugin Interface
export interface WidgetPlugin extends Plugin {
  metadata: PluginMetadata & { type: 'widget' };
  component: React.ComponentType<WidgetComponentProps>;
  defaultSize?: { width: number; height: number };
  configurable?: boolean;
}

export interface WidgetComponentProps {
  config?: Record<string, any>;
  onConfigChange?: (config: Record<string, any>) => void;
}

// Integration Plugin Interface
export interface IntegrationPlugin extends Plugin {
  metadata: PluginMetadata & { type: 'integration' };
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  isConnected: () => boolean;
  sync?: (data: any) => Promise<void>;
}

// Plugin Registry
export class PluginRegistry {
  private static instance: PluginRegistry;
  private plugins: Map<string, Plugin> = new Map();
  private hooks: Map<string, ((...args: any[]) => any)[]> = new Map();

  private constructor() {}

  static getInstance(): PluginRegistry {
    if (!PluginRegistry.instance) {
      PluginRegistry.instance = new PluginRegistry();
    }
    return PluginRegistry.instance;
  }

  // Register a plugin
  register(plugin: Plugin): void {
    if (this.plugins.has(plugin.metadata.id)) {
      throw new Error(`Plugin ${plugin.metadata.id} is already registered`);
    }

    this.plugins.set(plugin.metadata.id, plugin);
    this.registerHooks(plugin);
    
    console.log(`✅ Plugin registered: ${plugin.metadata.name} v${plugin.metadata.version}`);
  }

  // Unregister a plugin
  unregister(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    this.unregisterHooks(plugin);
    this.plugins.delete(pluginId);
    
    console.log(`🗑️ Plugin unregistered: ${plugin.metadata.name}`);
  }

  // Get a plugin by ID
  get(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId);
  }

  // Get all plugins
  getAll(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  // Get plugins by type
  getByType(type: PluginType): Plugin[] {
    return this.getAll().filter(p => p.metadata.type === type);
  }

  // Get enabled plugins
  getEnabled(): Plugin[] {
    return this.getAll().filter(p => p.config.enabled);
  }

  // Enable a plugin
  async enable(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    plugin.config.enabled = true;
    
    if (plugin.hooks.onEnable) {
      await plugin.hooks.onEnable();
    }
    
    console.log(`✅ Plugin enabled: ${plugin.metadata.name}`);
  }

  // Disable a plugin
  async disable(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    plugin.config.enabled = false;
    
    if (plugin.hooks.onDisable) {
      await plugin.hooks.onDisable();
    }
    
    console.log(`⏸️ Plugin disabled: ${plugin.metadata.name}`);
  }

  // Execute a hook
  async executeHook(hookName: string, ...args: any[]): Promise<any[]> {
    const hookFunctions = this.hooks.get(hookName) || [];
    const results: any[] = [];

    for (const fn of hookFunctions) {
      try {
        const result = await fn(...args);
        results.push(result);
      } catch (error) {
        console.error(`Error executing hook ${hookName}:`, error);
      }
    }

    return results;
  }

  // Register hooks from a plugin
  private registerHooks(plugin: Plugin): void {
    Object.entries(plugin.hooks).forEach(([hookName, hookFn]) => {
      if (typeof hookFn === 'function') {
        if (!this.hooks.has(hookName)) {
          this.hooks.set(hookName, []);
        }
        this.hooks.get(hookName)!.push(hookFn);
      }
    });
  }

  // Unregister hooks from a plugin
  private unregisterHooks(plugin: Plugin): void {
    Object.keys(plugin.hooks).forEach(hookName => {
      const hookFunctions = this.hooks.get(hookName);
      if (hookFunctions) {
        this.hooks.set(
          hookName,
          hookFunctions.filter(fn => !Object.values(plugin.hooks).includes(fn))
        );
      }
    });
  }
}

// Export singleton instance
export const pluginRegistry = PluginRegistry.getInstance();
