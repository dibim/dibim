import * as React from "react";
import {
  Database,
  DatabaseBackup,
  FilePenLine,
  Link,
  ScanSearch,
  Settings,
  SquareFunction,
  Table,
  View,
} from "lucide-react";
import Logo from "@/assets/logo.svg?react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  APP_NAME,
  MAIN_CONTEN_TYPE_ADD_CONNECTION,
  MAIN_CONTEN_TYPE_SETTINGS,
  MAIN_CONTEN_TYPE_SQL_EDITOR,
  SUB_SIDEBAR_TYPE_DB_LIST,
  SUB_SIDEBAR_TYPE_FUNC_LIST,
  SUB_SIDEBAR_TYPE_TABLE_LIST,
  SUB_SIDEBAR_TYPE_VIEW_LIST,
} from "@/constants";
import { useCoreStore } from "@/store";

export function MainSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { sidebarOpen, setMainContenType, subSidebarType, setSubSidebarType, subSetSidebarOpen } = useCoreStore();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Logo className="-p-2 -m-2 me-2" />
              {sidebarOpen && <span className="text-xl font-semibold cursor-pointer">{APP_NAME}</span>}
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
                setSubSidebarType(SUB_SIDEBAR_TYPE_DB_LIST);
                subSetSidebarOpen(true);
              }}
            >
              <Database />
              <span
                className={`${subSidebarType === SUB_SIDEBAR_TYPE_DB_LIST ? "font-bold text-[var(--fvm-primary-clr)]" : ""}`}
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
                setSubSidebarType(SUB_SIDEBAR_TYPE_TABLE_LIST);
                subSetSidebarOpen(true);
              }}
            >
              <Table />
              <span
                className={`${subSidebarType === SUB_SIDEBAR_TYPE_TABLE_LIST ? "font-bold text-[var(--fvm-primary-clr)]" : ""}`}
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
                setSubSidebarType(SUB_SIDEBAR_TYPE_FUNC_LIST);
                subSetSidebarOpen(true);
              }}
            >
              <SquareFunction />
              <span
                className={`${subSidebarType === SUB_SIDEBAR_TYPE_FUNC_LIST ? "font-bold text-[var(--fvm-primary-clr)]" : ""}`}
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
                setSubSidebarType(SUB_SIDEBAR_TYPE_VIEW_LIST);
                subSetSidebarOpen(true);
              }}
            >
              <View />
              <span
                className={`${subSidebarType === SUB_SIDEBAR_TYPE_VIEW_LIST ? "font-bold text-[var(--fvm-primary-clr)]" : ""}`}
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
                setMainContenType(MAIN_CONTEN_TYPE_ADD_CONNECTION);
                subSetSidebarOpen(true);
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
                setMainContenType(MAIN_CONTEN_TYPE_SQL_EDITOR);
                subSetSidebarOpen(true);
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
                subSetSidebarOpen(true);
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
                setMainContenType(MAIN_CONTEN_TYPE_SETTINGS);
                subSetSidebarOpen(true);
              }}
            >
              <Settings color="var(--fvm-info-clr)" />
              <span>设置</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
