import * as React from "react";
import { Database, DatabaseBackup, FilePenLine, Link, Settings, SquareFunction, Table, View } from "lucide-react";
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
  LIST_BAR_TYPE_FUNC_LIST,
  LIST_BAR_TYPE_TABLE_LIST,
  LIST_SUB_SIDEBAR_TYPE_VIEW_LIST,
  MAIN_CONTEN_TYPE_ADD_CONNECTION,
  MAIN_CONTEN_TYPE_SETTINGS,
  MAIN_CONTEN_TYPE_SQL_EDITOR,
} from "@/constants";
import { appState } from "@/store/valtio";

export function Sidebar({ ...props }: React.ComponentProps<typeof SidebarSc>) {
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
              tooltip={"数据库"}
              onClick={() => {
                snap.setListBarType(LIST_BAR_TYPE_DB_LIST);
                snap.setListBarOpen(true);
              }}
            >
              <Database />
              <span
                className={`${snap.listBarType === LIST_BAR_TYPE_DB_LIST ? "font-bold text-[var(--fvm-primary-clr)]" : ""}`}
              >
                数据库
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={"表格"}
              onClick={() => {
                snap.setListBarType(LIST_BAR_TYPE_TABLE_LIST);
                snap.setListBarOpen(true);
              }}
            >
              <Table />
              <span
                className={`${snap.listBarType === LIST_BAR_TYPE_TABLE_LIST ? "font-bold text-[var(--fvm-primary-clr)]" : ""}`}
              >
                表格
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={"函数"}
              onClick={() => {
                snap.setListBarType(LIST_BAR_TYPE_FUNC_LIST);
                snap.setListBarOpen(true);
              }}
            >
              <SquareFunction />
              <span
                className={`${snap.listBarType === LIST_BAR_TYPE_FUNC_LIST ? "font-bold text-[var(--fvm-primary-clr)]" : ""}`}
              >
                函数
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={"视图"}
              onClick={() => {
                snap.setListBarType(LIST_SUB_SIDEBAR_TYPE_VIEW_LIST);
                snap.setListBarOpen(true);
              }}
            >
              <View />
              <span
                className={`${snap.listBarType === LIST_SUB_SIDEBAR_TYPE_VIEW_LIST ? "font-bold text-[var(--fvm-primary-clr)]" : ""}`}
              >
                视图
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={"添加数据库"}
              onClick={() => {
                snap.setMainContenType(MAIN_CONTEN_TYPE_ADD_CONNECTION);
                snap.setListBarOpen(true);
              }}
            >
              <Link color="var(--fvm-info-clr)" />
              <span>添加数据库</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={"SQL编辑器"}
              onClick={() => {
                snap.setMainContenType(MAIN_CONTEN_TYPE_SQL_EDITOR);
                snap.setListBarOpen(true);
              }}
            >
              <FilePenLine color="var(--fvm-info-clr)" />
              <span>SQL编辑器</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={"备份"}
              onClick={() => {
                // setMainContenType(MAIN_CONTEN_TYPE_SETTINGS);
                snap.setListBarOpen(true);
              }}
            >
              <DatabaseBackup color="var(--fvm-info-clr)" />
              <span>备份</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={"设置"}
              onClick={() => {
                snap.setMainContenType(MAIN_CONTEN_TYPE_SETTINGS);
                snap.setListBarOpen(true);
              }}
            >
              <Settings color="var(--fvm-info-clr)" />
              <span>设置</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </SidebarSc>
  );
}
