import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle } from "lucide-react";
import { DIR_H, MAIN_PASSWORD_MIN_LEN } from "@/constants";
import { getTableDdl } from "@/databases/adapter,";
import { invoker } from "@/invoker";
import { appState } from "@/store/valtio";
import { ConfigFile } from "@/types/conf_file";
import { LabeledDiv } from "../LabeledDiv";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { HANS, HANT } from "@/i18n";

export function Settings() {
  const { t, i18n } = useTranslation();
  const [mainPassword, setMainPassword] = useState<string>("");
  const [theme, setTheme] = useState<string>("");
  const [lang, setLang] = useState<string>("");
  const [timeFormat, setTimeFormat] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>(""); // 错误消息
  const [okMessage, setOkMessage] = useState<string>(""); // 成功消息

  async function onInputMainPassword(event: React.ChangeEvent<HTMLInputElement>) {
    setMainPassword(event.target.value || "");
  }

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setLang(lng);
  };

  function onInpuTheme(event: React.ChangeEvent<HTMLInputElement>) {
    setTheme(event.target.value || "");
  }

  async function onSubmit() {
    // 检查密码
    if (mainPassword.length > 0 && mainPassword.length < MAIN_PASSWORD_MIN_LEN) {
      setErrorMessage(t("&minimumLengthOfMasterPassword", { len: MAIN_PASSWORD_MIN_LEN }));
      return;
    }

    if (mainPassword !== "") {
      // 设置主密码了的, 先设置 sha256, 后 执行 setConfig
      const sha256 = await invoker.sha256(mainPassword);
      appState.setMainPasswordSha(sha256);
    }

    await appState.setConfig({
      ...appState.config,
      settings: {
        ...appState.config.settings,
        lang,
        theme,
        timeFormat,
      },
      dbConnections: [...appState.config.dbConnections],
    } as ConfigFile);

    setOkMessage(t("Saved successfully"));
  }

  async function getData() {
    const res = await getTableDdl(appState.currentTableName);
    if (res && res.data) {
      // setTableData(res.data);
    }
  }

  useEffect(() => {
    getData();
  }, [appState.currentTableName]);

  useEffect(() => {
    getData();

    // TODO: 这几行视为了编译不报错
    setTimeFormat("");
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-200">
        <CardHeader>
          <CardTitle>{t("Settings")}</CardTitle>
        </CardHeader>
        <CardContent>
          <LabeledDiv direction={DIR_H} label={"🔑" + t("Master password")} className="py-2">
            <Input value={mainPassword} onInput={onInputMainPassword} />

            <div className="pt-2">
              <CardDescription>{t("welcome.&p1")} </CardDescription>
              <CardDescription>{t("welcome.&p2")}</CardDescription>
            </div>
          </LabeledDiv>

          <LabeledDiv direction={DIR_H} label={"🌐" + t("Language")} className="py-2">
            <Button className="m-2" onClick={() => changeLanguage("ar")}>
              العربية (Arabic)
            </Button>
            <Button className="m-2" onClick={() => changeLanguage("de")}>
              Deutsch (German)
            </Button>
            <Button className="m-2" onClick={() => changeLanguage("en")}>
              English
            </Button>
            <Button className="m-2" onClick={() => changeLanguage("es")}>
              Español (Spanish)
            </Button>
            <Button className="m-2" onClick={() => changeLanguage("fr")}>
              Français (French)
            </Button>
            <Button className="m-2" onClick={() => changeLanguage("it")}>
              Italian (Italiano)
            </Button>
            <Button className="m-2" onClick={() => changeLanguage("ja")}>
              日本語 (Japanese)
            </Button>
            <Button className="m-2" onClick={() => changeLanguage("ko")}>
              한국어 (Korean)
            </Button>
            <Button className="m-2" onClick={() => changeLanguage("nl")}>
              Dutch (Nederlands)
            </Button>
            <Button className="m-2" onClick={() => changeLanguage("pl")}>
              Polish (Polski)
            </Button>
            <Button className="m-2" onClick={() => changeLanguage("ru")}>
              Русский (Russian)
            </Button>
            <Button className="m-2" onClick={() => changeLanguage("tr")}>
              Turkish (Türkçe)
            </Button>
            <Button className="m-2" onClick={() => changeLanguage("uk")}>
              Ukrainian (Українська)
            </Button>
            <Button className="m-2" onClick={() => changeLanguage(HANS)}>
              简体中文 (Simplified Chinese)
            </Button>
            <Button className="m-2" onClick={() => changeLanguage(HANT)}>
              繁體中文 (Traditional Chinese)
            </Button>
          </LabeledDiv>

          <LabeledDiv direction={DIR_H} label={"🎨" + t("Theme")} className="py-2">
            <Input value={theme} onInput={onInpuTheme} />
          </LabeledDiv>

          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{t("Error message")}</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {okMessage && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{t("Tips")}</AlertTitle>
              <AlertDescription>{okMessage}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {/* <Button variant="outline">{t("Cancel")}</Button> */}
          <Button onClick={onSubmit}>{t("Confirm")}</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
