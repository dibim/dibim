import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { Sidebar } from "@/components/Sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import "@/styles/app.scss";
import "@/styles/index.css";
import "@/styles/theme.scss";
import { Main } from "./components/Main";
import { Alert, AlertDescription, AlertTitle } from "./components/ui/alert";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Toaster } from "./components/ui/sonner";
import { APP_NAME, CONFIG_FILE_MAIN, MAIN_PASSWORD_DEFAULT } from "./constants";
import { invoker } from "./invoker";
import { appState } from "./store/valtio";
import { readConfigFile } from "./utils/config_file";

export function App() {
  const [showLock, setShowLock] = useState(true);
  const [mainPassword, setMainPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  async function onInputMainPassword(event: React.ChangeEvent<HTMLInputElement>) {
    setMainPassword(event.target.value || "");
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
      if (success) setShowLock(false);
    } else {
      setShowLock(false);
    }
  }

  async function onSubmit() {
    const sha256 = await invoker.sha256(mainPassword);
    appState.setMainPasswordSha(sha256);

    if (await initConfFile(sha256, false)) {
      setShowLock(false);
    } else {
      setErrorMessage("密码错误");
    }
  }

  useEffect(() => {
    checkConfigFile();
  }, []);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      {showLock ? (
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
        <div className="w-[100vw]">
          <SidebarProvider
            style={{
              "--sidebar-width": "8rem",
              "--sidebar-width-mobile": "20rem",
            }}
          >
            <TooltipProvider>
              <Sidebar />
              <SidebarInset>
                <Main />
              </SidebarInset>
            </TooltipProvider>
          </SidebarProvider>
        </div>
      )}

      <Toaster />
    </ThemeProvider>
  );
}
