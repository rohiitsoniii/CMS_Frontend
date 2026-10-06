/**
 * Plugin Registry - Register all available plugins here
 */

import { pluginRegistry } from './core/PluginSystem';
import { colorPickerPlugin } from './examples/ColorPickerPlugin';
import { markdownEditorPlugin } from './examples/MarkdownEditorPlugin';

// Register all plugins
export function registerAllPlugins() {
  // Field Plugins
  pluginRegistry.register(colorPickerPlugin);
  pluginRegistry.register(markdownEditorPlugin);
  
  // Add more plugins here as they are created
  
  console.log(`✅ Registered ${pluginRegistry.getAll().length} plugins`);
}

// Export for use in app
export { pluginRegistry } from './core/PluginSystem';
export { PluginProvider, usePlugins } from './core/PluginProvider';
export type { Plugin, PluginType, FieldPlugin, WidgetPlugin } from './core/PluginSystem';
