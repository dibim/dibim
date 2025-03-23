import { useCallback, useEffect, useRef, useState } from "react";
import { MainContent } from "@/components/main_content/MainContent";
import { TableList } from "@/components/sub_idebar/TableList";
import { DB_TYPE_POSTGRES_SQL, MAIN_CONTEN_TYPE_TABLE_EDITOR } from "@/constants";
import { connect } from "@/databases/PostgreSQL/utils";
import { useCoreStore } from "@/store";

export function Main() {
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [isDragging, setIsDragging] = useState(false);
  const mouseInitialPosX = useRef(0); // 起始坐标

  const { currentDbType, setCurrentDbType, setMainContenType } = useCoreStore();

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

  // TODO: 库,差是否有连接配置, 有的话显示 MainContent ,没有的话显示 Index

  const testDb = async () => {
    const res = await connect({
      user: "postgres",
      host: "127.0.0.1",
      dbname: "given_0315",
      password: "postgres",
      port: 5432,
    });

    console.log("connect res: ", res);

    setCurrentDbType(DB_TYPE_POSTGRES_SQL);
    setMainContenType(MAIN_CONTEN_TYPE_TABLE_EDITOR);
  };

  useEffect(() => {
    testDb();
  }, []);

  return (
    <div className="flex">
      {/* 次级侧边栏 */}
      <div className="flex border-r relative" style={{ width: sidebarWidth }}>
        {/* 次级侧边栏内容 */}
        {/* 这里的 height 是屏幕高度减去 header 的高度 */}
        <div
          className="flex-1 overflow-y-scroll py-2 ps-2 pe-4"
          style={{ height: "calc(100vh - var(--spacing) * 12)" }}
        >
          {/* TODO: 链接对应的数据库并查询表格 */}
          {currentDbType === DB_TYPE_POSTGRES_SQL && <TableList />}
        </div>

        {/* 拖拽手柄 */}
        <div
          className="absolute -right-1 top-0 w-2 h-full cursor-col-resize hover:bg-primary/50"
          onMouseDown={handleMouseDown}
        />
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 p-4">
        <MainContent />
      </div>
    </div>
  );
}
