import * as React from "react";
import { useTranslation } from "react-i18next";
import { Database, FilePenLine, Link, Settings, Table } from "lucide-react";
import { useSnapshot } from "valtio";
import Logo from "@/assets/logo.svg?react";
import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  Sidebar as SidebarSc,
} from "@/components/ui/sidebar";
import {
  APP_NAME,
  LIST_BAR_TYPE_DB_LIST,
  LIST_BAR_TYPE_TABLE_LIST,
  MAIN_CONTEN_TYPE_ADD_CONNECTION,
  MAIN_CONTEN_TYPE_SETTINGS,
  MAIN_CONTEN_TYPE_SQL_EDITOR,
} from "@/constants";
import { appState } from "@/store/valtio";

export function Sidebar({ ...props }: React.ComponentProps<typeof SidebarSc>) {
  const { t } = useTranslation();
  const snap = useSnapshot(appState);

  return (
    <SidebarSc collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Logo className="-p-2 -m-2 me-2" />
              {snap.sidebarOpen && <span className="text-xl font-semibold cursor-pointer">{APP_NAME}</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={t("Databases")}
              onClick={() => {
                snap.setListBarType(LIST_BAR_TYPE_DB_LIST);
                snap.setListBarOpen(true);
              }}
            >
              <Database />
              <span
                className={`${snap.listBarType === LIST_BAR_TYPE_DB_LIST ? "font-bold text-[var(--fvm-primary-clr)]" : ""}`}
              >
                {t("Databases")}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={t("Tables")}
              onClick={() => {
                snap.setListBarType(LIST_BAR_TYPE_TABLE_LIST);
                snap.setListBarOpen(true);
              }}
            >
              <Table />
              <span
                className={`${snap.listBarType === LIST_BAR_TYPE_TABLE_LIST ? "font-bold text-[var(--fvm-primary-clr)]" : ""}`}
              >
                {t("Tables")}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {/* 
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={t("Functions")}
              onClick={() => {
                snap.setListBarType(LIST_BAR_TYPE_FUNC_LIST);
                snap.setListBarOpen(true);
              }}
            >
              <SquareFunction />
              <span
                className={`${snap.listBarType === LIST_BAR_TYPE_FUNC_LIST ? "font-bold text-[var(--fvm-primary-clr)]" : ""}`}
              >
                {t("Functions")}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={t("Views")}
              onClick={() => {
                snap.setListBarType(LIST_SUB_SIDEBAR_TYPE_VIEW_LIST);
                snap.setListBarOpen(true);
              }}
            >
              <View />
              <span
                className={`${snap.listBarType === LIST_SUB_SIDEBAR_TYPE_VIEW_LIST ? "font-bold text-[var(--fvm-primary-clr)]" : ""}`}
              >
              {t("Views")}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
         */}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={t("Add database connection")}
              onClick={() => {
                snap.setMainContenType(MAIN_CONTEN_TYPE_ADD_CONNECTION);
                snap.setListBarOpen(true);
              }}
            >
              <Link color="var(--fvm-info-clr)" />
              <span>{t("Add database connection")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={t("SQL editor")}
              onClick={() => {
                snap.setMainContenType(MAIN_CONTEN_TYPE_SQL_EDITOR);
                snap.setListBarOpen(true);
              }}
            >
              <FilePenLine color="var(--fvm-info-clr)" />
              <span>{t("SQL editor")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* 
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={t("Backup")}
              onClick={() => {
                snap.setMainContenType(MAIN_CONTEN_TYPE_SETTINGS);
                snap.setListBarOpen(true);
              }}
            >
              <DatabaseBackup color="var(--fvm-info-clr)" />
              <span>{t("Backup")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu> 
        */}

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={t("Settings")}
              onClick={() => {
                snap.setMainContenType(MAIN_CONTEN_TYPE_SETTINGS);
                snap.setListBarOpen(true);
              }}
            >
              <Settings color="var(--fvm-info-clr)" />
              <span>{t("Settings")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </SidebarSc>
  );
}
