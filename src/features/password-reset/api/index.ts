import { httpClient } from "@/shared/api/httpClient";

import type {
  ConfirmPasswordResetPayload,
  PasswordResetMessageResponse,
  RequestPasswordResetPayload,
} from "../types";

export async function requestPasswordReset(payload: RequestPasswordResetPayload) {
  return httpClient<PasswordResetMessageResponse>("/auth/password-reset/request", {
    method: "POST",
    body: payload,
  });
}

export async function confirmPasswordReset(payload: ConfirmPasswordResetPayload) {
  return httpClient<PasswordResetMessageResponse>("/auth/password-reset/confirm", {
    method: "POST",
    body: payload,
  });
}
