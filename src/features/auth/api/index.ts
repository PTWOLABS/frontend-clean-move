import { httpClient } from "@/shared/api/httpClient";

import type { AuthUser, LoginPayload, LoginResponse } from "../types";

export async function login(payload: LoginPayload) {
  return httpClient<LoginResponse>("/auth/login", {
    method: "POST",
    body: payload,
  });
}

export async function getCurrentUser() {
  return httpClient<AuthUser>("/auth/me");
}
