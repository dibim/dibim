import { TooltipProvider } from "@radix-ui/react-tooltip";
import { MainSidebar } from "@/components/MainSidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import "@/styles/app.scss";
import "@/styles/index.css";
import "@/styles/theme.scss";
import { Main } from "./components/Main";
import { Toaster } from "./components/ui/sonner";

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
          <MainSidebar />
          <SidebarInset>
            <Main />
          </SidebarInset>
        </TooltipProvider>
      </SidebarProvider>

      <Toaster />
    </ThemeProvider>
  );
}
