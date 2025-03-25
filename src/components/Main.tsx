import { useCallback, useEffect, useRef, useState } from "react";
import { PanelLeftIcon } from "lucide-react";
import { Separator } from "@radix-ui/react-separator";
import { MainContent } from "@/components/main_content/MainContent";
import { TableList } from "@/components/sub_idebar/TableList";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import {
  APP_NAME,
  CONFIG_FILE_ENC,
  DB_TYPE_POSTGRESQL,
  HEDAER_H,
  MAIN_CONTEN_TYPE_TABLE_EDITOR,
  SUB_SIDEBAR_MIN_WIDTH,
  SUB_SIDEBAR_TYPE_DB_LIST,
  SUB_SIDEBAR_TYPE_TABLE_LIST,
} from "@/constants";
import { connectPg } from "@/databases/PostgreSQL/utils";
import { invoker } from "@/invoke";
import { useCoreStore } from "@/store";
import { DatabaseList } from "./sub_idebar/DatabaseList";

export function Main() {
  const { currentDbType, setCurrentDbType, setMainContenType, subSidebarType, sidebarOpen, setSidebarOpen } =
    useCoreStore();

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
      let newWidth = subSidebarWidth + e.clientX - mouseInitialPosX.current;
      if (newWidth < SUB_SIDEBAR_MIN_WIDTH) newWidth = SUB_SIDEBAR_MIN_WIDTH;

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

    setCurrentDbType(DB_TYPE_POSTGRESQL);
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
          variant="ghost"
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
            {subSidebarType === SUB_SIDEBAR_TYPE_DB_LIST && <DatabaseList />}
            {subSidebarType === SUB_SIDEBAR_TYPE_TABLE_LIST && <TableList />}
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
