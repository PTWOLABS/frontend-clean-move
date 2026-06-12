import type { ReactNode } from "react";

import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PrivateAuthGate } from "@/features/auth/components/private-auth-gate";
import { ThemeProvider } from "@/shared/providers/theme-provider";

export function AppShell({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <PrivateAuthGate>
          <div className="flex min-h-screen w-full bg-background">
            <AppSidebar />

            <SidebarInset className="min-w-0 flex-1 transition-[margin,width] duration-300 ease-clean-in-out">
              <AppHeader />

              <main className="w-full px-4 py-6 md:px-8 md:py-8">{children}</main>
            </SidebarInset>
          </div>
        </PrivateAuthGate>
      </SidebarProvider>
    </ThemeProvider>
  );
}
