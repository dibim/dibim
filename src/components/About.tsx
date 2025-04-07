import { useTranslation } from "react-i18next";
import { useSnapshot } from "valtio";
import Logo from "@/assets/logo.svg?react";
import { APP_NAME, APP_VERSION } from "@/constants";
import { appState } from "@/store/valtio";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/x_alert-dialog";

export function About() {
  const { t } = useTranslation();
  const snap = useSnapshot(appState);

  return (
    <AlertDialog open={snap.aboutOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("About")}</AlertDialogTitle>
          <AlertDialogDescription></AlertDialogDescription>
        </AlertDialogHeader>

        <div className="p-2">
          <div className="flex">
            <Logo className="size-28" />
            <div>
              <div className="text-6xl">{APP_NAME}</div>
              <div className="text-2xl text-accent-foreground">{APP_VERSION}</div>
            </div>
          </div>
          <div className="pt-4">
            {t("&officialRepo")}
            <ul>
              <li>
                <strong>GitHub</strong>: https://github.com/dibim/dibim
              </li>
              <li>
                <strong>Gitee({t("China")})</strong>: https://gitee.com/dibim/dibim
              </li>
              <li>
                <strong>Codeberg({t("Germany")})</strong>: https://codeberg.org/dibim/dibim
              </li>
            </ul>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={() => {
              appState.setAboutOpen(false);
            }}
          >
            {t("Confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
