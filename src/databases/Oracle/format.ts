import { SqlValueCommon } from "../types";
import { formatToSqlValueCommon } from "../utils";

/**
 * 判断是否是 Oracle 函数调用的形式
 * 函数名：Oracle 函数名不区分大小写，通常不带括号（如 SYSDATE() 合法，SYSDATE 也合法）
 * @param str
 * @returns
 */
export function isOracleFunctionCall(str: string): boolean {
  // Oracle 函数调用可以有括号，也可以没有括号（如 SYSDATE() 或 SYSDATE）
  return /^[a-z_][a-z0-9_]*(\(.+\))?$/.test(str.toLowerCase());
}

/**
 * 格式化 Oracle 的数据类型
 * @param value
 * @param allowFuncAcll 是否允许函数调用的形式
 * @returns
 */
export function formatToSqlValueOracle(value: any, allowFuncAcll?: boolean): string {
  // 首先检查是否是调用 Oracle 函数
  if (allowFuncAcll && typeof value === "string" && isOracleFunctionCall(value)) {
    return value;
  }

  // 尝试通用格式化
  try {
    return formatToSqlValueCommon(value as SqlValueCommon);
  } catch (e) {
    // 如果通用格式化失败，继续处理 Oracle 特有类型
  }

  // 处理 Oracle 特有类型
  if (value instanceof Uint8Array) {
    return `HEX(${Buffer.from(value).toString("hex")})`; // 使用 HEX 函数处理二进制数据
  }

  if (value instanceof RegExp) {
    return `'${value.source}'`; // 将正则转换为其字符串形式
  }

  if (value instanceof Map) {
    return formatToSqlValueOracle(Object.fromEntries(value)); // 转换为 JSON 对象
  }

  if (value instanceof Set) {
    return formatToSqlValueOracle([...value]); // 转换为数组
  }

  // 处理 JSON 类型
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return `'${JSON.stringify(value)}'`; // Oracle JSON 类型直接使用 JSON 字符串
  }

  // 处理数组类型（Oracle 没有多维数组支持，直接转换为逗号分隔的字符串）
  if (Array.isArray(value)) {
    const formattedArray = value
      .map((v) => {
        // 特殊处理数组中的 null 值
        if (v === null) return "NULL";

        // 递归格式化每个元素
        const element = formatToSqlValueOracle(v);

        // 处理元素中的引号和转义
        return typeof v === "string" ? `'${element.replace(/'/g, "''")}'` : element;
      })
      .join(", ");

    return `(${formattedArray})`;
  }

  // 默认处理（不应执行到这里）
  throw new Error(`Unsupported Oracle type: ${typeof value}`);
}