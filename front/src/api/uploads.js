import { api } from './http'

/**
 * 上传文章图片（用于编辑页粘贴板图片）
 * @param {File} file
 * @returns {Promise<{ url: string }>}
 */
export async function uploadArticleImage(file) {
  const fd = new FormData()
  fd.append('image', file)
  const { data } = await api.post('/api/uploads/article-image', fd)
  return data
}

