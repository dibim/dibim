import { useTranslation } from "react-i18next";
import { Database, FilePenLine, Link, Settings, Table } from "lucide-react";
import { useSnapshot } from "valtio";
import Logo from "@/assets/logo.svg?react";
import {
  LIST_BAR_DB,
  LIST_BAR_TABLE,
  MAIN_AREA_ADD_CONNECTION,
  MAIN_AREA_SETTINGS,
  MAIN_AREA_SQL_EDITOR,
} from "@/constants";
import { getTab } from "@/context";
import { cn } from "@/lib/utils";
import { coreState, setTabTitle } from "@/store/core";
import { MainAreaType } from "@/types/types";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface SidebarProps {
  ref: React.Ref<HTMLDivElement>;
}

export function Sidebar({ ref }: SidebarProps) {
  const { t } = useTranslation();
  const coreSnap = useSnapshot(coreState);

  function setMainAreaType(val: MainAreaType) {
    coreState.setListBarOpen(true);

    const tab = getTab();
    if (tab !== null) {
      tab.state.setMainAreaType(val);
    }
  }
  return (
    <div
      className={cn("hidden md:flex md:flex-col", "h-full w-16 fixed left-0 top-0 z-10", "border-r bg-background")}
      ref={ref}
    >
      {/* 头部 | Header */}
      <div className="flex h-16 items-center justify-center border-b p-4">
        <div className="h-8 w-8 rounded-md flex items-center justify-center">
          <Logo className=" size-8" />
        </div>
      </div>

      {/* 主要部分 | Main content */}
      <nav className="flex-1 flex flex-col items-center gap-4 p-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              onClick={() => {
                coreState.setListBarType(LIST_BAR_DB);
                coreState.setListBarOpen(true);
              }}
            >
              <Database color={`var(${coreSnap.listBarType === LIST_BAR_DB ? "--fvm-primary-clr" : "--foreground"})`} />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t("Databases")}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div
              onClick={() => {
                coreState.setListBarType(LIST_BAR_TABLE);
                coreState.setListBarOpen(true);
              }}
            >
              <Table color={`var(${coreSnap.listBarType === LIST_BAR_TABLE ? "--fvm-primary-clr" : "--foreground"})`} />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t("Tables")}</p>
          </TooltipContent>
        </Tooltip>
      </nav>

      {/* 尾部 | Footer */}
      <div className="p-4 flex flex-col items-center gap-4 border-t">
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              onClick={() => {
                setMainAreaType(MAIN_AREA_ADD_CONNECTION);
                setTabTitle(t("Add database connection"));
              }}
            >
              <Link />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t("Add database connection")}</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              onClick={() => {
                setMainAreaType(MAIN_AREA_SQL_EDITOR);
                setTabTitle(t("SQL editor"));
              }}
            >
              <FilePenLine />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t("SQL editor")}</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              onClick={() => {
                setMainAreaType(MAIN_AREA_SETTINGS);
                setTabTitle(t("Settings"));
              }}
            >
              <Settings />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t("Settings")}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
