import { Router } from 'express'
import { db } from '../db.js'
import { optionalAuth, requireAdmin } from '../middleware/auth.js'
import { dicebearAvatar } from '../util/avatar.js'

const router = Router()

const CATEGORIES = new Set(['随笔', '科研', '开发'])
const VISIBILITIES = new Set(['public', 'login', 'admin'])

function parseBlocks(body) {
  let blocks = body?.blocks
  if (typeof blocks === 'string') {
    try {
      blocks = JSON.parse(blocks)
    } catch {
      return { error: '正文 blocks 不是合法 JSON' }
    }
  }
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return { error: '正文至少包含一个内容块' }
  }
  return { blocks }
}

function normalizePayload(body) {
  const category = String(body?.category || '').trim()
  const visibility = String(body?.visibility || 'public').trim()
  if (!CATEGORIES.has(category)) {
    return { error: '分类必须是：随笔、科研、开发' }
  }
  if (!VISIBILITIES.has(visibility)) {
    return { error: '可见性必须是：public、login 或 admin' }
  }
  const parsed = parseBlocks(body)
  if (parsed.error) return parsed
  const title = String(body?.title || '').trim()
  if (title.length < 1) return { error: '请填写标题' }
  if (title.length > 200) return { error: '标题过长' }
  const excerpt = String(body?.excerpt ?? '').trim()
  if (excerpt.length > 500) return { error: '摘要过长' }
  const DEFAULT_IMAGE_BY_CAT = {
    随笔: '/picture/suibi.png',
    科研: '/picture/keyan.jpg',
    开发: '/picture/kaifa.png',
  }
  const imageUrl = String(body?.imageUrl ?? '').trim() || DEFAULT_IMAGE_BY_CAT[category] || ''
  const heroImage = String(body?.heroImage ?? '').trim() || '/picture/xiangqing.png'
  return {
    category,
    visibility,
    date_text: String(body?.date ?? body?.dateText ?? '').trim() || new Date().toISOString().slice(0, 10),
    title,
    excerpt,
    image_url: imageUrl,
    hero_image: heroImage,
    author_name: String(body?.authorName ?? '').trim() || '博主',
    author_published: String(body?.authorPublished ?? '').trim(),
    author_avatar: String(body?.authorAvatar ?? '').trim(),
    blocks_json: JSON.stringify(parsed.blocks),
  }
}

function mapListRow(row) {
  return {
    id: row.id,
    category: row.category,
    imageUrl: row.image_url,
    date: row.date_text,
    access: row.visibility,
    title: row.title,
    excerpt: row.excerpt || '',
    likeCount: Number(row.like_count) || 0,
  }
}

/** 与前端 articleAccess 一致：能否返回完整详情 */
function canReadArticleDetail(visibility, user) {
  if (visibility === 'public') return true
  if (visibility === 'login') return Boolean(user?.sub)
  if (visibility === 'admin') return user?.role === 'admin'
  return true
}

function mapDetailRow(row) {
  let blocks = []
  try {
    blocks = JSON.parse(row.blocks_json || '[]')
  } catch {
    blocks = []
  }
  const authorName = row.author_name || ''
  return {
    id: row.id,
    category: row.category,
    visibility: row.visibility,
    imageUrl: row.image_url,
    date: row.date_text,
    title: row.title,
    excerpt: row.excerpt || '',
    heroImage: row.hero_image,
    authorName,
    authorPublished: row.author_published,
    authorAvatar: row.author_avatar || dicebearAvatar(authorName || row.title || 'blog'),
    blocks,
    likeCount: Number(row.like_count) || 0,
  }
}

router.get('/', (req, res) => {
  const cat = req.query.category
  const normalized = !cat || cat === 'all' ? null : String(cat)

  let page = Number.parseInt(String(req.query.page || '1'), 10)
  let pageSize = Number.parseInt(String(req.query.pageSize || '6'), 10)
  if (!Number.isFinite(page) || page < 1) page = 1
  if (!Number.isFinite(pageSize) || pageSize < 1) pageSize = 6
  pageSize = Math.min(pageSize, 50)

  let total
  if (normalized) {
    total = db
      .prepare('SELECT COUNT(*) AS c FROM articles WHERE category = ?')
      .get(normalized).c
  } else {
    total = db.prepare('SELECT COUNT(*) AS c FROM articles').get().c
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1)
  if (page > totalPages) page = totalPages
  const offset = (page - 1) * pageSize

  let rows
  if (normalized) {
    rows = db
      .prepare(
        'SELECT * FROM articles WHERE category = ? ORDER BY id ASC LIMIT ? OFFSET ?',
      )
      .all(normalized, pageSize, offset)
  } else {
    rows = db
      .prepare('SELECT * FROM articles ORDER BY id ASC LIMIT ? OFFSET ?')
      .all(pageSize, offset)
  }
  res.json({
    list: rows.map(mapListRow),
    total,
    page,
    pageSize,
    totalPages,
  })
})

router.post('/', requireAdmin, (req, res) => {
  const row = normalizePayload(req.body)
  if (row.error) {
    return res.status(400).json({ error: row.error })
  }
  const info = db
    .prepare(
      `INSERT INTO articles (
        category, visibility, date_text, title, excerpt,
        image_url, hero_image, author_name, author_published, author_avatar, blocks_json
      ) VALUES (
        @category, @visibility, @date_text, @title, @excerpt,
        @image_url, @hero_image, @author_name, @author_published, @author_avatar, @blocks_json
      )`,
    )
    .run(row)
  const created = db.prepare('SELECT * FROM articles WHERE id = ?').get(info.lastInsertRowid)
  res.status(201).json(mapDetailRow(created))
})

/** 点赞 +1（可重复点）；需具备与阅读正文相同的权限 */
router.post('/:id/like', optionalAuth, (req, res) => {
  const id = Number(req.params.id)
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: '无效的文章 id' })
  }
  const row = db.prepare('SELECT id, visibility FROM articles WHERE id = ?').get(id)
  if (!row) {
    return res.status(404).json({ error: '文章不存在' })
  }
  if (!canReadArticleDetail(row.visibility, req.user)) {
    return res.status(403).json({ error: '无权点赞' })
  }
  db.prepare(
    'UPDATE articles SET like_count = COALESCE(like_count, 0) + 1 WHERE id = ?',
  ).run(id)
  const next = db.prepare('SELECT like_count FROM articles WHERE id = ?').get(id)
  res.json({ likeCount: Number(next?.like_count) || 0 })
})

router.get('/:id', optionalAuth, (req, res) => {
  const id = Number(req.params.id)
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: '无效的文章 id' })
  }
  const row = db.prepare('SELECT * FROM articles WHERE id = ?').get(id)
  if (!row) {
    return res.status(404).json({ error: '文章不存在' })
  }
  if (!canReadArticleDetail(row.visibility, req.user)) {
    return res.status(403).json({
      error: '无权阅读此文',
      visibility: row.visibility,
    })
  }
  res.json(mapDetailRow(row))
})

router.put('/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id)
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: '无效的文章 id' })
  }
  const existing = db.prepare('SELECT id FROM articles WHERE id = ?').get(id)
  if (!existing) {
    return res.status(404).json({ error: '文章不存在' })
  }
  const row = normalizePayload(req.body)
  if (row.error) {
    return res.status(400).json({ error: row.error })
  }
  db.prepare(
    `UPDATE articles SET
      category = @category,
      visibility = @visibility,
      date_text = @date_text,
      title = @title,
      excerpt = @excerpt,
      image_url = @image_url,
      hero_image = @hero_image,
      author_name = @author_name,
      author_published = @author_published,
      author_avatar = @author_avatar,
      blocks_json = @blocks_json
    WHERE id = @id`,
  ).run({ ...row, id })
  const updated = db.prepare('SELECT * FROM articles WHERE id = ?').get(id)
  res.json(mapDetailRow(updated))
})

router.delete('/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id)
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: '无效的文章 id' })
  }
  const info = db.prepare('DELETE FROM articles WHERE id = ?').run(id)
  if (info.changes === 0) {
    return res.status(404).json({ error: '文章不存在' })
  }
  res.json({ ok: true })
})

export default router
