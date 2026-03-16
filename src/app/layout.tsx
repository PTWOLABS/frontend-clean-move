import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/shared/providers/theme-provider";
import { AppQueryClientProvider } from "@/shared/providers/query-client-provider";
import { ThemeToggle } from "@/components/theme-toggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Clean-move",
  description: "Plataforma de agendamento para lava-rápido",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background text-foreground antialiased`}
      >
        <ThemeProvider>
          <AppQueryClientProvider>
            <div className="flex min-h-screen flex-col">
              <header className="flex items-center justify-between border-b px-6 py-4">
                <h1 className="text-lg font-semibold">Clean-move</h1>
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
