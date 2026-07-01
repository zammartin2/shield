// ============================================
// PLUGINS MODULE — Обертка для PluginManager
// ============================================

import { PluginManager } from './PluginManager'
import { ConfigManager } from '../../core/ConfigManager'
import { Plugin } from '../../types'

export class PluginsModule {
  private manager: PluginManager

  constructor(config: ConfigManager) {
    this.manager = new PluginManager(config.get())
  }

  register(plugin: Plugin): void {
    this.manager.register(plugin)
  }

  unregister(name: string): void {
    this.manager.unregister(name)
  }

  async execute(req: any, res: any, context: any): Promise<void> {
    await this.manager.execute(req, res, context)
  }

  getPlugins(): string[] {
    return this.manager.getPlugins()
  }

  getPlugin(name: string): Plugin | undefined {
    return this.manager.getPlugin(name)
  }

  getMetrics(): any {
    return this.manager.getMetrics()
  }

  enable(name: string): void {
    this.manager.enable(name)
  }

  disable(name: string): void {
    this.manager.disable(name)
  }

  getStatus(name: string): any {
    return this.manager.getStatus(name)
  }
}
