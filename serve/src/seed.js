import bcrypt from 'bcryptjs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { db } from './db.js'
import { dicebearAvatar } from './util/avatar.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = '123456'

export function removeAllAdminUsers() {
  const r = db.prepare(`DELETE FROM users WHERE role = 'admin'`).run()
  if (r.changes > 0) console.log('[seed] 已删除管理员账号数量:', r.changes)
}

export function ensureAdmin() {
  const exists = db.prepare('SELECT 1 FROM users WHERE LOWER(username) = ?').get(ADMIN_USERNAME)
  if (exists) return
  db.prepare(
    `INSERT INTO users (username, password_hash, signature, role, display_name) VALUES (?, ?, ?, ?, ?)`,
  ).run(
    ADMIN_USERNAME,
    bcrypt.hashSync(ADMIN_PASSWORD, 10),
    '博客管理员',
    'admin',
    ADMIN_USERNAME,
  )
  console.log('[seed] 已创建管理员账号:', ADMIN_USERNAME)
}

export async function runSeed() {
  removeAllAdminUsers()
  ensureAdmin()

  const articleCount = db.prepare('SELECT COUNT(*) AS c FROM articles').get().c
  if (articleCount > 0) return

  console.log('[seed] 初始化文章与留言…')

  const articlesUrl = pathToFileURL(
    path.resolve(__dirname, '../../front/src/data/articles.js'),
  ).href
  const { articles } = await import(articlesUrl)

  const insertArticle = db.prepare(`
    INSERT INTO articles (
      id, category, visibility, date_text, title, excerpt,
      image_url, hero_image, author_name, author_published, author_avatar, blocks_json
    ) VALUES (
      @id, @category, @visibility, @date_text, @title, @excerpt,
      @image_url, @hero_image, @author_name, @author_published, @author_avatar, @blocks_json
    )
  `)

  const insertArticles = db.transaction((list) => {
    for (const a of list) {
      insertArticle.run({
        id: a.id,
        category: a.category,
        visibility: a.visibility,
        date_text: a.date,
        title: a.title,
        excerpt: a.excerpt || '',
        image_url: a.imageUrl,
        hero_image: a.heroImage,
        author_name: a.authorName,
        author_published: a.authorPublished,
        author_avatar: a.authorAvatar,
        blocks_json: JSON.stringify(a.blocks || []),
      })
    }
  })
  insertArticles(articles)

  const ins = db.prepare(
    `INSERT INTO messages (author_name, content, avatar_url, reply_to_id) VALUES (?, ?, ?, ?)`,
  )

  const seedMessages = [
    [
      '夏日的苏打水',
      '真的很喜欢你写的关于《数字极简主义》的那篇文章！最近也在尝试断舍离，感觉生活质量提高了不少。',
    ],
    ['暮光收藏家', '博主的配色方案很治愈，每次来这里都像被清风吹过。'],
    [
      '凌晨四点的键盘',
      '「开发手记」里那篇关于 Vite 迁移的笔记帮了大忙，我们团队上周照着做，构建时间少了一半。',
    ],
    ['纸鸢', '随笔分类的文字很温柔。想问博主平时用什么工具写长文？'],
    ['NorthStar', '科研札记里文献管理那篇，Zotero 插件列表我收藏了。'],
    ['小满', '路过留痕。网站加载很快，移动端侧栏隐藏也合理，继续加油～'],
    ['Echo_7', '承认「未完成」也是一种诚实。我也该把自己的半成品整理出来了。'],
    ['薄荷与代码', '留言板如果能支持 Markdown 就更好啦。整体已经很棒了。'],
  ]

  for (const [name, text] of seedMessages) {
    ins.run(name, text, dicebearAvatar(name), null)
  }
  ins.run(
    '远行客',
    '从朋友推荐来的，一口气读了三篇。排版和字体选择看得出用心。',
    dicebearAvatar('远行客'),
    null,
  )

  console.log('[seed] 完成：文章', articles.length, '、留言', seedMessages.length + 1)
}
