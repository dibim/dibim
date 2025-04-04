import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import Split from "react-split";
import { PanelLeftDashed, PanelLeftIcon } from "lucide-react";
import { useSnapshot } from "valtio";
import { DatabaseList } from "@/components/list_bar/DatabaseList";
import { TableList } from "@/components/list_bar/TableList";
import { MainContent } from "@/components/main_content/MainContent";
import { Button } from "@/components/ui/button";
import { SidebarInset, useSidebar } from "@/components/ui/sidebar";
import {
  APP_NAME,
  HEDAER_H,
  LIST_BAR_DEFAULT_WIDTH,
  LIST_BAR_TYPE_DB_LIST,
  LIST_BAR_TYPE_TABLE_LIST,
} from "@/constants";
import { appState } from "@/store/valtio";
import { getPageWidth } from "@/utils/ media_query";
import { genPanelPercent } from "@/utils/util";
import { About } from "./About";
import { Sidebar } from "./Sidebar";
import { TooltipGroup } from "./TooltipGroup";

export function Main({ id, className }: { id: string; className: string }) {
  const snap = useSnapshot(appState);
  const [mainWidth, setMainWidth] = useState("");
  const mainRef = useRef<HTMLDivElement | null>(null);

  const { toggleSidebar, setOpenMobile, setOpen } = useSidebar();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // ========== 快捷键 ==========
  function toggleSidebarOpen() {
    setOpenMobile(!appState.sidebarOpen);
    setOpen(!appState.sidebarOpen);
    appState.setSidebarOpen(!appState.sidebarOpen);
    toggleSidebar();
  }
  const toggleAboutOpen = () => appState.setAboutOpen(!appState.aboutOpen);

  useHotkeys("f1", () => toggleAboutOpen(), [appState.aboutOpen]);
  useHotkeys("f2", () => toggleSidebarOpen(), [appState.sidebarOpen]);
  useHotkeys("f3", () => appState.setListBarOpen(!appState.listBarOpen), [appState.listBarOpen]);
  // ========== 快捷键 结束 ==========

  // ========== 控制列表栏 ==========
  const [defaultSizePercent, setDefaultSizePercent] = useState(20);

  const handleResize = (sizes: number[]) => {
    resizeListBarWidth(sizes[0]);
  };

  const resizeListBarWidth = (size: number) => {
    const w = ((getPageWidth() - appState.sideBarWidth) * size) / 100;
    appState.setListBarWidth(w);
  };

  useEffect(() => {
    const updateSize = () => {
      setDefaultSizePercent((LIST_BAR_DEFAULT_WIDTH / getPageWidth()) * 100);
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);
  // ========== 控制列表栏 结束 ==========

  // ========== 控制测表栏 ==========
  const timerRef = useRef<number>(0);
  // 动画结束后执行的操作
  const handleAfterAnimation = () => {
    if (sidebarRef.current) appState.setSideBarWidth(sidebarRef.current.clientWidth);
  };

  const handleTransitionEnd = (e: TransitionEvent) => {
    if (e.propertyName === "width") {
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(handleAfterAnimation, 200);
    }
  };

  useEffect(() => {
    setMainWidth(`calc(100vw - ${snap.sideBarWidth}px - 10px)`); // TODO: 临时减 10px
  }, [snap.sideBarWidth]);

  // ========== 控制测表栏 结束 ==========

  useEffect(() => {
    setOpenMobile(appState.sidebarOpen);
    setOpen(appState.sidebarOpen);

    // 初始化涉及到布局的尺寸
    handleAfterAnimation();
    resizeListBarWidth(defaultSizePercent);

    // ========== 侧边栏 ==========
    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    sidebar.addEventListener("transitionend", handleTransitionEnd);

    return () => {
      sidebar.removeEventListener("transitionend", handleTransitionEnd);
    };
  }, []);

  const tooltipSectionData = [
    {
      trigger: (
        <Button data-sidebar="trigger" variant="ghost" onClick={toggleSidebarOpen}>
          <PanelLeftIcon />
          <span className="sr-only">切换侧边栏</span>
        </Button>
      ),
      content: <p>切换侧边栏(F2)</p>,
    },
    {
      trigger: (
        <Button
          variant="ghost"
          onClick={() => {
            snap.setListBarOpen(!snap.listBarOpen);
          }}
        >
          <PanelLeftDashed />
          <span className="sr-only">切换列表栏</span>
        </Button>
      ),
      content: <p>切换列表栏(F3)</p>,
    },
    {
      trigger: (
        <span
          className="cursor-pointer"
          style={{ borderBottom: `0.25rem solid ${snap.currentConnColor || "rgba(0,0,0,0)"}` }}
        >
          {snap.currentDbNme || "无数据库连接"}
        </span>
      ),
      content: <p>当前数据库连接</p>,
    },
  ];

  return (
    <>
      <Sidebar id="sidebar" ref={sidebarRef} />
      <SidebarInset>
        <main>
          <div id={id} className={className} style={{ width: mainWidth }}>
            <header className={`flex h-${HEDAER_H} shrink-0 items-center gap-2 border-b px-4`}>
              {!snap.sidebarOpen && <span className="text-xl font-semibold cursor-pointer">{APP_NAME}</span>}

              {/* 复制 sidebar-trigger 过来, 这里添加了函数, 记录 sidebar 的状态*/}
              <TooltipGroup dataArr={tooltipSectionData} />
            </header>

            <Split
              sizes={snap.listBarOpen ? [defaultSizePercent, genPanelPercent(100 - defaultSizePercent)] : [0, 100]}
              minSize={0}
              onDragEnd={handleResize}
              className="flex overflow-hidden split-container split-horizontal"
              style={{ height: `calc(100vh - var(--spacing) * ${HEDAER_H})` }}
              direction="horizontal"
              cursor="col-resize"
            >
              <div className="overflow-y-scroll">
                {snap.listBarType === LIST_BAR_TYPE_DB_LIST && <DatabaseList />}
                {snap.listBarType === LIST_BAR_TYPE_TABLE_LIST && <TableList />}
              </div>

              <div ref={mainRef} className="p-2">
                <MainContent />
              </div>
            </Split>

            <About />
          </div>
        </main>
      </SidebarInset>
    </>
  );
}
