function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * 将文本中的行内 Markdown（目前仅支持 `code` 与 **bold**）渲染为 HTML（安全转义后再包裹）。
 * - 不支持跨行反引号
 * - 若反引号不成对，会按普通文本显示
 */
export function renderInlineMarkdown(text) {
  const raw = String(text ?? '')
  const escaped = escapeHtml(raw)

  // 先把 `code` 取出成占位，避免对 code 内部再做 bold 替换
  const codeParts = []
  const withPlaceholders = escaped.replace(/`([^`\n]+?)`/g, (_m, inner) => {
    const idx = codeParts.length
    codeParts.push(inner)
    return `@@CODE_${idx}@@`
  })

  // **bold**
  const withBold = withPlaceholders.replace(/\*\*([^*\n]+?)\*\*/g, (_m, inner) => `<strong>${inner}</strong>`)

  // 恢复 code
  return withBold.replace(/@@CODE_(\d+)@@/g, (_m, n) => {
    const inner = codeParts[Number(n)] ?? ''
    return `<code class="paper-inline-code">${inner}</code>`
  })
}

// 兼容旧名字（之前只做了行内 code）
export const renderInlineCode = renderInlineMarkdown

