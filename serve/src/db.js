import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const dataDir = path.join(__dirname, '../data')

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const dbPath = path.join(dataDir, 'blog.sqlite')
export const db = new Database(dbPath)

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

function migrateUsersColumns() {
  const cols = db.prepare('PRAGMA table_info(users)').all()
  const names = new Set(cols.map((c) => c.name))
  if (!names.has('display_name')) {
    db.exec('ALTER TABLE users ADD COLUMN display_name TEXT')
  }
  if (!names.has('avatar_path')) {
    db.exec('ALTER TABLE users ADD COLUMN avatar_path TEXT')
  }
}

function migrateArticlesLikeCount() {
  const cols = db.prepare('PRAGMA table_info(articles)').all()
  const names = new Set(cols.map((c) => c.name))
  if (!names.has('like_count')) {
    db.exec('ALTER TABLE articles ADD COLUMN like_count INTEGER NOT NULL DEFAULT 0')
  }
}

export function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      signature TEXT DEFAULT '',
      role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user','admin')),
      display_name TEXT,
      avatar_path TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      visibility TEXT NOT NULL DEFAULT 'public',
      date_text TEXT NOT NULL,
      title TEXT NOT NULL,
      excerpt TEXT,
      image_url TEXT,
      hero_image TEXT,
      read_time TEXT,
      author_name TEXT,
      author_published TEXT,
      author_avatar TEXT,
      blocks_json TEXT NOT NULL,
      like_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      author_name TEXT NOT NULL,
      content TEXT NOT NULL,
      avatar_url TEXT,
      reply_to_id INTEGER,
      user_id INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (reply_to_id) REFERENCES messages(id) ON DELETE SET NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
  `)
  migrateUsersColumns()
  migrateArticlesLikeCount()
}
