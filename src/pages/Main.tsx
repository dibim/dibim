import { useCallback, useEffect, useRef, useState } from "react";
import { useCoreStore } from "@/store";

export function Main() {
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [isDragging, setIsDragging] = useState(false);
  const mouseInitialPosX = useRef(0); // 起始坐标

  const { currentDbType } = useCoreStore();

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      if (mouseInitialPosX.current === 0) {
        mouseInitialPosX.current = e.clientX; // 记录起始坐标
      }

      // 计算新宽度
      const newWidth = sidebarWidth + e.clientX - mouseInitialPosX.current;
      setSidebarWidth(newWidth);
    },
    [isDragging],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    mouseInitialPosX.current = 0; // 重置起始坐标
  }, []);

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div className="flex h-full">
      {/* 侧边栏 */}
      <div className="h-full bg-background border-r relative" style={{ width: sidebarWidth }}>
        {/* 侧边栏内容 */}
        <div className="p-4">
          {/* TODO: 链接对应的数据库并查询表格 */}
          {currentDbType}
        </div>

        {/* 拖拽手柄 */}
        <div
          className="absolute -right-1 top-0 w-2 h-full cursor-col-resize hover:bg-primary/50"
          onMouseDown={handleMouseDown}
        />
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 p-4">Main Content</div>
    </div>
  );
}
