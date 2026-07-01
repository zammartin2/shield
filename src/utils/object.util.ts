// ============================================
// OBJECT UTIL — Работа с объектами
// ============================================

export const deepMerge = (...objects: any[]): any => {
  const result: any = {}
  
  for (const obj of objects) {
    if (!obj) continue
    
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
          result[key] = deepMerge(result[key] || {}, obj[key])
        } else {
          result[key] = obj[key]
        }
      }
    }
  }
  
  return result
}

export const getByPath = (obj: any, path: string): any => {
  if (!obj || !path) return undefined
  
  const parts = path.split('.')
  let current = obj
  
  for (const part of parts) {
    if (current === null || current === undefined) return undefined
    if (typeof current !== 'object') return undefined
    current = current[part]
  }
  
  return current
}

export const setByPath = (obj: any, path: string, value: any): void => {
  if (!obj || !path) return
  
  const parts = path.split('.')
  let current = obj
  
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]
    if (!current[part] || typeof current[part] !== 'object') {
      current[part] = {}
    }
    current = current[part]
  }
  
  current[parts[parts.length - 1]] = value
}

export const deleteByPath = (obj: any, path: string): void => {
  if (!obj || !path) return
  
  const parts = path.split('.')
  let current = obj
  
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]
    if (!current[part] || typeof current[part] !== 'object') {
      return
    }
    current = current[part]
  }
  
  delete current[parts[parts.length - 1]]
}

export const hasByPath = (obj: any, path: string): boolean => {
  return getByPath(obj, path) !== undefined
}

export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj))
}

export const isEmpty = (obj: any): boolean => {
  if (obj === null || obj === undefined) return true
  if (typeof obj === 'string') return obj.trim() === ''
  if (Array.isArray(obj)) return obj.length === 0
  if (typeof obj === 'object') return Object.keys(obj).length === 0
  return false
}

export const pick = (obj: Record<string, any>, keys: string[]): Record<string, any> => {
  const result: Record<string, any> = {}
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })
  return result
}

export const omit = (obj: Record<string, any>, keys: string[]): Record<string, any> => {
  const result = { ...obj }
  keys.forEach(key => {
    delete result[key]
  })
  return result
}

export const objectToQueryString = (obj: Record<string, any>): string => {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) {
      params.append(key, String(value))
    }
  }
  return params.toString()
}

export const queryStringToObject = (query: string): Record<string, string> => {
  const params = new URLSearchParams(query)
  const result: Record<string, string> = {}
  for (const [key, value] of params) {
    result[key] = value
  }
  return result
}

export const cleanObject = <T extends Record<string, any>>(obj: T): T => {
  const result = { ...obj }
  for (const key in result) {
    if (result[key] === undefined || result[key] === null) {
      delete result[key]
    }
  }
  return result
}

export const sortKeys = (obj: Record<string, any>): Record<string, any> => {
  const keys = Object.keys(obj).sort()
  const result: Record<string, any> = {}
  for (const key of keys) {
    result[key] = obj[key]
  }
  return result
}
