const MS_MIN = 60_000
const MS_HOUR = 60 * MS_MIN
const MS_DAY = 24 * MS_HOUR

export function formatTimeLabel(iso) {
  if (!iso) return ''
  const t = new Date(iso).getTime()
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
