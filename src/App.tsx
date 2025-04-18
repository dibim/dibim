import { useEffect, useState } from "react";
import { I18nextProvider, useTranslation } from "react-i18next";
import { AlertCircle } from "lucide-react";
import { ThemeProvider } from "@/components/ThemeProvider";
import "@/styles/app.scss";
import "@/styles/index.css";
import "@/styles/theme.scss";
import { Main } from "./components/Main";
import { Alert, AlertDescription, AlertTitle } from "./components/ui/alert";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { TooltipProvider } from "./components/ui/tooltip";
import { APP_NAME, CONFIG_FILE_APPEARANCE, CONFIG_FILE_MAIN, MAIN_PASSWORD_DEFAULT } from "./constants";
import i18n from "./i18n";
import { invoker } from "./invoker";
import { coreState } from "./store/core";
import { ConfigFileAppearance, ConfigFileMain } from "./types/conf_file";
import { readConfigFile } from "./utils/config_file";

export function App() {
  const { t } = useTranslation();
  const [showLock, setShowLock] = useState(true);
  const [mainPassword, setMainPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  async function onInputMainPassword(event: React.ChangeEvent<HTMLInputElement>) {
    setMainPassword(event.target.value || "");
  }

  // 使用主密码解锁配置文件并初始化 app 配置
  // Unlock the configuration file with the master password and initialize the app configuration
  async function initConfFile(pwd: string, isDefultPwd: boolean) {
    // 主配置文件 | main configuration file
    const conf = await readConfigFile(pwd);
    try {
      const config = JSON.parse(conf) as ConfigFileMain;
      // 如果发现重名的连接名, 自动添加后缀
      // If duplicate connection names are found, automatically add suffixes
      const nameSet = new Set<string>();
      for (let index = 0; index < config.dbConnections.length; index++) {
        const conn = config.dbConnections[index];

        if (nameSet.has(conn.name)) config.dbConnections[index].name = `${conn.name}_${index}`;
        nameSet.add(conn.name);
      }

      // 补充外观配置 | Supplement appearance configuration
      const resA = await invoker.readFileText(CONFIG_FILE_APPEARANCE);
      try {
        if (resA.errorMessage === "") {
          const configA = JSON.parse(resA.result) as ConfigFileAppearance;
          config.settings.lang = configA.lang;
          config.settings.colorScheme = configA.colorScheme;
        }
      } catch (error) {
        console.log(`Error reading appearance configuration: ${error}`);
      }

      await coreState.setConfig(config, true);
      return true;
    } catch (error) {
      console.log(
        `Error parsing config file using ${isDefultPwd ? "default" : "user"} master password,
         File path: ${CONFIG_FILE_MAIN},
         File content: ${conf}`,
      );
      return false;
    }
  }

  async function checkConfigFile() {
    const res = await invoker.pathExists(CONFIG_FILE_MAIN);

    if (res) {
      // 先尝试使用默认密码副去, 出错的再弹出主密码输入框
      // First try to decrypt using the default password, then show the master password input dialog if it fails.
      const sha256 = await invoker.sha256(MAIN_PASSWORD_DEFAULT);
      const success = await initConfFile(sha256, true);
      if (success) setShowLock(false);
    } else {
      setShowLock(false);
    }
  }

  async function onSubmit() {
    const sha256 = await invoker.sha256(mainPassword);
    coreState.setMainPasswordSha(sha256);

    if (await initConfFile(sha256, false)) {
      setShowLock(false);
    } else {
      setErrorMessage(t("Incorrect password"));
    }
  }

  useEffect(() => {
    checkConfigFile();
  }, []);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <I18nextProvider i18n={i18n}>
        {showLock ? (
          <div className={"w-full h-full fixed top-0 left-0  z-10 bg-background"}>
            <div className="flex items-center justify-center min-h-screen p-4">
              <Card className="w-100">
                <CardHeader>
                  <CardTitle>
                    <div> {t("welcome.title", { name: APP_NAME })}</div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="py-4">
                    <Input value={mainPassword} onInput={onInputMainPassword} />
                  </div>

                  {errorMessage && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>{t("Error message")}</AlertTitle>
                      <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Button onClick={onSubmit}>{t("Unlock")}</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        ) : (
          <TooltipProvider>
            <Main id="main" className={""} />
          </TooltipProvider>
        )}
      </I18nextProvider>
    </ThemeProvider>
  );
}
