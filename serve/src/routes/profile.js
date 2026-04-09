import fs from 'fs'
import path from 'path'
import { Router } from 'express'
import multer from 'multer'
import { db, dataDir } from '../db.js'
import { requireAuth } from '../middleware/auth.js'
import { rowToUser } from '../util/userDto.js'

const router = Router()

const avatarsDir = path.join(dataDir, 'uploads', 'avatars')
fs.mkdirSync(avatarsDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, avatarsDir)
  },
  filename: (req, file, cb) => {
    const uid = req.user.sub
    const ext = path.extname(file.originalname).toLowerCase()
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
    const safe = allowed.includes(ext) ? ext : '.jpg'
    cb(null, `user-${uid}-${Date.now()}${safe}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /^image\/(jpeg|pjpeg|png|webp|gif)$/i.test(file.mimetype)
    cb(null, ok)
  },
})

function unlinkAvatarIfStored(relPath) {
  if (!relPath || typeof relPath !== 'string' || !relPath.startsWith('/uploads/avatars/')) return
  const base = path.resolve(dataDir, 'uploads', 'avatars')
  const abs = path.normalize(path.join(dataDir, relPath.replace(/^\//, '')))
  if (!abs.startsWith(base) || !fs.existsSync(abs)) return
  try {
    fs.unlinkSync(abs)
  } catch {
    /* ignore */
  }
}

router.get('/', requireAuth, (req, res) => {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.sub)
  if (!row) {
    return res.status(404).json({ error: '用户不存在' })
  }
  res.json({ user: rowToUser(row) })
})

router.patch('/', requireAuth, (req, res) => {
  const displayName = String(req.body?.displayName ?? '').trim()
  const signature = String(req.body?.signature ?? '').trim()

  if (displayName.length < 2) {
    return res.status(400).json({ error: '显示名称至少 2 个字符' })
  }
  if (displayName.length > 40) {
    return res.status(400).json({ error: '显示名称不超过 40 个字符' })
  }
  if (signature.length > 200) {
    return res.status(400).json({ error: '签名不超过 200 个字符' })
  }

  db.prepare('UPDATE users SET display_name = ?, signature = ? WHERE id = ?').run(
    displayName,
    signature,
    req.user.sub,
  )
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.sub)
  res.json({ user: rowToUser(row) })
})

router.post('/avatar', requireAuth, upload.single('avatar'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '请上传 JPG / PNG / WebP / GIF 图片，最大 2MB' })
  }
  const userId = req.user.sub
  const prev = db.prepare('SELECT avatar_path FROM users WHERE id = ?').get(userId)
  const relPath = `/uploads/avatars/${req.file.filename}`
  db.prepare('UPDATE users SET avatar_path = ? WHERE id = ?').run(relPath, userId)
  if (prev?.avatar_path) {
    unlinkAvatarIfStored(prev.avatar_path)
  }
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(userId)
  res.json({ user: rowToUser(row) })
})

export default router
