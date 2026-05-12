import type { ReactNode } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { AppQueryClientProvider } from "@/shared/providers/query-client-provider";
import { ThemeProvider } from "@/shared/providers/theme-provider";

export function PublicShell({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <ThemeProvider>
      <AppQueryClientProvider>
        <div className="flex min-h-screen flex-col">
          <header className="flex items-center justify-between border-b border-border-subtle bg-card/70 px-6 py-4 shadow-xs backdrop-blur">
            <div className="font-display text-lg font-bold">CleanMove</div>
            <ThemeToggle />
          </header>
          <main className="container mx-auto flex-1 px-6 py-8">{children}</main>
        </div>
      </AppQueryClientProvider>
    </ThemeProvider>
  );
}
