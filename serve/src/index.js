import 'dotenv/config'
import path from 'path'
import express from 'express'
import cors from 'cors'
import { initSchema, dataDir } from './db.js'
import { runSeed } from './seed.js'
import authRoutes from './routes/auth.js'
import articlesRoutes from './routes/articles.js'
import messagesRoutes from './routes/messages.js'
import profileRoutes from './routes/profile.js'
import uploadsRoutes from './routes/uploads.js'

initSchema()
await runSeed()

const app = express()
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
)
app.use(express.json({ limit: '512kb' }))
app.use('/uploads', express.static(path.join(dataDir, 'uploads')))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'blog-serve' })
})

app.use('/api/auth', authRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/uploads', uploadsRoutes)
app.use('/api/articles', articlesRoutes)
app.use('/api/messages', messagesRoutes)

const PORT = Number(process.env.PORT || 3001)
app.listen(PORT, () => {
  console.log(`blog-serve 已启动: http://localhost:${PORT}`)
})
