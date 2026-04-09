/**
 * 文章可见性：public 所有人 | login 仅登录用户 | admin 仅管理员
 * @param {'public' | 'login' | 'admin'} visibility
 * @param {{ isLoggedIn: boolean, isAdmin: boolean }} auth
 */
export function canReadArticleBody(visibility, auth) {
  if (visibility === 'public') return true
  if (visibility === 'login') return auth.isLoggedIn
  if (visibility === 'admin') return auth.isAdmin
  return false
}
