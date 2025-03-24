/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />
import "react";

// 给 style 属性添加 允许 css 变量名
declare module "react" {
  interface CSSProperties {
    [key: `--${string}`]: string | number | undefined;
  }
}
