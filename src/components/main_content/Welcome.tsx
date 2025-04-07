import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CirclePlus, Settings, Smile } from "lucide-react";
import {
  APP_NAME,
  MAIN_AREA_ADD_CONNECTION,
  MAIN_AREA_SETTINGS,
  MAIN_PASSWORD_DEFAULT,
} from "@/constants";
import { invoker } from "@/invoker";
import { appState } from "@/store/valtio";
import { Card, CardContent, CardDescription, CardFooter } from "../ui/card";

export function Welcome() {
  const { t } = useTranslation();
  const [showMainPasswordDiv, setShowMainPasswordDiv] = useState<boolean>(false);

  async function checkMainPassword() {
    const sha256 = await invoker.sha256(MAIN_PASSWORD_DEFAULT);

    setShowMainPasswordDiv(appState.mainPasswordSha === sha256);
  }

  useEffect(() => {
    checkMainPassword();
  }, []);

  return (
    <div className="flex items-center justify-center p-4">
      <Card className="w-150">
        <CardContent>
          <div className="flex items-center pb-4">
            <div className="pe-8">
              <Smile size={40} />
            </div>
            <div> {t("welcome.title", { name: APP_NAME })}</div>
          </div>
          {showMainPasswordDiv && (
            <div
              className="flex py-4 cursor-pointer"
              onClick={() => {
                appState.setMainContenType(MAIN_AREA_SETTINGS);
              }}
            >
              <div className="pe-4">
                <Settings />
              </div>
              <div>
                <p className="pb-4 font-bold ">{t("Set master password")}</p>
                <CardDescription className="pb-2">
                  <strong className="text-[var(--fvm-warning-clr)]">{t("welcome.&p1")}</strong>.
                </CardDescription>
                <CardDescription>{t("welcome.&p2")}</CardDescription>
              </div>
            </div>
          )}
          <div
            className="flex py-4 cursor-pointer"
            onClick={() => {
              appState.setMainContenType(MAIN_AREA_ADD_CONNECTION);
            }}
          >
            <div className="pe-4">
              <CirclePlus />
            </div>
            <div>{t("Add database connection")}</div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {/* <Button variant="outline">取消</Button> */}
          {/* <Button onClick={onSubmit}>确认</Button> */}
        </CardFooter>
      </Card>
    </div>
  );
}
