import type { ReactNode } from "react";

import { AppShell } from "@/components/app-shell";

export default function PrivateLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <AppShell>{children}</AppShell>;
}
