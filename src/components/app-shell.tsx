import type { ReactNode } from "react";

import { AppSidebar, AppSidebarMobileTrigger } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppQueryClientProvider } from "@/shared/providers/query-client-provider";
import { ThemeProvider } from "@/shared/providers/theme-provider";

export function AppShell({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <ThemeProvider>
      <AppQueryClientProvider>
        <SidebarProvider>
          <div className="flex min-h-screen w-full bg-background">
            <AppSidebar />

            <SidebarInset className="min-w-0 flex-1 transition-[margin,width] duration-300 ease-clean-in-out">
              <div className="flex items-center justify-between px-4 pt-4 md:justify-end md:px-8 md:pt-6">
                <div className="md:hidden">
                  <AppSidebarMobileTrigger />
                </div>

                <ThemeToggle className="border border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground" />
              </div>

              <main className="w-full px-4 py-6 md:px-8 md:py-8">{children}</main>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </AppQueryClientProvider>
    </ThemeProvider>
  );
}
