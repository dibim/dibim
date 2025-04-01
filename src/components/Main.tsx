import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { ImperativePanelHandle, Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { AlertCircle, PanelLeftDashed, PanelLeftIcon } from "lucide-react";
import { useSnapshot } from "valtio";
import { subscribeKey } from "valtio/vanilla/utils";
import { DatabaseList } from "@/components/list_bar/DatabaseList";
import { TableList } from "@/components/list_bar/TableList";
import { MainContent } from "@/components/main_content/MainContent";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import {
  APP_NAME,
  CONFIG_FILE_MAIN,
  HEDAER_H,
  LIST_BAR_DEFAULT_WIDTH,
  LIST_BAR_MIN_WIDTH,
  LIST_BAR_TYPE_DB_LIST,
  LIST_BAR_TYPE_TABLE_LIST,
  MAIN_PASSWORD_DEFAULT,
} from "@/constants";
import { invoker } from "@/invoker";
import { appState } from "@/store/valtio";
import { readConfigFile } from "@/utils/config_file";
import { About } from "./About";
import { TooltipGroup } from "./TooltipGroup";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";

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

  // ========== 配置初始化  ==========

  const [showPwdInput, setShowPwdInput] = useState(true);
  const [mainPassword, setMainPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string>(""); // 错误消息

  async function onInputMainPassword(event: React.ChangeEvent<HTMLInputElement>) {
    setMainPassword(event.target.value || "");
  }

  async function onSubmit() {
    const sha256 = await invoker.sha256(mainPassword);
    appState.setMainPasswordSha(sha256);

    if (await initConfFile(sha256, false)) {
      setShowPwdInput(false);
    } else {
      setErrorMessage("密码错误");
    }
  }

  // 使用主密码解锁配置文件并初始化 app 配置
  async function initConfFile(pwd: string, isDefultPwd: boolean) {
    const conf = await readConfigFile(pwd);
    try {
      await appState.setConfig(JSON.parse(conf), true);
      return true;
    } catch (error) {
      console.log(
        `
        使用${isDefultPwd ? "默认" : "用户"} 的主密码解析配置文件出错,
        文件路径为: ${CONFIG_FILE_MAIN},
        文件内容为: ${conf}`,
      );
      return false;
    }
  }

  async function checkConfigFile() {
    const res = await invoker.pathExists(CONFIG_FILE_MAIN);

    if (res) {
      // 先尝试使用默认密码副去, 出错的再弹出主密码输入框
      const sha256 = await invoker.sha256(MAIN_PASSWORD_DEFAULT);
      const success = await initConfFile(sha256, true);
      if (success) setShowPwdInput(false);
    } else {
      setShowPwdInput(false);
    }
  }
  // ========== 配置初始化 结束 ==========

  useEffect(() => {
    checkConfigFile();
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
    return () => unsubscribe();
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
      {showPwdInput ? (
        <div className={"w-full h-full fixed top-0 left-0  z-10 bg-background"}>
          <div className="flex items-center justify-center min-h-screen p-4">
            <Card className="w-100">
              <CardHeader>
                <CardTitle>
                  <div> 欢迎使用 {APP_NAME}</div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="py-4">
                  <Input value={mainPassword} onInput={onInputMainPassword} />
                </div>

                {errorMessage && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>错误提示</AlertTitle>
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button onClick={onSubmit}>解锁</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      ) : (
        <>
          <header className={`flex h-${HEDAER_H} shrink-0 items-center gap-2 border-b px-4`}>
            {!snap.sidebarOpen && <span className="text-xl font-semibold cursor-pointer">{APP_NAME}</span>}

            {/* 复制 sidebar-trigger 过来, 这里添加了函数, 记录 sidebar 的状态*/}
            <TooltipGroup dataArr={tooltipSectionData} />
          </header>

          <PanelGroup direction="horizontal">
            <Panel
              ref={panelRef}
              defaultSize={defaultSizePercent}
              minSize={minSizePercent}
              collapsible
              collapsedSize={0}
            >
              <div className="p-2 overflow-y-scroll" style={{ height: `calc(100vh - var(--spacing) * ${HEDAER_H})` }}>
                {snap.listBarType === LIST_BAR_TYPE_DB_LIST && <DatabaseList />}
                {snap.listBarType === LIST_BAR_TYPE_TABLE_LIST && <TableList />}
              </div>
            </Panel>
            <PanelResizeHandle className="w-1 bg-secondary hover:bg-blue-500" />
            <Panel defaultSize={100 - defaultSizePercent}>
              <div
                className="flex-1 p-4 overflow-y-scroll"
                style={{ height: `calc(100vh - var(--spacing) * ${HEDAER_H})` }}
              >
                <MainContent />
              </div>
            </Panel>
          </PanelGroup>
        </>
      )}

      <About />
    </>
  );
}
