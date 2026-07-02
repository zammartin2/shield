// ============================================
// IP UTIL — Работа с IP
// ============================================

/**
 * Получение IP клиента
 */
export const getClientIP = (req: any): string => {
  // Проверяем X-Forwarded-For
  const forwarded = req.headers?.['x-forwarded-for']
  if (forwarded) {
    const ips = forwarded.split(',')
    return ips[0].trim()
  }

  // Проверяем X-Real-IP
  const realIP = req.headers?.['x-real-ip']
  if (realIP) {
    return realIP
  }

  // Проверяем CloudFlare
  const cfIP = req.headers?.['cf-connecting-ip']
  if (cfIP) {
    return cfIP
  }

  // Проверяем другие заголовки
  const otherHeaders = [
    'x-cluster-client-ip',
    'true-client-ip',
    'x-forwarded',
    'forwarded-for',
    'forwarded'
  ]
  
  for (const header of otherHeaders) {
    const value = req.headers?.[header]
    if (value) {
      const ips = value.split(',').map((ip: string) => ip.trim())
      const validIP = ips.find((ip: string) => isValidIP(ip))
      if (validIP) return validIP
    }
  }

  // Используем стандартный IP
  return req.ip || 
    req.connection?.remoteAddress || 
    req.socket?.remoteAddress || 
    req.connection?.socket?.remoteAddress ||
    '0.0.0.0'
}

/**
 * Проверка на приватный IP
 */
export const isPrivateIP = (ip: string): boolean => {
  if (!ip) return false
  
  // IPv4 private ranges
  if (/^(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.|127\.|169\.254\.)/.test(ip)) {
    return true
  }

  // IPv6 private ranges
  if (/^(::1|fe80:|fc00:|fd00:|ff00:)/.test(ip)) {
    return true
  }

  return false
}

/**
 * Проверка на локальный IP
 */
export const isLocalIP = (ip: string): boolean => {
  if (!ip) return false
  return ip === '127.0.0.1' || 
    ip === '::1' || 
    ip === 'localhost' ||
    ip === '0.0.0.0'
}

/**
 * Проверка на валидный IP (IPv4 или IPv6)
 * ✅ ИСПРАВЛЕНО: Полная поддержка всех форматов IPv6
 */
export const isValidIP = (ip: string): boolean => {
  if (!ip) return false
  
  // IPv4
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
    const parts = ip.split('.').map(Number)
    return parts.every(p => p >= 0 && p <= 255)
  }

  // IPv6 полный (8 групп)
  if (/^([0-9a-f]{1,4}:){7}[0-9a-f]{1,4}$/i.test(ip)) {
    return true
  }

  // IPv6 ::1 (самый простой случай)
  if (/^::1$/.test(ip)) {
    return true
  }

  // IPv6 :: (unspecified)
  if (/^::$/.test(ip)) {
    return true
  }

  // IPv6 сжатый (fe80::1, 2001:db8::1)
  // Формат: группа:группа::группа
  if (/^([0-9a-f]{1,4}:){1,6}:[0-9a-f]{1,4}$/i.test(ip)) {
    return true
  }

  // IPv6 сжатый с несколькими :: (2001:db8::, ::1, ::ffff:192.0.2.1)
  // Формат: (группа:){0,7}::(группа:){0,7}группа
  if (/^([0-9a-f]{1,4}:){0,7}::([0-9a-f]{1,4}:){0,7}[0-9a-f]{1,4}$/i.test(ip)) {
    // Проверяем, что не слишком много групп
    const parts = ip.split(':').filter(p => p !== '')
    if (parts.length <= 8) {
      return true
    }
  }

  // IPv6 :: в начале (::1, ::ffff:192.0.2.1)
  if (/^::[0-9a-f]{1,4}(:[0-9a-f]{1,4}){0,6}$/i.test(ip)) {
    return true
  }

  // IPv6 :: в конце (2001:db8::)
  if (/^([0-9a-f]{1,4}:){1,7}::$/i.test(ip)) {
    return true
  }

  // IPv4-mapped IPv6 (::ffff:192.0.2.1)
  if (/^::ffff:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) {
    const parts = ip.split(':')[1].split('.')
    return parts.every(p => {
      const num = parseInt(p, 10)
      return num >= 0 && num <= 255
    })
  }

  // IPv6 с IPv4 адресом внутри (::192.0.2.1)
  if (/^::\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) {
    const parts = ip.split(':')[1].split('.')
    return parts.every(p => {
      const num = parseInt(p, 10)
      return num >= 0 && num <= 255
    })
  }

  return false
}

/**
 * Валидация IP (алиас для isValidIP для совместимости с тестами)
 */
export const validateIP = isValidIP

/**
 * Преобразование IPv4 в число
 */
export const ipToNumber = (ip: string): number => {
  if (!isValidIP(ip) || !isIPv4(ip)) {
    throw new Error('Invalid IPv4 address')
  }
  
  const parts = ip.split('.').map(Number)
  return ((parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3]) >>> 0
}

/**
 * Преобразование числа в IPv4
 */
export const numberToIP = (num: number): string => {
  if (num < 0 || num > 4294967295) {
    throw new Error('Number out of valid IPv4 range')
  }
  
  return [
    (num >>> 24) & 0xff,
    (num >>> 16) & 0xff,
    (num >>> 8) & 0xff,
    num & 0xff
  ].join('.')
}

/**
 * Проверка IP в CIDR
 */
export const isIPInCIDR = (ip: string, cidr: string): boolean => {
  if (!isValidIP(ip)) return false

  const [network, maskBits] = cidr.split('/')
  if (!maskBits) return ip === network

  const mask = parseInt(maskBits, 10)
  if (mask < 0 || mask > 32) return false

  const ipNum = ipToNumber(ip)
  const networkNum = ipToNumber(network)
  const maskNum = mask === 0 ? 0 : (~0 << (32 - mask)) >>> 0

  return (ipNum & maskNum) === (networkNum & maskNum)
}

/**
 * Получение маски из CIDR
 */
export const cidrToMask = (cidr: number): string => {
  if (cidr < 0 || cidr > 32) {
    throw new Error('CIDR must be between 0 and 32')
  }
  
  const mask = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0
  return numberToIP(mask)
}

/**
 * Проверка на публичный IP
 */
export const isPublicIP = (ip: string): boolean => {
  if (!ip || !isValidIP(ip)) return false
  return !isPrivateIP(ip) && !isLocalIP(ip)
}

/**
 * Получение информации об IP
 * ✅ ИСПРАВЛЕНО: Добавлено поле type для совместимости с тестами
 */
export const getIPInfo = (ip: string): {
  version: 4 | 6;
  type: 'private' | 'public';
  isPrivate: boolean;
  isLocal: boolean;
  isPublic: boolean;
  isValid: boolean;
} | null => {
  if (!ip) return null
  
  const valid = isValidIP(ip)
  if (!valid) return null
  
  const isIPv4Address = isIPv4(ip)
  const isIPv6Address = isIPv6(ip)
  
  if (!isIPv4Address && !isIPv6Address) return null
  
  const version = isIPv4Address ? 4 : 6
  const isPrivate = isPrivateIP(ip)
  const isLocal = isLocalIP(ip)
  const isPublic = isPublicIP(ip)
  
  return {
    version,
    type: isPrivate ? 'private' : 'public',
    isPrivate,
    isLocal,
    isPublic,
    isValid: true
  }
}

/**
 * Проверка на IPv4
 */
export const isIPv4 = (ip: string): boolean => {
  if (!ip) return false
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(ip) && 
    ip.split('.').every(p => {
      const num = parseInt(p, 10)
      return num >= 0 && num <= 255
    })
}

/**
 * Проверка на IPv6
 * ✅ ИСПРАВЛЕНО: Полная поддержка всех форматов IPv6
 */
export const isIPv6 = (ip: string): boolean => {
  if (!ip) return false
  
  // Полный IPv6 (8 групп)
  if (/^([0-9a-f]{1,4}:){7}[0-9a-f]{1,4}$/i.test(ip)) {
    return true
  }
  
  // ::1 (самый простой случай)
  if (/^::1$/.test(ip)) {
    return true
  }
  
  // :: (unspecified)
  if (/^::$/.test(ip)) {
    return true
  }
  
  // Сжатый IPv6 (fe80::1, 2001:db8::1)
  if (/^([0-9a-f]{1,4}:){1,6}:[0-9a-f]{1,4}$/i.test(ip)) {
    return true
  }
  
  // Сжатый IPv6 с несколькими :: (2001:db8::, ::1, ::ffff:192.0.2.1)
  if (/^([0-9a-f]{1,4}:){0,7}::([0-9a-f]{1,4}:){0,7}[0-9a-f]{1,4}$/i.test(ip)) {
    const parts = ip.split(':').filter(p => p !== '')
    // Должно быть не более 8 групп
    if (parts.length <= 8) {
      return true
    }
  }
  
  // :: в начале (::1, ::ffff:192.0.2.1)
  if (/^::[0-9a-f]{1,4}(:[0-9a-f]{1,4}){0,6}$/i.test(ip)) {
    return true
  }
  
  // :: в конце (2001:db8::)
  if (/^([0-9a-f]{1,4}:){1,7}::$/i.test(ip)) {
    return true
  }
  
  // IPv4-mapped IPv6 (::ffff:192.0.2.1)
  if (/^::ffff:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) {
    const parts = ip.split(':')[1].split('.')
    return parts.every(p => {
      const num = parseInt(p, 10)
      return num >= 0 && num <= 255
    })
  }
  
  // IPv6 с IPv4 адресом внутри (::192.0.2.1)
  if (/^::\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) {
    const parts = ip.split(':')[1].split('.')
    return parts.every(p => {
      const num = parseInt(p, 10)
      return num >= 0 && num <= 255
    })
  }
  
  return false
}

/**
 * Проверка IP в диапазоне (простой)
 */
export const isIPInRange = (ip: string, range: string): boolean => {
  if (!ip || !range) return false
  
  // Проверка CIDR
  if (range.includes('/')) {
    return isIPInCIDR(ip, range)
  }
  
  // Проверка диапазона (192.168.1.1-192.168.1.100)
  if (range.includes('-')) {
    const [start, end] = range.split('-')
    if (isValidIP(start) && isValidIP(end)) {
      const ipNum = ipToNumber(ip)
      const startNum = ipToNumber(start)
      const endNum = ipToNumber(end)
      return ipNum >= startNum && ipNum <= endNum
    }
  }
  
  // Проверка точного IP
  return ip === range
}

/**
 * Получение подсети из маски
 */
export const getNetworkAddress = (ip: string, subnetMask: string): string => {
  const ipNum = ipToNumber(ip)
  const maskNum = ipToNumber(subnetMask)
  const networkNum = ipNum & maskNum
  return numberToIP(networkNum)
}

/**
 * Получение широковещательного адреса
 */
export const getBroadcastAddress = (ip: string, subnetMask: string): string => {
  const ipNum = ipToNumber(ip)
  const maskNum = ipToNumber(subnetMask)
  const networkNum = ipNum & maskNum
  const broadcastNum = networkNum | (~maskNum >>> 0)
  return numberToIP(broadcastNum)
}

/**
 * Получение количества хостов в подсети
 */
export const getHostCount = (cidr: number): number => {
  if (cidr < 0 || cidr > 32) return 0
  return cidr === 32 ? 1 : Math.pow(2, 32 - cidr) - 2
}

/**
 * Объект-контейнер для удобного экспорта всех функций
 */
export const ipUtil = {
  getClientIP,
  isPrivateIP,
  isLocalIP,
  isValidIP,
  validateIP,
  isIPv4,
  isIPv6,
  ipToNumber,
  numberToIP,
  isIPInCIDR,
  cidrToMask,
  isPublicIP,
  getIPInfo,
  isIPInRange,
  getNetworkAddress,
  getBroadcastAddress,
  getHostCount
}

// ============================================
// Экспорт по умолчанию
// ============================================
export default ipUtil