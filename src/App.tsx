import { TooltipProvider } from "@radix-ui/react-tooltip";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import "@/styles/app.scss";
import "@/styles/index.css";
import "@/styles/theme.scss";
import { Main } from "./components/Main";

export function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <SidebarProvider
        style={{
          "--sidebar-width": "8rem",
          "--sidebar-width-mobile": "20rem",
        }}
      >
        <TooltipProvider>
          <AppSidebar />
          <SidebarInset>
            <Main />
          </SidebarInset>
        </TooltipProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
}
