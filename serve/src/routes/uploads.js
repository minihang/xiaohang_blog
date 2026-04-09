import fs from 'fs'
import path from 'path'
import { Router } from 'express'
import multer from 'multer'
import { dataDir } from '../db.js'
import { requireAdmin } from '../middleware/auth.js'

const router = Router()

const articlesDir = path.join(dataDir, 'uploads', 'articles')
fs.mkdirSync(articlesDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, articlesDir)
  },
  filename: (req, file, cb) => {
    const uid = req.user?.sub ?? 'anon'
    const ext = path.extname(file.originalname).toLowerCase()
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
    const safe = allowed.includes(ext) ? ext : '.png'
    cb(null, `article-${uid}-${Date.now()}${safe}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /^image\/(jpeg|pjpeg|png|webp|gif)$/i.test(file.mimetype)
    cb(null, ok)
  },
})

// POST /api/uploads/article-image
// multipart/form-data: image=<file>
router.post('/article-image', requireAdmin, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '请上传 JPG / PNG / WebP / GIF 图片，最大 5MB' })
  }
  const url = `/uploads/articles/${req.file.filename}`
  res.json({ url })
})

export default router

