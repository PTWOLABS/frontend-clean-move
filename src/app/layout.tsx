import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

import { ThemeProvider } from "@/shared/providers/theme-provider";
import { AppQueryClientProvider } from "@/shared/providers/query-client-provider";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "CleanMove",
  description:
    "Plataforma SaaS premium para gestao de esteticas automotivas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        <ThemeProvider>
          <AppQueryClientProvider>
            <div className="flex min-h-screen flex-col">
              <header className="flex items-center justify-between border-b border-border-subtle bg-card/70 px-6 py-4 shadow-xs backdrop-blur">
                <h1 className="font-display text-lg font-bold">CleanMove</h1>
                <ThemeToggle />
              </header>
              <main className="container mx-auto flex-1 px-6 py-8">
                {children}
              </main>
            </div>
          </AppQueryClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
