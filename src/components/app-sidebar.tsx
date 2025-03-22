import * as React from "react";
import { Database, DatabaseBackup, ScanSearch, SquareFunction, Table, View } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <span className="text-xl font-semibold cursor-pointer">DIBIM</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* We create a SidebarGroup for each parent. */}

        <SidebarGroup key={"databases"}>
          <SidebarGroupContent>
            <div className="flex">
              <Database />
              <span className="ps-2 cursor-pointer">数据库</span>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup key={"databases"}>
          <SidebarGroupContent>
            <div className="flex">
              <Table />
              <span className="ps-2 cursor-pointer">表</span>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup key={"databases"}>
          <SidebarGroupContent>
            <div className="flex">
              <SquareFunction />
              <span className="ps-2 cursor-pointer">函数</span>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup key={"databases"}>
          <SidebarGroupContent>
            <div className="flex">
              <View />
              <span className="ps-2 cursor-pointer">试图</span>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup key={"databases"}>
          <SidebarGroupContent>
            <div className="flex">
              <ScanSearch />
              <span className="ps-2 cursor-pointer">查询</span>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup key={"databases"}>
          <SidebarGroupContent>
            <div className="flex">
              <DatabaseBackup />
              <span className="ps-2 cursor-pointer">备份</span>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
