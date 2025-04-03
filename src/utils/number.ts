/**
 * 生成随机负整数（无参数版本）
 * @returns 随机生成的负整数，范围 (-∞, -1]
 */
export function getRandomNegativeInt(): number {
  return -Math.floor(Math.random() * Number.MAX_SAFE_INTEGER) - 1;
}
