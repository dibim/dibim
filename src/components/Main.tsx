import { useCallback, useEffect, useRef, useState } from "react";
import { PanelLeftIcon } from "lucide-react";
import { Separator } from "@radix-ui/react-separator";
import { MainContent } from "@/components/main_content/MainContent";
import { TableList } from "@/components/sub_idebar/TableList";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { APP_NAME, CONFIG_FILE_ENC, DB_TYPE_POSTGRES_SQL, HEDAER_H, MAIN_CONTEN_TYPE_TABLE_EDITOR } from "@/constants";
import { connectPg } from "@/databases/PostgreSQL/utils";
import { invoker } from "@/invoke";
import { cn } from "@/lib/utils";
import { useCoreStore } from "@/store";

export function Main() {
  const { currentDbType, setCurrentDbType, setMainContenType, sidebarOpen, setSidebarOpen } = useCoreStore();

  const { toggleSidebar, setOpenMobile, setOpen } = useSidebar();

  // ========== 控制次级侧边栏 ==========
  const [subSidebarWidth, setSubSidebarWidth] = useState(240);
  const [isDragging, setIsDragging] = useState(false);
  const mouseInitialPosX = useRef(0); // 起始坐标
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
      const newWidth = subSidebarWidth + e.clientX - mouseInitialPosX.current;
      setSubSidebarWidth(newWidth);
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
  // ========== 控制次级侧边栏 结束 ==========

  // ========== 读取配置文件  ==========
  const checkConfigFile = async () => {
    const res = await invoker.pathExists(CONFIG_FILE_ENC);

    console.log("检查配置文件 :::res ::: ", res);
  };
  // ========== 读取配置文件 结束 ==========

  // TODO: 库,差是否有连接配置, 有的话显示 MainContent ,没有的话显示 Index

  const testDb = async () => {
    const res = await connectPg({
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
    // testDb();

    checkConfigFile();

    setOpenMobile(sidebarOpen);
    setOpen(sidebarOpen);
  }, []);

  return (
    <>
      <header className={`flex h-${HEDAER_H} shrink-0 items-center gap-2 border-b px-4`}>
        {!sidebarOpen && <span className="text-xl font-semibold cursor-pointer">{APP_NAME}</span>}

        {/* 复制 sidebar-trigger 过来, 这里添加了函数, 记录 sidebar 的状态*/}
        <Button
          data-sidebar="trigger"
          data-slot="sidebar-trigger"
          variant="ghost"
          size="icon"
          className={cn("size-7")}
          onClick={() => {
            setOpenMobile(!sidebarOpen);
            setOpen(!sidebarOpen);
            toggleSidebar();

            setSidebarOpen(!sidebarOpen);
          }}
        >
          <PanelLeftIcon />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>

        <Separator orientation="vertical" className="mr-2 h-4" />
      </header>

      <div className="flex">
        {/* 次级侧边栏 */}
        <div className="flex border-r relative" style={{ width: subSidebarWidth }}>
          {/* 次级侧边栏内容 */}
          {/* 这里的 height 是屏幕高度减去 header 的高度 */}
          <div
            className="flex-1 overflow-y-scroll py-2 ps-2 pe-4"
            style={{ height: `calc(100vh - var(--spacing) * ${HEDAER_H})` }}
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
        <div className="flex-1 p-4 overflow-y-scroll" style={{ height: `calc(100vh - var(--spacing) * ${HEDAER_H})` }}>
          <MainContent />
        </div>
      </div>
    </>
  );
}
