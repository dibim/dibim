import * as React from "react";
import { Database, DatabaseBackup, ScanSearch, SquareFunction, Table, View } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { APP_NAME } from "@/constants";
import { useCoreStore } from "@/store";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { sidebarOpen } = useCoreStore();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              {sidebarOpen ? (
                <span className="text-xl font-semibold cursor-pointer">{APP_NAME}</span>
              ) : (
                // TODO: 做一个自己的图标
                <p></p>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={"数据库"}>
              <Database />
              <span>数据库</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={"表格"}>
              <Table />
              <span>表格</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={"函数"}>
              <SquareFunction />
              <span>函数</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={"视图"}>
              <View />
              <span>视图</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={"查询"}>
              <ScanSearch />
              <span>查询</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={"备份"}>
              <DatabaseBackup />
              <span>备份</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
