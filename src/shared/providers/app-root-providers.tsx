"use client";

import type { ReactNode } from "react";

import { AppQueryClientProvider } from "@/shared/providers/query-client-provider";

export function AppRootProviders({ children }: Readonly<{ children: ReactNode }>) {
  return <AppQueryClientProvider>{children}</AppQueryClientProvider>;
}
