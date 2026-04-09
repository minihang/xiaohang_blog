import { randomUUID } from 'node:crypto'
import { Router } from 'express'
import { db } from '../db.js'
import { optionalAuth, requireAdmin } from '../middleware/auth.js'
import { formatTimeLabel } from '../util/time.js'
import { dicebearAvatar } from '../util/avatar.js'

const router = Router()

const INITIAL_LIMIT = 4
const PAGE_LIMIT = 4

/** 列表展示用：登录用户跟用户表当前头像；游客用入库时的随机头像 */
function resolveMessageAvatar(row) {
  if (row.user_id != null) {
    if (row.user_account_name != null) {
      const p = row.user_avatar_path
      if (p != null && String(p).trim() !== '') {
        return String(p).trim()
      }
      return dicebearAvatar(row.user_account_name)
    }
  }
  if (row.avatar_url != null && String(row.avatar_url).trim() !== '') {
    return String(row.avatar_url).trim()
  }
  return dicebearAvatar(row.author_name)
}

function mapMessageRow(row) {
  return {
    id: String(row.id),
    authorName: row.author_name,
    content: row.content,
    timeLabel: formatTimeLabel(row.created_at),
    avatarUrl: resolveMessageAvatar(row),
    replyToId: row.reply_to_id != null ? String(row.reply_to_id) : null,
    replyToAuthorName: row.reply_to_author_name || null,
  }
}

router.get('/', (req, res) => {
  const cursor = Math.max(0, parseInt(String(req.query.cursor || '0'), 10) || 0)
  const limitParam = parseInt(String(req.query.limit || ''), 10)
  const pageSize =
    Number.isFinite(limitParam) && limitParam > 0
      ? Math.min(limitParam, 50)
      : cursor === 0
        ? INITIAL_LIMIT
        : PAGE_LIMIT

  const total = db.prepare('SELECT COUNT(*) as c FROM messages').get().c

  const rows = db
    .prepare(
      `
      SELECT m.*, p.author_name AS reply_to_author_name,
        u.avatar_path AS user_avatar_path,
        u.username AS user_account_name
      FROM messages m
      LEFT JOIN messages p ON m.reply_to_id = p.id
      LEFT JOIN users u ON m.user_id = u.id
      ORDER BY m.created_at DESC, m.id DESC
      LIMIT ? OFFSET ?
    `,
    )
    .all(pageSize, cursor)

  const list = rows.map(mapMessageRow)
  const nextCursor = cursor + list.length

  res.json({
    list,
    nextCursor,
    total,
  })
})

router.post('/', optionalAuth, (req, res) => {
  const authorName = String(req.body?.authorName || '').trim()
  const content = String(req.body?.content || '').trim()
  let replyToId = req.body?.replyToId
  if (replyToId === '' || replyToId === undefined || replyToId === null) {
    replyToId = null
  } else {
    replyToId = parseInt(String(replyToId), 10)
    if (Number.isNaN(replyToId)) replyToId = null
  }

  if (!authorName) {
    return res.status(400).json({ error: '请填写昵称' })
  }
  if (!content) {
    return res.status(400).json({ error: '请填写留言内容' })
  }

  const userId = req.user?.sub ?? null
  let avatarUrl
  if (userId != null) {
    const userRow = db.prepare('SELECT username, avatar_path FROM users WHERE id = ?').get(userId)
    if (userRow) {
      const path = userRow.avatar_path
      avatarUrl =
        path != null && String(path).trim() !== ''
          ? String(path).trim()
          : dicebearAvatar(userRow.username)
    } else {
      avatarUrl = dicebearAvatar(authorName)
    }
  } else {
    avatarUrl = dicebearAvatar(randomUUID())
  }

  const info = db
    .prepare(
      `
    INSERT INTO messages (author_name, content, avatar_url, reply_to_id, user_id)
    VALUES (?, ?, ?, ?, ?)
  `,
    )
    .run(authorName, content, avatarUrl, replyToId, userId)

  const id = info.lastInsertRowid
  const row = db
    .prepare(
      `
    SELECT m.*, p.author_name AS reply_to_author_name,
      u.avatar_path AS user_avatar_path,
      u.username AS user_account_name
    FROM messages m
    LEFT JOIN messages p ON m.reply_to_id = p.id
    LEFT JOIN users u ON m.user_id = u.id
    WHERE m.id = ?
  `,
    )
    .get(id)

  res.status(201).json(mapMessageRow(row))
})

router.delete('/:id', requireAdmin, (req, res) => {
  const id = parseInt(String(req.params.id), 10)
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: '无效的 id' })
  }
  const info = db.prepare('DELETE FROM messages WHERE id = ?').run(id)
  if (info.changes === 0) {
    return res.status(404).json({ error: '留言不存在' })
  }
  res.json({ ok: true })
})

export default router
