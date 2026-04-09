import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { db } from '../db.js'
import { signToken } from '../middleware/auth.js'
import { rowToUser } from '../util/userDto.js'
import { PRODUCTION_ADMIN_USERNAME } from '../seed.js'

const router = Router()

function permissionsForRole(role) {
  if (role === 'admin') {
    return ['message:write', 'message:delete', 'article:read', 'article:write', 'article:delete', 'admin']
  }
  return ['message:write', 'article:read']
}

router.post('/register', (req, res) => {
  const username = String(req.body?.username || '').trim()
  const password = String(req.body?.password || '')
  const signature = String(req.body?.signature || '').trim()

  if (username.length < 2) {
    return res.status(400).json({ error: '用户名至少 2 个字符' })
  }
  if (password.length < 4) {
    return res.status(400).json({ error: '密码至少 4 位' })
  }
  if (username.toLowerCase() === 'admin' || username === PRODUCTION_ADMIN_USERNAME) {
    return res.status(400).json({ error: '该用户名不可用' })
  }

  const hash = bcrypt.hashSync(password, 10)
  try {
    const info = db
      .prepare(
        `INSERT INTO users (username, password_hash, signature, role, display_name) VALUES (@username, @hash, @signature, 'user', @username)`,
      )
      .run({ username, hash, signature })
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid)
    const user = rowToUser(row)
    const token = signToken({ sub: user.id, role: user.role, name: user.name })
    return res.json({
      token,
      user,
      permissions: permissionsForRole(user.role),
    })
  } catch (e) {
    if (String(e.message).includes('UNIQUE')) {
      return res.status(400).json({ error: '用户名已存在' })
    }
    console.error(e)
    return res.status(500).json({ error: '注册失败' })
  }
})

router.post('/login', (req, res) => {
  const username = String(req.body?.username || '').trim()
  const password = String(req.body?.password || '')

  const row = db.prepare('SELECT * FROM users WHERE username = ?').get(username)
  if (!row || !bcrypt.compareSync(password, row.password_hash)) {
    return res.status(401).json({ error: '用户名或密码错误' })
  }
  const user = rowToUser(row)
  const token = signToken({ sub: user.id, role: user.role, name: user.name })
  res.json({
    token,
    user,
    permissions: permissionsForRole(user.role),
  })
})

export default router
