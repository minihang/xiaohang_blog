export type Id = string | number

export type UserRole = 'guest' | 'user' | 'admin'

export interface BlogUser {
  id?: Id
  username?: string
  name?: string
  role?: UserRole
  avatar?: string
  signature?: string
  [key: string]: unknown
}

export type ArticleVisibility = 'public' | 'login' | 'admin'
export type ArticleCategory = '随笔' | '科研' | '开发'

export interface ArticleBlock {
  type: 'lead' | 'h2' | 'p' | 'quote' | 'checklist' | 'img' | 'code' | 'a' | string
  text?: string
  href?: string
  src?: string
  caption?: string
  code?: string
  lang?: string
  title?: string
  bar?: string
  items?: Array<string | [string, string]>
}

export interface Article {
  forbidden?: false
  id: Id
  category: string
  visibility: ArticleVisibility
  title: string
  excerpt?: string
  imageUrl?: string
  heroImage?: string
  heroPill?: string
  date?: string
  readTime?: string
  authorName?: string
  authorPublished?: string
  authorAvatar?: string
  likeCount?: number
  isPinned?: boolean
  blocks?: ArticleBlock[]
  [key: string]: unknown
}

export interface ArticleListResponse {
  list: Article[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ForbiddenArticle extends Partial<Omit<Article, 'forbidden' | 'visibility'>> {
  forbidden: true
  visibility: Extract<ArticleVisibility, 'login' | 'admin'>
}

export type ArticleDetailResponse = Article | ForbiddenArticle | null

export interface Message {
  id: Id
  authorName: string
  content: string
  timeLabel?: string
  avatarUrl?: string
  replyToId?: Id | null
  replyToAuthorName?: string | null
  [key: string]: unknown
}

export interface MessageListResponse {
  list: Message[]
  nextCursor: number
  total: number
}

export interface AuthPayload {
  token: string
  user: BlogUser
  permissions?: string[]
}

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string }
