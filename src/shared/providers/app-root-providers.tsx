"use client";

import type { ReactNode } from "react";

import { AppQueryClientProvider } from "@/shared/providers/query-client-provider";
import { BProgressProvider } from "./bprogress-provider";

export function AppRootProviders({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <AppQueryClientProvider>
      <BProgressProvider>{children}</BProgressProvider>
    </AppQueryClientProvider>
  );
}
