import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useTranslation } from "react-i18next";
import Split from "react-split";
import { EllipsisVertical, PanelLeftDashed, PanelLeftIcon } from "lucide-react";
import { useSnapshot } from "valtio";
import { subscribeKey } from "valtio/utils";
import { DatabaseList } from "@/components/list_bar/DatabaseList";
import { TableList } from "@/components/list_bar/TableList";
import { MainArea } from "@/components/main_area";
import { Button } from "@/components/ui/button";
import { SidebarInset, useSidebar } from "@/components/ui/sidebar";
import { APP_NAME, DB_SQLITE, HEDAER_H, LIST_BAR_DB, LIST_BAR_DEFAULT_WIDTH, LIST_BAR_TABLE } from "@/constants";
import { appState } from "@/store/valtio";
import { TextNotificationType } from "@/types/types";
import { getPageWidth } from "@/utils/ media_query";
import { genPanelPercent } from "@/utils/util";
import { About } from "./About";
import { Sidebar } from "./Sidebar";
import { TextNotification } from "./TextNotification";
import { TooltipGroup } from "./TooltipGroup";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function Main({ id, className }: { id: string; className: string }) {
  const { t } = useTranslation();
  const snap = useSnapshot(appState);
  const [mainWidth, setMainWidth] = useState("");
  const mainRef = useRef<HTMLDivElement | null>(null);

  const { toggleSidebar, setOpenMobile, setOpen } = useSidebar();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // ========== 快捷键 | Shortcut keys ==========
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
  // ========== 快捷键 结束 | Shortcut keys end==========

  // ========== 控制列表栏 | Control list bar ==========
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
  // ========== 控制列表栏 结束 | Control list bar end ==========

  // ========== 控制侧边栏 | Control sidebar ==========
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

  // ========== 控制侧边栏 结束 | Control sidebar end ==========

  useEffect(() => {
    setOpenMobile(appState.sidebarOpen);
    setOpen(appState.sidebarOpen);

    // 初始化涉及到布局的尺寸 | Initialization involves the size of the layout
    handleAfterAnimation();
    resizeListBarWidth(defaultSizePercent);

    // ========== 侧边栏 | Sidebar ==========
    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    sidebar.addEventListener("transitionend", handleTransitionEnd);

    return () => {
      sidebar.removeEventListener("transitionend", handleTransitionEnd);
    };
  }, []);

  // ========== 按钮 | Button ==========
  const tooltipSectionData = [
    {
      trigger: (
        <Button data-sidebar="trigger" variant="ghost" onClick={toggleSidebarOpen}>
          <PanelLeftIcon />
          <span className="sr-only">{t("Toggle sidebar")}</span>
        </Button>
      ),
      content: <p>{t("Toggle sidebar")}(F2)</p>,
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
          <span className="sr-only">{t("toggle list bar")}</span>
        </Button>
      ),
      content: <p>{t("toggle list bar")}(F3)</p>,
    },
    {
      trigger: (
        <span
          className="cursor-pointer"
          style={{ borderBottom: `0.25rem solid ${snap.currentConnColor || "rgba(0,0,0,0)"}` }}
        >
          {(snap.currentDbType === DB_SQLITE ? snap.currentConnName : snap.currentDbNme) || t("No database connection")}
        </span>
      ),
      content: <p>{t("Current database connection")}</p>,
    },
  ];

  // ========== 通知 | Notification ==========
  const [textNotification, setTextNotification] = useState<TextNotificationType | null>(null);
  function setTextNotificationData() {
    setTextNotification(appState.textNotificationArr.at(-1) || null);

    setTimeout(() => {
      setTextNotification(null);
    }, 5000);
  }

  useEffect(() => {
    setTextNotificationData();

    // 监听 store 的变化 | Monitor changes in the store
    const unsubscribe = subscribeKey(appState, "textNotificationArr", (_val: TextNotificationType[]) => {
      setTextNotificationData();
    });
    return () => unsubscribe();
  }, []);

  return (
    <>
      <Sidebar id="sidebar" ref={sidebarRef} />
      <SidebarInset>
        <main>
          <div id={id} className={className} style={{ width: mainWidth }}>
            <header className={`flex justify-between h-${HEDAER_H}  items-center  border-b px-4`}>
              <div className="shrink-0 gap-2">
                {!snap.sidebarOpen && <span className="text-xl font-semibold cursor-pointer">{APP_NAME}</span>}
                <TooltipGroup dataArr={tooltipSectionData} />
              </div>

              <div className="flex-1 flex justify-end ps-8 text-end">
                {textNotification && (
                  <>
                    <TextNotification message={textNotification.message} type={textNotification.type} />
                  </>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <EllipsisVertical />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    {snap.textNotificationArr.map((item, index) => {
                      return (
                        <>
                          <DropdownMenuItem key={index}>
                            <TextNotification message={item.message} type={item.type} />
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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
                {snap.listBarType === LIST_BAR_DB && <DatabaseList />}
                {snap.listBarType === LIST_BAR_TABLE && <TableList />}
              </div>

              <div ref={mainRef} className="p-2">
                <MainArea />
              </div>
            </Split>

            <About />
          </div>
        </main>
      </SidebarInset>
    </>
  );
}
