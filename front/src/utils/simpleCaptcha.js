/**
 * 前端简易验证码（算术题），用于减轻脚本刷留言；正式环境应配合服务端校验与限流。
 */

/**
 * @returns {{ a: number; b: number; answer: number; prompt: string }}
 */
export function createCaptchaChallenge() {
  const a = 1 + Math.floor(Math.random() * 9)
  const b = 1 + Math.floor(Math.random() * 9)
  return {
    a,
    b,
    answer: a + b,
    prompt: `${a} + ${b} = ?`,
  }
}

/**
 * @param {string | number} input
 * @param {number} expected
 */
export function checkCaptchaAnswer(input, expected) {
  const n = Number(String(input).trim())
  return Number.isFinite(n) && n === expected
}
