// ============================================
// DATE UTIL — Работа с датами
// ============================================

/**
 * Форматирование даты
 */
export const formatDate = (date: Date | string | number, format: string = 'ISO'): string => {
  const d = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date

  if (isNaN(d.getTime())) {
    throw new Error('Invalid date')
  }

  switch (format) {
    case 'ISO':
      return d.toISOString()
    case 'UTC':
      return d.toUTCString()
    case 'DATE':
      return d.toDateString()
    case 'TIME':
      return d.toTimeString()
    case 'LOCALE':
      return d.toLocaleString()
    case 'LOCALE_DATE':
      return d.toLocaleDateString()
    case 'LOCALE_TIME':
      return d.toLocaleTimeString()
    default:
      return d.toISOString()
  }
}

/**
 * Получение текущего timestamp
 */
export const getTimestamp = (): string => {
  return new Date().toISOString()
}

/**
 * Получение длительности
 */
export const getDuration = (start: number): number => {
  return Date.now() - start
}

/**
 * Форматирование длительности
 */
export const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}

/**
 * Парсинг даты
 */
export const parseDate = (date: string | number | Date): Date => {
  if (date instanceof Date) return date
  if (typeof date === 'number') return new Date(date)
  return new Date(date)
}

/**
 * Проверка, является ли дата валидной
 */
export const isValidDate = (date: any): boolean => {
  if (!date) return false
  const d = new Date(date)
  return !isNaN(d.getTime())
}

/**
 * Получение начала дня
 */
export const startOfDay = (date: Date): Date => {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Получение конца дня
 */
export const endOfDay = (date: Date): Date => {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

/**
 * Разница между датами в днях
 */
export const daysBetween = (date1: Date, date2: Date): number => {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  const diff = Math.abs(d2.getTime() - d1.getTime())
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/**
 * Добавление дней к дате
 */
export const addDays = (date: Date, days: number): Date => {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

/**
 * Добавление месяцев к дате
 */
export const addMonths = (date: Date, months: number): Date => {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

/**
 * Добавление лет к дате
 */
export const addYears = (date: Date, years: number): Date => {
  const d = new Date(date)
  d.setFullYear(d.getFullYear() + years)
  return d
}