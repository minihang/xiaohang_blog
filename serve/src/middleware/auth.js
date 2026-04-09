import jwt from 'jsonwebtoken'

function getSecret() {
  const s = process.env.JWT_SECRET
  if (!s || s.length < 8) {
    console.warn('[auth] JWT_SECRET 未设置或过短，使用开发默认（切勿用于生产）')
    return 'blog-dev-secret-change-me'
  }
  return s
}

export function signToken(payload) {
  return jwt.sign(payload, getSecret(), { expiresIn: '7d' })
}

export function verifyToken(token) {
  return jwt.verify(token, getSecret())
}

export function optionalAuth(req, _res, next) {
  req.user = null
  const h = req.headers.authorization
  if (h?.startsWith('Bearer ')) {
    try {
      req.user = verifyToken(h.slice(7))
    } catch {
      /* 忽略无效 token，按游客发留言 */
    }
  }
  next()
}

export function requireAuth(req, res, next) {
  const h = req.headers.authorization
  if (!h?.startsWith('Bearer ')) {
    return res.status(401).json({ error: '请先登录' })
  }
  try {
    req.user = verifyToken(h.slice(7))
    next()
  } catch {
    return res.status(401).json({ error: '登录已失效，请重新登录' })
  }
}

export function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '需要管理员权限' })
    }
    next()
  })
}
