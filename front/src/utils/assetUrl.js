/** 将站内上传路径（如 /uploads/...）拼成完整 URL；外链原样返回 */
export function resolveAssetUrl(url) {
  if (!url || typeof url !== 'string') return ''
  if (/^https?:\/\//i.test(url)) return url
  const path = url.startsWith('/') ? url : `/${url}`
  const base = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
  return `${base}${path}`
}
