"use client";

import { AppProgressProvider } from "@bprogress/next";
import { ReactNode } from "react";

export function BProgressProvider({ children }: { children: ReactNode }) {
  return <AppProgressProvider options={{ showSpinner: false }}>{children}</AppProgressProvider>;
}
