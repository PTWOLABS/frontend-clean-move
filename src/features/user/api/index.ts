import { httpClient } from "@/shared/api/httpClient";

import type {
  ConfirmPasswordChangePayload,
  GetCurrentUserResponse,
  MessageResponse,
  RequestPasswordChangeCodePayload,
  UpdateUserProfilePayload,
  User,
} from "../types";

export async function getCurrentUserProfile(): Promise<User> {
  const res = await httpClient<GetCurrentUserResponse>("/user/me");
  return res.user;
}

export async function updateUserProfile(payload: UpdateUserProfilePayload): Promise<User> {
  const res = await httpClient<GetCurrentUserResponse>("/user/me", {
    method: "PATCH",
    body: payload,
  });
  return res.user;
}

export async function requestPasswordChangeCode(payload: RequestPasswordChangeCodePayload) {
  return httpClient<MessageResponse>("/user/me/password/confirmation-code", {
    method: "POST",
    body: payload,
  });
}

export async function updateUserPassword(payload: ConfirmPasswordChangePayload) {
  return httpClient<MessageResponse>("/user/me/password", {
    method: "POST",
    body: payload,
  });
}
