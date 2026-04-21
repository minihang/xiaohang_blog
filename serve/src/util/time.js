const MS_MIN = 60_000
const MS_HOUR = 60 * MS_MIN
const MS_DAY = 24 * MS_HOUR

/**
 * SQLite `datetime('now')` 存的是 UTC，格式为 `YYYY-MM-DD HH:MM:SS`，没有时区后缀。
 * `new Date('...')` 会把这种字符串当本地时间解析，在中国（UTC+8）会少算约 8 小时，
 * 导致「刚刚」变成「8 小时前」。按 UTC 解析：补 `T` 与 `Z`。
 */
function parseStoredUtcMs(value) {
  if (!value) return NaN
  const s = String(value).trim()
  if (!s) return NaN
  if (/[zZ]$|[+-]\d{2}:?\d{2}$/.test(s)) {
    return new Date(s).getTime()
  }
  const normalized = s.includes('T') ? s : s.replace(' ', 'T')
  return new Date(`${normalized}Z`).getTime()
}

export function formatTimeLabel(iso) {
  if (!iso) return ''
  const t = parseStoredUtcMs(iso)
  if (Number.isNaN(t)) return ''
  const diff = Date.now() - t
  if (diff < MS_MIN) return '刚刚'
  if (diff < MS_HOUR) return `${Math.floor(diff / MS_MIN)} 分钟前`
  if (diff < MS_DAY) return `${Math.floor(diff / MS_HOUR)} 小时前`
  if (diff < MS_DAY * 2) return '昨天'
  if (diff < MS_DAY * 7) return `${Math.floor(diff / MS_DAY)} 天前`
  if (diff < MS_DAY * 14) return '1 周前'
  if (diff < MS_DAY * 30) return `${Math.floor(diff / MS_DAY)} 周前`
  if (diff < MS_DAY * 60) return '1 个月前'
  if (diff < MS_DAY * 365) return `${Math.floor(diff / MS_DAY)} 天前`
  return '更早'
}
