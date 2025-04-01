type ObjectType = "Object" | "Array" | "Date" | "RegExp" | "Promise" | "Proxy" | "Null" | "Undefined" | string; // 其他自定义类

/**
 * 检测一个对象是否是 Proxy 实例
 * @param target 待检测的对象
 * @returns boolean
 */
export function isProxy<T extends object>(target: T | unknown): target is T {
  if (!target || typeof target !== "object") {
    return false;
  }

  // 方法1：检查 Proxy 特有的内部属性（如 Vue3 的 __v_isProxy）
  if ("__v_isProxy" in target || "__isProxy" in target) {
    return true;
  }

  // 方法2：尝试 revocable 检测（适用于原生 Proxy）
  try {
    Proxy.revocable(target, {}).revoke();
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * 获取变量的精确类型
 * @param target 待检测的对象
 * @returns ObjectType
 */
export function getType(target: unknown): ObjectType {
  if (target === null) return "Null";
  if (target === undefined) return "Undefined";

  const typeStr = Object.prototype.toString.call(target).slice(8, -1);

  if (typeStr === "Object") {
    if (isProxy(target)) return "Proxy";
    if (target.constructor?.name) return target.constructor.name; // 自定义类
  }

  return typeStr;
}

type Proxiable<T extends object> = T & { __target?: T }; // 允许自定义 __target 属性

/**
 * 获取 Proxy 的原始对象（递归处理嵌套 Proxy）
 * @param proxy 可能是 Proxy 的对象或任意值
 * @returns 原始对象或原值（如果不是 Proxy）
 */
export function getProxyTarget<T>(proxy: T): T {
  if (!proxy || typeof proxy !== "object") return proxy;

  // 处理 Vue3 响应式对象
  if ("__v_raw" in proxy) {
    return (proxy as { __v_raw: T }).__v_raw;
  }

  // 处理自定义 __target 属性
  if ("__target" in proxy) {
    return (proxy as Proxiable<object>).__target as T;
  }

  // 尝试通过 JSON.stringify 提取（仅适用于纯数据对象）
  try {
    const json = JSON.stringify(proxy);
    return JSON.parse(json) as T;
  } catch {}

  // 递归处理数组
  if (Array.isArray(proxy)) {
    return proxy.map(getProxyTarget) as unknown as T;
  }

  // 递归处理普通对象
  const result: Record<string, unknown> = {};
  for (const key in proxy) {
    if (Object.prototype.hasOwnProperty.call(proxy, key)) {
      result[key] = getProxyTarget((proxy as Record<string, unknown>)[key]);
    }
  }

  return result as T;
}
