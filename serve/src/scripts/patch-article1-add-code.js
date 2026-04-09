import { db } from '../db.js'

function hasCodeBlock(blocks) {
  return Array.isArray(blocks) && blocks.some((b) => b && b.type === 'code')
}

function insertCodeBlockAfterFirstParagraph(blocks) {
  const codeBlock = {
    type: 'code',
    title: '示例：容器查询让布局“自适应容器”',
    lang: 'CSS',
    code: `/* 当卡片容器宽度 >= 560px 时切换为两列布局 */
.card {
  container-type: inline-size;
}

.card__body {
  display: grid;
  gap: 16px;
}

@container (min-width: 560px) {
  .card__body {
    grid-template-columns: 1fr 240px;
    align-items: start;
  }
}`,
  }

  if (!Array.isArray(blocks) || blocks.length === 0) return [codeBlock]

  // 优先插在第一段普通段落(p)之后；否则插在 lead/h2 之后的第一个位置；再否则尾部追加
  const pIdx = blocks.findIndex((b) => b?.type === 'p')
  if (pIdx >= 0) return [...blocks.slice(0, pIdx + 1), codeBlock, ...blocks.slice(pIdx + 1)]

  const leadIdx = blocks.findIndex((b) => b?.type === 'lead')
  if (leadIdx >= 0) return [...blocks.slice(0, leadIdx + 1), codeBlock, ...blocks.slice(leadIdx + 1)]

  const h2Idx = blocks.findIndex((b) => b?.type === 'h2')
  if (h2Idx >= 0) return [...blocks.slice(0, h2Idx + 1), codeBlock, ...blocks.slice(h2Idx + 1)]

  return [...blocks, codeBlock]
}

function main() {
  const row = db.prepare('SELECT id, blocks_json FROM articles WHERE id = ?').get(1)
  if (!row) {
    console.error('[patch] 未找到 id=1 的文章')
    process.exitCode = 1
    return
  }

  let blocks = []
  try {
    blocks = JSON.parse(row.blocks_json || '[]')
  } catch {
    blocks = []
  }

  if (hasCodeBlock(blocks)) {
    console.log('[patch] id=1 已存在 code 块，跳过')
    return
  }

  const next = insertCodeBlockAfterFirstParagraph(blocks)
  db.prepare('UPDATE articles SET blocks_json = ? WHERE id = ?').run(JSON.stringify(next), 1)
  console.log('[patch] 已为 id=1 插入 code 块')
}

main()

