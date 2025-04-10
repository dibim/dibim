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
  LIST_BAR_DB,
  LIST_BAR_TABLE,
  MAIN_AREA_ADD_CONNECTION,
  MAIN_AREA_SETTINGS,
  MAIN_AREA_SQL_EDITOR,
} from "@/constants";
import { getTab } from "@/context";
import { appState } from "@/store/valtio";
import { MainAreaType } from "@/types/types";

export function Sidebar({ ...props }: React.ComponentProps<typeof SidebarSc>) {
  const { t } = useTranslation();
  const snap = useSnapshot(appState);

  function setMainAreaType(val: MainAreaType) {
    snap.setListBarOpen(true);

    const tab = getTab();
    if (tab !== null) {
      const store = tab.store;
      store.setMainAreaType(val);
    }
  }

  return (
    <SidebarSc collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Logo className="-p-2 -m-2 me-2 !size-8" />
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
                snap.setListBarType(LIST_BAR_DB);
                snap.setListBarOpen(true);
              }}
            >
              <Database
                className="ms-2"
                color={`var(${snap.listBarType === LIST_BAR_DB ? "--fvm-primary-clr" : "--foreground"})`}
              />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={t("Tables")}
              onClick={() => {
                snap.setListBarType(LIST_BAR_TABLE);
                snap.setListBarOpen(true);
              }}
            >
              <Table
                className="ms-2"
                color={`var(${snap.listBarType === LIST_BAR_TABLE ? "--fvm-primary-clr" : "--foreground"})`}
              />
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
              <SquareFunction
                className="ms-2"
                color={`var(${snap.listBarType === LIST_BAR_TYPE_FUNC_LIST ? "--fvm-primary-clr" : "--foreground"})`} 
              />
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
              <View 
                className="ms-2"
                color={`var(${snap.listBarType === LIST_SUB_SIDEBAR_TYPE_VIEW_LIST ? "--fvm-primary-clr" : "--foreground"})`} 
              />
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
                setMainAreaType(MAIN_AREA_ADD_CONNECTION);
              }}
            >
              <Link />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={t("SQL editor")}
              onClick={() => {
                setMainAreaType(MAIN_AREA_SQL_EDITOR);
              }}
            >
              <FilePenLine />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* 
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={t("Backup")}
              onClick={() => {
                setMainAreaType(MAIN_CONTEN_TYPE_SETTINGS);
              }}
            >
              <DatabaseBackup/>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu> 
        */}

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={t("Settings")}
              onClick={() => {
                setMainAreaType(MAIN_AREA_SETTINGS);
              }}
            >
              <Settings />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </SidebarSc>
  );
}
