function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function sanitizeHref(escapedHref) {
  const href = String(escapedHref || '').trim()
  if (!href) return '#'
  const decoded = href.replace(/&amp;/g, '&').trim().toLowerCase()
  if (decoded.startsWith('javascript:') || decoded.startsWith('data:')) return '#'
  return href
}

/**
 * 将文本中的行内 Markdown（支持 `code` / **bold** / [text](url)）渲染为 HTML（安全转义后再包裹）。
 * - 不支持跨行反引号
 * - 若反引号不成对，会按普通文本显示
 */
export function renderInlineMarkdown(text) {
  const raw = String(text ?? '')
  const escaped = escapeHtml(raw)

  // 先把 `code` 取出成占位，避免对 code 内部再做其他替换
  const codeParts = []
  const withPlaceholders = escaped.replace(/`([^`\n]+?)`/g, (_m, inner) => {
    const idx = codeParts.length
    codeParts.push(inner)
    return `@@CODE_${idx}@@`
  })

  // [text](url)
  const linkParts = []
  const withLinkPlaceholders = withPlaceholders.replace(/\[([^\]\n]+?)\]\(([^)\n]+?)\)/g, (_m, label, href) => {
    const idx = linkParts.length
    linkParts.push({ label, href: sanitizeHref(href) })
    return `@@LINK_${idx}@@`
  })

  // **bold**
  const withBold = withLinkPlaceholders.replace(/\*\*([^*\n]+?)\*\*/g, (_m, inner) => `<strong>${inner}</strong>`)

  // 恢复 link
  const withLinks = withBold.replace(/@@LINK_(\d+)@@/g, (_m, n) => {
    const part = linkParts[Number(n)]
    if (!part) return ''
    return `<a href="${part.href}" target="_blank" rel="noopener noreferrer">${part.label}</a>`
  })

  // 恢复 code
  return withLinks.replace(/@@CODE_(\d+)@@/g, (_m, n) => {
    const inner = codeParts[Number(n)] ?? ''
    return `<code class="paper-inline-code">${inner}</code>`
  })
}

// 兼容旧名字（之前只做了行内 code）
export const renderInlineCode = renderInlineMarkdown

