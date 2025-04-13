import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Moon, Sun } from "lucide-react";
import { DIR_H, MAIN_PASSWORD_MIN_LEN } from "@/constants";
import { getTab } from "@/context";
import { getTableDdl } from "@/databases/adapter,";
import { useActiveTabStore } from "@/hooks/useActiveTabStore";
import { HANS, HANT } from "@/i18n";
import { invoker } from "@/invoker";
import { addNotification, coreState } from "@/store/core";
import { ConfigFileMain } from "@/types/conf_file";
import { LabeledDiv } from "../LabeledDiv";
import { TextNotification } from "../TextNotification";
import { useTheme } from "../ThemeProvider";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";

export function Settings() {
  const tab = getTab();
  if (tab === null) return <p>No tab found</p>;
  const tabState = tab.state;

  const { t, i18n } = useTranslation();
  const { setTheme } = useTheme();
  const [mainPassword, setMainPassword] = useState<string>("");
  const [colorScheme, setColorScheme] = useState<string>("");
  const [lang, setLang] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [okMessage, setOkMessage] = useState<string>("");

  async function onInputMainPassword(event: React.ChangeEvent<HTMLInputElement>) {
    setMainPassword(event.target.value || "");
  }

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setLang(lng);
  };

  function changeTheme(theme: "dark" | "light") {
    setColorScheme(theme);
    setTheme(theme);
  }

  async function onSubmit() {
    if (mainPassword.length > 0 && mainPassword.length < MAIN_PASSWORD_MIN_LEN) {
      const message = t("&minimumLengthOfMasterPassword", { len: MAIN_PASSWORD_MIN_LEN });
      setErrorMessage(message);
      addNotification(message, "error");
      return;
    }

    if (mainPassword !== "") {
      const sha256 = await invoker.sha256(mainPassword);
      coreState.setMainPasswordSha(sha256);
    }

    await coreState.setConfig({
      ...coreState.config,
      settings: {
        ...coreState.config.settings,
        lang,
        colorScheme,
      },
      dbConnections: [...coreState.config.dbConnections],
    } as ConfigFileMain);
    const message = t("Saved successfully");
    setOkMessage(message);
    addNotification(message, "success");
  }

  async function getData() {
    const res = await getTableDdl(tabState.tableName);
    if (res && res.data) {
      // setTableData(res.data);
    }
  }

  // 监听 store 的变化 | Monitor changes in the store
  useActiveTabStore(coreState.activeTabId, "tableName", (_value: any) => {
    getData();
  });

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-220">
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
            <div className="flex flex-wrap gap-2">
              <Button className="bg-[#007A3D] hover:bg-[#006A34] text-white" onClick={() => changeLanguage("ar")}>
                العربية (Arabic)
              </Button>

              <Button className="bg-[#DE2910] hover:bg-[#C0240E] text-[#FFDE00]" onClick={() => changeLanguage(HANS)}>
                简体中文 (Simplified Chinese)
              </Button>

              <Button className="bg-[#FFD700] hover:bg-[#E6C200] text-[#DE2910]" onClick={() => changeLanguage(HANT)}>
                繁體中文 (Traditional Chinese)
              </Button>

              <Button className="bg-[#21468B] hover:bg-[#1A3A75] text-white" onClick={() => changeLanguage("nl")}>
                Nederlands (Dutch)
              </Button>

              <Button className="bg-[#0A3161] hover:bg-[#07244E] text-white" onClick={() => changeLanguage("en")}>
                English
              </Button>

              <Button className="bg-[#0055A4] hover:bg-[#00448C] text-white" onClick={() => changeLanguage("fr")}>
                Français (French)
              </Button>

              <Button className="bg-[#000000] hover:bg-[#2D2D2D] text-[#FFCC00]" onClick={() => changeLanguage("de")}>
                Deutsch (German)
              </Button>

              <Button className="bg-[#008C45] hover:bg-[#007339] text-white" onClick={() => changeLanguage("it")}>
                Italiano (Italian)
              </Button>

              <Button className="bg-white hover:bg-gray-100 text-[#BC002D]" onClick={() => changeLanguage("ja")}>
                日本語 (Japanese)
              </Button>

              <Button className="bg-white hover:bg-gray-100 text-[#003478]" onClick={() => changeLanguage("ko")}>
                한국어 (Korean)
              </Button>

              <Button className="bg-[#DC143C] hover:bg-[#C01134] text-white" onClick={() => changeLanguage("pl")}>
                Polski (Polish)
              </Button>

              <Button className="bg-[#0039A6] hover:bg-[#002D84] text-white" onClick={() => changeLanguage("ru")}>
                Русский (Russian)
              </Button>

              <Button className="bg-[#AA151B] hover:bg-[#8A1217] text-[#F1BF00]" onClick={() => changeLanguage("es")}>
                Español (Spanish)
              </Button>

              <Button className="bg-[#E30A17] hover:bg-[#C00813] text-white" onClick={() => changeLanguage("tr")}>
                Türkçe (Turkish)
              </Button>

              <Button className="bg-[#0057B8] hover:bg-[#0046A0] text-[#FFD700]" onClick={() => changeLanguage("uk")}>
                Українська (Ukrainian)
              </Button>
            </div>
          </LabeledDiv>

          <LabeledDiv direction={DIR_H} label={"🎨" + t("Theme")} className="py-2">
            <Button className="m-2" onClick={() => changeTheme("light")}>
              <Sun />
            </Button>
            <Button className="m-2" onClick={() => changeTheme("dark")}>
              <Moon />
            </Button>
          </LabeledDiv>

          {errorMessage && <TextNotification type="error" message={errorMessage}></TextNotification>}
          {okMessage && <TextNotification type="success" message={okMessage}></TextNotification>}
        </CardContent>
        <CardFooter className="flex justify-between">
          {/* <Button variant="outline">{t("Cancel")}</Button> */}
          <Button onClick={onSubmit}>{t("Confirm")}</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
