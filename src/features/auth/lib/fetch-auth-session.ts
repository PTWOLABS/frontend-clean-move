import { ensureSessionFromCookie } from "@/shared/api/httpClient";

import { getCurrentUser } from "../api";
import type { AuthUser } from "../types";
import { UnauthenticatedError } from "./unauthenticated-error";

/** Hidrata sessão pós-F5: refresh por cookie + utilizador atual. */
export async function fetchAuthSession(): Promise<AuthUser> {
  const ok = await ensureSessionFromCookie();
  if (!ok) {
    throw new UnauthenticatedError();
  }
  return getCurrentUser();
}
