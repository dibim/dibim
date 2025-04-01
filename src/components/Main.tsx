import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { ImperativePanelHandle, Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { PanelLeftDashed, PanelLeftIcon } from "lucide-react";
import { useSnapshot } from "valtio";
import { subscribeKey } from "valtio/vanilla/utils";
import { DatabaseList } from "@/components/list_bar/DatabaseList";
import { TableList } from "@/components/list_bar/TableList";
import { MainContent } from "@/components/main_content/MainContent";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import {
  APP_NAME,
  HEDAER_H,
  LIST_BAR_DEFAULT_WIDTH,
  LIST_BAR_MIN_WIDTH,
  LIST_BAR_TYPE_DB_LIST,
  LIST_BAR_TYPE_TABLE_LIST,
} from "@/constants";
import { appState } from "@/store/valtio";
import { About } from "./About";
import { TooltipGroup } from "./TooltipGroup";

export function Main() {
  const snap = useSnapshot(appState);

  const { toggleSidebar, setOpenMobile, setOpen } = useSidebar();

  function toggleSidebarOpen() {
    setOpenMobile(!appState.sidebarOpen);
    setOpen(!appState.sidebarOpen);
    appState.setSidebarOpen(!appState.sidebarOpen);
    toggleSidebar();
  }
  const toggleAboutOpen = () => appState.setAboutOpen(!appState.aboutOpen);

  // ========== 快捷键 ==========

  useHotkeys("f1", () => toggleAboutOpen(), [appState.aboutOpen]);
  useHotkeys("f2", () => toggleSidebarOpen(), [appState.sidebarOpen]);
  useHotkeys("f3", () => appState.setListBarOpen(!appState.listBarOpen), [appState.listBarOpen]);

  // ========== 快捷键 结束 ==========

  // ========== 控制列表栏 ==========
  const [defaultSizePercent, setDefaultSizePercent] = useState(20);
  const [minSizePercent, setMinSizePercent] = useState(10);
  const panelRef = useRef<ImperativePanelHandle>(null);

  useEffect(() => {
    const updateSize = () => {
      const screenAvailWidth = window.screen.availWidth;
      setDefaultSizePercent((LIST_BAR_DEFAULT_WIDTH / screenAvailWidth) * 100);
      setMinSizePercent((LIST_BAR_MIN_WIDTH / screenAvailWidth) * 100);
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);
  // ========== 控制列表栏 结束 ==========

  const mainRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setOpenMobile(appState.sidebarOpen);
    setOpen(appState.sidebarOpen);

    // 监听 store 的变化
    const unsubscribe = subscribeKey(appState, "listBarOpen", (val: boolean) => {
      if (appState.listBarOpen) {
        if (panelRef.current) panelRef.current.expand();
      } else {
        if (panelRef.current) panelRef.current?.collapse();
      }
    });

    // 初始化 ResizeObserver
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];

      appState.setMainContentWidth(entry.contentRect.width); // 更新宽度
    });

    // 开始监听目标元素
    if (mainRef.current) observer.observe(mainRef.current);

    return () => {
      unsubscribe();
      observer.disconnect();
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
      <header className={`flex h-${HEDAER_H} shrink-0 items-center gap-2 border-b px-4`}>
        {!snap.sidebarOpen && <span className="text-xl font-semibold cursor-pointer">{APP_NAME}</span>}

        {/* 复制 sidebar-trigger 过来, 这里添加了函数, 记录 sidebar 的状态*/}
        <TooltipGroup dataArr={tooltipSectionData} />
      </header>

      <PanelGroup direction="horizontal">
        <Panel ref={panelRef} defaultSize={defaultSizePercent} minSize={minSizePercent} collapsible collapsedSize={0}>
          <div className="p-2 overflow-y-scroll" style={{ height: `calc(100vh - var(--spacing) * ${HEDAER_H})` }}>
            {snap.listBarType === LIST_BAR_TYPE_DB_LIST && <DatabaseList />}
            {snap.listBarType === LIST_BAR_TYPE_TABLE_LIST && <TableList />}
          </div>
        </Panel>
        <PanelResizeHandle className="w-1 bg-secondary hover:bg-blue-500" />
        <Panel defaultSize={100 - defaultSizePercent}>
          <div ref={mainRef} className="p-4 w-full" style={{ height: `calc(100vh - var(--spacing) * ${HEDAER_H})` }}>
            <MainContent />
          </div>
        </Panel>
      </PanelGroup>

      <About />
    </>
  );
}
