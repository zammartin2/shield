// ============================================
// PLUGIN TYPES
// ============================================

export interface Plugin {
  name: string
  version?: string
  description?: string
  author?: string
  license?: string
  homepage?: string
  repository?: string
  config?: any
  enabled?: boolean
  
  onInit?: (context: PluginContext) => Promise<void> | void
  onStart?: (context: PluginContext) => Promise<void> | void
  onStop?: (context: PluginContext) => Promise<void> | void
  onDestroy?: (context: PluginContext) => Promise<void> | void
  onRequest?: (req: any, context: PluginContext) => Promise<any> | void
  onResponse?: (res: any, context: PluginContext) => Promise<void> | void
  onError?: (error: any, context: PluginContext) => Promise<void> | void
  middleware?: (req: any, res: any, next: any) => void
  api?: {
    [key: string]: (context: PluginContext, ...args: any[]) => any
  }
}

export interface PluginContext {
  getConfig: (name?: string) => any
  setConfig: (config: any) => void
  getShield: () => any
  getMetrics: () => any
  getServer: () => any
  getLogger: () => any
  log: (level: string, message: string, data?: any) => void
  getStorage: () => any
  set: (key: string, value: any) => void
  get: (key: string) => any
  delete: (key: string) => void
  registerRoutes: (prefix: string, router: any) => void
  on: (event: string, handler: (...args: any[]) => void) => void
  emit: (event: string, data: any) => void
  getUtils: () => any
  getTimestamp: () => Date
  generateId: () => string
}

export interface PluginResult {
  block?: boolean
  status?: number
  message?: string
  reason?: string
  headers?: Record<string, string>
  data?: any
}

export interface PluginStorage {
  get: (key: string) => Promise<any>
  set: (key: string, value: any) => Promise<void>
  delete: (key: string) => Promise<void>
  clear: () => Promise<void>
  getAll: () => Promise<Record<string, any>>
}
