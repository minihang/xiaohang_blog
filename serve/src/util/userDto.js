import { dicebearAvatar } from './avatar.js'

/** @param {Record<string, unknown> | null | undefined} row users 表一行 */
export function rowToUser(row) {
  if (!row) return null
  const display =
    row.display_name != null && String(row.display_name).trim() !== ''
      ? String(row.display_name).trim()
      : row.username
  let avatar
  if (row.avatar_path != null && String(row.avatar_path).trim() !== '') {
    avatar = String(row.avatar_path).trim()
  } else {
    avatar = dicebearAvatar(row.username)
  }
  return {
    id: row.id,
    username: row.username,
    name: display,
    role: row.role,
    avatar,
    signature: row.signature || '',
  }
}
