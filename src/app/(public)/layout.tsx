import type { ReactNode } from "react";

import { AppShell } from "@/components/app-shell";

export default function PublicLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <AppShell>{children}</AppShell>;
}
