/**
 * PaperMarkdown: 面向本项目 blocks 的“类 Markdown”语法。
 *
 * 支持块类型：lead（页面显示为“二级标题”）/ h2 / p / quote / checklist / img / code / a
 *
 * 语法约定（尽量宽松，方便手写）：
 * - Lead（页面显示为“二级标题”）:
 *   # text
 *   （兼容旧语法：:::lead ... :::）
 * - H2:
 *   ## text
 * - Quote:
 *   > line1
 *   > line2
 * - Checklist（连续的 - 开头行会合并为一个 checklist 块；列表项文本可包含 **加粗** 与 `行内代码`）：
 *   - 列表项1
 *   - 列表项2（含 **加粗** 与 `code`）
 * - Image:
 *   ![alt](https://example.com/a.png)   alt 会被忽略（展示时本项目不渲染 alt）
 * - Link（a 块）:
 *   [text](https://example.com)
 * - Code:
 *   ```lang
 *   code...
 *   ```
 *   lang 可省略，省略则自动检测高亮
 * - Paragraph:
 *   其他文本按空行分段；同一段内如出现换行，会拆成多个 p（每行一个段落）
 */

function isBlank(line) {
  return !line || /^\s*$/.test(line)
}

function stripPrefix(line, prefix) {
  return line.startsWith(prefix) ? line.slice(prefix.length) : line
}

function parseChecklistLine(raw) {
  // "- item text" (item text may contain **bold** and `code`)
  const line = raw.replace(/^\s*-\s+/, '')
  const text = String(line || '').trim()
  if (!text) return null
  return text
}

export function parsePaperMarkdown(src) {
  const input = typeof src === 'string' ? src.replace(/\r\n/g, '\n') : ''
  const lines = input.split('\n')
  const blocks = []

  let i = 0
  while (i < lines.length) {
    const line = lines[i]

    if (isBlank(line)) {
      i += 1
      continue
    }

    // # text  -> lead (single-line)
    // （注意：这里用 # 映射成 lead，是本项目定制语法，不是标准 Markdown 的 h1）
    if (/^\s*#(?!#)/.test(line)) {
      const m = line.trim().match(/^#\s+(.*)$/)
      if (m) {
        const text = String(m[1] || '').trim()
        if (text) blocks.push({ type: 'lead', text })
        i += 1
        continue
      }
    }

    // :::lead ... :::
    if (/^\s*:::\s*lead\s*$/.test(line)) {
      i += 1
      const buf = []
      while (i < lines.length && !/^\s*:::\s*$/.test(lines[i])) {
        buf.push(lines[i])
        i += 1
      }
      if (i >= lines.length) {
        return { error: '二级标题块缺少结束标记 :::', blocks: [] }
      }
      i += 1 // skip closing :::
      const text = buf.join('\n').trim()
      if (text) blocks.push({ type: 'lead', text })
      continue
    }

    // ```lang ... ```
    if (/^\s*```/.test(line)) {
      const lang = stripPrefix(line.trim(), '```').trim()
      i += 1
      const buf = []
      while (i < lines.length && !/^\s*```/.test(lines[i])) {
        buf.push(lines[i])
        i += 1
      }
      if (i >= lines.length) {
        return { error: 'Code 块缺少结束标记 ```', blocks: [] }
      }
      i += 1 // skip closing ```
      const code = buf.join('\n')
      blocks.push({ type: 'code', ...(lang ? { lang } : {}), code })
      continue
    }

    // ## text
    if (/^\s*##/.test(line)) {
      const m = line.trim().match(/^##\s+(.*)$/)
      if (m) {
        const text = String(m[1] || '').trim()
        if (text) blocks.push({ type: 'h2', text })
        i += 1
        continue
      }
    }

    // Quote: consecutive > lines
    if (/^\s*>/.test(line)) {
      const buf = []
      while (i < lines.length && /^\s*>/.test(lines[i])) {
        buf.push(stripPrefix(lines[i].replace(/^\s*/, ''), '>').replace(/^\s*/, ''))
        i += 1
      }
      const text = buf.join('\n').trim()
      if (text) blocks.push({ type: 'quote', text })
      continue
    }

    // Image: ![alt](src)
    const img = line.trim().match(/^!\[[^\]]*\]\(([^)]+)\)\s*$/)
    if (img) {
      const src = String(img[1] || '').trim()
      if (src) blocks.push({ type: 'img', src })
      i += 1
      continue
    }

    // Link block: [text](href)
    const link = line.trim().match(/^\[([^\]\n]+)\]\(([^)\n]+)\)\s*$/)
    if (link) {
      const text = String(link[1] || '').trim()
      const href = String(link[2] || '').trim()
      if (text && href) blocks.push({ type: 'a', text, href })
      i += 1
      continue
    }

    // Checklist: consecutive "- " lines (unordered list)
    if (/^\s*-\s+/.test(line)) {
      const items = []
      while (i < lines.length && /^\s*-\s+/.test(lines[i]) && !isBlank(lines[i])) {
        const parsed = parseChecklistLine(lines[i])
        if (parsed) items.push(parsed)
        else {
          // 不可解析时，当成普通段落处理：打断 checklist
          break
        }
        i += 1
      }
      if (items.length > 0) {
        blocks.push({ type: 'checklist', items })
        continue
      }
      // fallthrough to paragraph
    }

    // Paragraph: gather until blank line
    const buf = []
    while (i < lines.length && !isBlank(lines[i])) {
      // 碰到下一个块的显式起始，则结束段落
      const t = lines[i].trim()
      if (
        /^\s*#(?!#)\s+/.test(t) ||
        /^\s*:::\s*lead\s*$/.test(t) ||
        /^\s*```/.test(t) ||
        /^\s*##/.test(t) ||
        /^\s*>/.test(t) ||
        /^!\[[^\]]*\]\(([^)]+)\)\s*$/.test(t) ||
        /^\[([^\]\n]+)\]\(([^)\n]+)\)\s*$/.test(t)
      ) {
        break
      }
      buf.push(lines[i])
      i += 1
    }
    // 处理段落内换行：将多行拆成多个 p
    const ps = buf
      .join('\n')
      .split('\n')
      .map((s) => String(s || '').trim())
      .filter(Boolean)
    for (const text of ps) blocks.push({ type: 'p', text })
  }

  if (blocks.length === 0) {
    return { error: '正文至少包含一个内容块', blocks: [] }
  }
  return { blocks }
}

export function blocksToPaperMarkdown(blocks) {
  const list = Array.isArray(blocks) ? blocks : []
  const out = []
  for (const b of list) {
    if (!b || typeof b !== 'object') continue

    if (b.type === 'lead') {
      out.push(`# ${String(b.text || '').trim()}`)
      out.push('')
      continue
    }

    if (b.type === 'h2') {
      out.push(`## ${String(b.text || '').trim()}`)
      out.push('')
      continue
    }

    if (b.type === 'quote') {
      const lines = String(b.text || '').split('\n')
      for (const l of lines) out.push(`> ${l}`)
      out.push('')
      continue
    }

    if (b.type === 'checklist') {
      const items = Array.isArray(b.items) ? b.items : []
      for (const it of items) {
        if (Array.isArray(it)) {
          // 兼容旧数据：[label, rest]
          const strong = String(it?.[0] || '').trim()
          const rest = String(it?.[1] || '').trim()
          if (!strong && !rest) continue
          if (strong) out.push(`- **${strong}** ${rest}`.trimEnd())
          else out.push(`- ${rest}`.trimEnd())
          continue
        }
        const text = String(it || '').trim()
        if (!text) continue
        out.push(`- ${text}`.trimEnd())
      }
      out.push('')
      continue
    }

    if (b.type === 'img') {
      const src = String(b.src || '').trim()
      if (src) out.push(`![](${src})`)
      out.push('')
      continue
    }

    if (b.type === 'a') {
      const text = String(b.text || '').trim()
      const href = String(b.href || '').trim()
      if (text && href) out.push(`[${text}](${href})`)
      out.push('')
      continue
    }

    if (b.type === 'code') {
      const lang = String(b.lang || '').trim()
      out.push(`\`\`\`${lang}`)
      out.push(String(b.code || ''))
      out.push('```')
      out.push('')
      continue
    }

    if (b.type === 'p') {
      // 兼容旧数据：若 p 内包含换行，则序列化为多个段落（空行分隔）
      const ps = String(b.text || '')
        .split('\n')
        .map((s) => String(s || '').trim())
        .filter(Boolean)
      for (const p of ps) {
        out.push(p)
        out.push('')
      }
      continue
    }
  }

  // 去掉末尾多余空行
  while (out.length > 0 && isBlank(out[out.length - 1])) out.pop()
  return out.join('\n')
}

