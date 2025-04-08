/**
 * 生成随机数 | Generate random numbers
 * @returns 随机生成的负整数，范围 (-∞, -1]
 */
export function getRandomInt(): number {
  return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER) + 1;
}
