import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, PanelLeftIcon } from "lucide-react";
import { Separator } from "@radix-ui/react-separator";
import { MainContent } from "@/components/main_content/MainContent";
import { TableList } from "@/components/sub_sidebar/TableList";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import {
  APP_NAME,
  CONFIG_FILE_MAIN,
  HEDAER_H,
  MAIN_PASSWORD_DEFAULT,
  SUB_SIDEBAR_MIN_WIDTH,
  SUB_SIDEBAR_TYPE_DB_LIST,
  SUB_SIDEBAR_TYPE_TABLE_LIST,
} from "@/constants";
import { invoker } from "@/invoke";
import { clearCoreStore, useCoreStore } from "@/store";
import { readConfigFile } from "@/utils/config_file";
import { DatabaseList } from "./sub_sidebar/DatabaseList";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";

export function Main() {
  const { setConfig, subSidebarType, sidebarOpen, setSidebarOpen, setMainPasswordSha } = useCoreStore();

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

  // ========== 配置初始化  ==========
  clearCoreStore(); // 清空旧的 store 数据

  const [showPwdInput, setShowPwdInput] = useState(true);
  const [mainPassword, setMainPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string>(""); // 错误消息

  async function onInputMainPassword(event: React.ChangeEvent<HTMLInputElement>) {
    setMainPassword(event.target.value || "");
  }

  async function onSubmit() {
    const sha256 = await invoker.sha256(mainPassword);
    setMainPasswordSha(sha256);

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
      setConfig(JSON.parse(conf), true);
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

  const checkConfigFile = async () => {
    const res = await invoker.pathExists(CONFIG_FILE_MAIN);

    if (res) {
      // 先尝试使用默认密码副去, 出错的再弹出主密码输入框
      const success = await initConfFile(MAIN_PASSWORD_DEFAULT, true);
      if (success) setShowPwdInput(false);
    } else {
      setShowPwdInput(false);
    }
  };
  // ========== 配置初始化 结束 ==========

  // TODO: 库,差是否有连接配置, 有的话显示 MainContent ,没有的话显示 Index

  useEffect(() => {
    // testDb();

    checkConfigFile();

    setOpenMobile(sidebarOpen);
    setOpen(sidebarOpen);
  }, []);

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
            <div
              className="flex-1 p-4 overflow-y-scroll"
              style={{ height: `calc(100vh - var(--spacing) * ${HEDAER_H})` }}
            >
              <MainContent />
            </div>
          </div>
        </>
      )}
    </>
  );
}
