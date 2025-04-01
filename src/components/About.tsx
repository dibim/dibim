import { useSnapshot } from "valtio";
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
  const snap = useSnapshot(appState);

  return (
    <AlertDialog open={snap.aboutOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>关于</AlertDialogTitle>
          <AlertDialogDescription></AlertDialogDescription>
        </AlertDialogHeader>

        <div className="p-2">
          <div className="text-6xl">{APP_NAME}</div>
          <div className="text-2xl text-accent-foreground">{APP_VERSION}</div>
          <div className="pt-4">
            本项目的官方仓库如下:
            <ul>
              <li>
                <strong>GitHub</strong>: https://github.com/dibim/dibim
              </li>
              <li>
                <strong>Gitee(中国)</strong>: https://gitee.com/dibim/dibim
              </li>
              <li>
                <strong>Codeberg(德国)</strong>: https://codeberg.org/dibim/dibim
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
            确定
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
