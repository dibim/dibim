import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useTranslation } from "react-i18next";
import Split from "react-split";
import { EllipsisVertical, PanelLeftIcon } from "lucide-react";
import { useSnapshot } from "valtio";
import { subscribeKey } from "valtio/utils";
import { DatabaseList } from "@/components/list_bar/DatabaseList";
import { TableList } from "@/components/list_bar/TableList";
import { MainArea } from "@/components/main_area";
import { Button } from "@/components/ui/button";
import { APP_NAME, HEDAER_H, LIST_BAR_DB, LIST_BAR_DEFAULT_WIDTH, LIST_BAR_TABLE } from "@/constants";
import { getTab } from "@/context";
import { DB_SQLITE } from "@/databases/constants";
import { addTab, coreState } from "@/store/core";
import { TextNotificationData } from "@/types/types";
import { getPageWidth } from "@/utils/ media_query";
import { genPanelPercent } from "@/utils/util";
import { About } from "./About";
import { Sidebar } from "./Sidebar";
import { TextNotification } from "./TextNotification";
import { TooltipGroup } from "./TooltipGroup";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";

export function Main({ id, className }: { id: string; className: string }) {
  const { t } = useTranslation();
  const coreSnap = useSnapshot(coreState);
  const [mainWidth, setMainWidth] = useState("");
  const mainRef = useRef<HTMLDivElement | null>(null);

  const sidebarRef = useRef<HTMLDivElement>(null);

  // ========== 快捷键 | Shortcut keys ==========
  const toggleAboutOpen = () => coreState.setAboutOpen(!coreState.aboutOpen);

  useHotkeys("f1", () => toggleAboutOpen(), [coreState.aboutOpen]);
  useHotkeys("f2", () => coreState.setListBarOpen(!coreState.listBarOpen), [coreState.listBarOpen]);
  // ========== 快捷键 结束 | Shortcut keys end==========

  // ========== 控制列表栏 | Control list bar ==========
  const [defaultSizePercent, setDefaultSizePercent] = useState(20);

  const handleResize = (sizes: number[]) => {
    resizeListBarWidth(sizes[0]);
  };

  const resizeListBarWidth = (size: number) => {
    const w = ((getPageWidth() - coreState.sideBarWidth) * size) / 100;
    coreState.setListBarWidth(w);
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
  // 动画结束后执行的操作
  const handleAfterAnimation = () => {
    if (sidebarRef.current) coreState.setSideBarWidth(sidebarRef.current.clientWidth);
  };

  useEffect(() => {
    setMainWidth(`calc(100vw - ${coreSnap.sideBarWidth}px - 10px)`); // TODO: 临时减 10px
  }, [coreSnap.sideBarWidth]);

  // ========== 控制侧边栏 结束 | Control sidebar end ==========

  useEffect(() => {
    // 初始化涉及到布局的尺寸 | Initialization involves the size of the layout
    handleAfterAnimation();
    resizeListBarWidth(defaultSizePercent);
  }, []);

  // ========== 按钮 | Button ==========
  function renderConnName() {
    const tab = getTab();
    if (tab === null) return <span></span>;
    const tabState = tab.state;

    return (
      <span
        className="cursor-pointer"
        style={{ borderBottom: `0.25rem solid ${coreSnap.currentConnColor || "rgba(0,0,0,0)"}` }}
      >
        {(coreSnap.currentConnType === DB_SQLITE ? coreSnap.currentConnName : tabState.currentDbNme) ||
          t("No database connection")}
      </span>
    );
  }
  const tooltipSectionData = [
    {
      trigger: (
        <Button
          variant="ghost"
          onClick={() => {
            coreSnap.setListBarOpen(!coreSnap.listBarOpen);
          }}
        >
          <PanelLeftIcon />
          <span className="sr-only">{t("toggle list bar")}</span>
        </Button>
      ),
      content: <p>{t("toggle list bar")}(F3)</p>,
    },
    {
      trigger: renderConnName(),
      content: <p>{t("Current database connection")}</p>,
    },
  ];

  // ========== 通知 | Notification ==========
  const [textNotification, setTextNotification] = useState<TextNotificationData | null>(null);
  function setTextNotificationData() {
    setTextNotification(coreState.textNotificationArr.at(-1) || null);

    setTimeout(() => {
      setTextNotification(null);
    }, 5000);
  }

  useEffect(() => {
    if (coreState.tabs.length === 0) addTab();
    setTextNotificationData();

    // 监听 store 的变化 | Monitor changes in the store
    const unsubscribe = subscribeKey(coreState, "textNotificationArr", (_val: TextNotificationData[]) => {
      setTextNotificationData();
    });
    return () => unsubscribe();
  }, []);

  return (
    <>
      <Sidebar ref={sidebarRef} />
      <div id={id} className={`ml-16 ${className}`} style={{ width: mainWidth }}>
        <header className={`flex justify-between h-${HEDAER_H}  items-center  border-b px-4`}>
          <div className="shrink-0 gap-2">
            <span className="text-xl font-semibold cursor-pointer">{APP_NAME}</span>
            <TooltipGroup dataArr={tooltipSectionData} />
          </div>

          <div className="flex-1 flex justify-end ps-8 text-end">
            {textNotification && <TextNotification message={textNotification.message} type={textNotification.type} />}

            {coreSnap.textNotificationArr.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <EllipsisVertical />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="min-w-[10vw] max-w-[80vw]">
                  {coreSnap.textNotificationArr.map((item, index) => (
                    <DropdownMenuItem key={index}>
                      <TextNotification
                        message={`${item.time ? item.time.toLocaleString() + " " : ""}${item.message}`}
                        type={item.type}
                      />
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </header>

        <Split
          sizes={coreSnap.listBarOpen ? [defaultSizePercent, genPanelPercent(100 - defaultSizePercent)] : [0, 100]}
          minSize={0}
          onDragEnd={handleResize}
          className="flex overflow-hidden split-container split-horizontal"
          style={{ height: `calc(100vh - var(--spacing) * ${HEDAER_H})` }}
          direction="horizontal"
          cursor="col-resize"
        >
          <div className="overflow-y-scroll">
            {coreSnap.listBarType === LIST_BAR_DB && <DatabaseList />}
            {coreSnap.listBarType === LIST_BAR_TABLE && <TableList />}
          </div>

          <div ref={mainRef} className="p-2">
            <MainArea />
          </div>
        </Split>

        <About />
      </div>
    </>
  );
}
