import { httpClient } from "@/shared/api/httpClient";

import type { GetCurrentUserResponse, UpdateUserProfilePayload, User } from "../types";

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
