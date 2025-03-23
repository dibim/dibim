import { AppSidebar } from "@/components/AppSidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/x_sidebar";
import "@/styles/index.css";
import { Main } from "./pages/Main";
import { useCoreStore } from "./store";

export default function Page() {
  const { currentDbNme, currentTableName: currentTable } = useCoreStore();

  // 侧边栏应该根据不同的语言设置合理的宽度
  const SIDEBAR_WIDTH = "6rem";
  const SIDEBAR_WIDTH_MOBILE = "15rem";

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <SidebarProvider SIDEBAR_WIDTH={SIDEBAR_WIDTH} SIDEBAR_WIDTH_MOBILE={SIDEBAR_WIDTH_MOBILE}>
        <AppSidebar SIDEBAR_WIDTH_MOBILE={SIDEBAR_WIDTH} />
        <SidebarInset>
          <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">{currentDbNme}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{currentTable}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <Main />
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  );
}
