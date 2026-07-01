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

  // Используем стандартный IP
  return req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || '0.0.0.0'
}

/**
 * Проверка на приватный IP
 */
export const isPrivateIP = (ip: string): boolean => {
  // IPv4
  if (/^(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.)/.test(ip)) {
    return true
  }

  // IPv6 (локальный)
  if (/^(::1|fe80:|fc00:|fd00:)/.test(ip)) {
    return true
  }

  return false
}

/**
 * Проверка на локальный IP
 */
export const isLocalIP = (ip: string): boolean => {
  return ip === '127.0.0.1' || ip === '::1' || ip === 'localhost'
}

/**
 * Проверка на валидный IP (IPv4 или IPv6)
 */
export const isValidIP = (ip: string): boolean => {
  // IPv4
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
    const parts = ip.split('.').map(Number)
    return parts.every(p => p >= 0 && p <= 255)
  }

  // IPv6
  if (/^([0-9a-f]{1,4}:){7}[0-9a-f]{1,4}$/i.test(ip)) {
    return true
  }

  // Сжатый IPv6
  if (/^([0-9a-f]{1,4}:){1,7}:$/i.test(ip)) {
    return true
  }
  if (/^::([0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4}$/i.test(ip)) {
    return true
  }

  return false
}

/**
 * Преобразование IPv4 в число
 */
export const ipToNumber = (ip: string): number => {
  const parts = ip.split('.').map(Number)
  return ((parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3]) >>> 0
}

/**
 * Преобразование числа в IPv4
 */
export const numberToIP = (num: number): string => {
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
  const mask = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0
  return numberToIP(mask)
}