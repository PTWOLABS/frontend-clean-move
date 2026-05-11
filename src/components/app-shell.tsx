import type { ReactNode } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
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
          <AppSidebar />
          <SidebarInset>
            <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border-subtle bg-background/90 px-4 backdrop-blur md:px-6">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="md:hidden" />
                <div>
                  <p className="font-display text-base font-semibold leading-none">CleanMove</p>
                  <p className="text-xs text-muted-foreground">Gestão operacional</p>
                </div>
              </div>
              <ThemeToggle />
            </header>
            <main className="container mx-auto flex-1 px-4 py-6 md:px-6 md:py-8">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </AppQueryClientProvider>
    </ThemeProvider>
  );
}
