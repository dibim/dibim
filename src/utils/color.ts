// 解析 RGB/RGBA 颜色
function invertRGB(color: string): string {
  const match = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/i);

  if (!match) return color; // 如果不是 RGB/RGBA 格式，返回原色

  const r = 255 - parseInt(match[1]);
  const g = 255 - parseInt(match[2]);
  const b = 255 - parseInt(match[3]);
  const a = match[4] ? parseFloat(match[4]) : undefined;

  return a !== undefined ? `rgba(${r}, ${g}, ${b}, ${a})` : `rgb(${r}, ${g}, ${b})`;
}

// 解析 HSL/HSLA 颜色
function invertHSL(color: string): string {
  const match = color.match(/^hsla?\((\d+),\s*([\d.]+)%,\s*([\d.]+)%(?:,\s*([\d.]+))?\)$/i);

  if (!match) return color; // 如果不是 HSL/HSLA 格式，返回原色

  let h = (parseInt(match[1]) + 180) % 360;
  const s = parseFloat(match[2]);
  const l = 100 - parseFloat(match[3]); // 反转亮度
  const a = match[4] ? parseFloat(match[4]) : undefined;

  return a !== undefined ? `hsla(${h}, ${s}%, ${l}%, ${a})` : `hsl(${h}, ${s}%, ${l}%)`;
}

// 十六进制颜色反色
function invertHex(hex: string): string {
  // 简写格式如 #abc 转为 #aabbcc
  if (hex.length === 4) {
    hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }

  // 解析 RGB 分量
  const r = (255 - parseInt(hex.substr(1, 2), 16)).toString(16).padStart(2, "0");
  const g = (255 - parseInt(hex.substr(3, 2), 16)).toString(16).padStart(2, "0");
  const b = (255 - parseInt(hex.substr(5, 2), 16)).toString(16).padStart(2, "0");

  return `#${r}${g}${b}`;
}

// Not yet used
export function invertColor(color: string): string {
  color = color.toLowerCase();

  // RGB/RGBA
  if (color.startsWith("rgb")) return invertRGB(color);

  // HSL/HSLA
  if (color.startsWith("hsl")) return invertHSL(color);

  // hex
  if (color.startsWith("#")) return invertHex(color);

  return color;
}
