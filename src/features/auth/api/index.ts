import { getCurrentUserProfile } from "@/features/user/api";
import { httpClient } from "@/shared/api/httpClient";

import type { AuthSessionResponse, AuthUser, GoogleLoginPayload, LoginPayload } from "../types";

export async function login(payload: LoginPayload) {
  return httpClient<AuthSessionResponse>("/auth/login", {
    method: "POST",
    body: payload,
  });
}

export async function loginWithGoogle(payload: GoogleLoginPayload) {
  return httpClient<AuthSessionResponse>("/auth/google", {
    method: "POST",
    body: payload,
  });
}

export async function getCurrentUser(): Promise<AuthUser> {
  const user = await getCurrentUserProfile();
  return { id: user.id, name: user.name, email: user.email };
}

export async function signOut() {
  return httpClient<unknown>("/auth/sign-out", {
    method: "POST",
  });
}
