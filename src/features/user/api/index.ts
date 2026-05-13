import { httpClient } from "@/shared/api/httpClient";

import type { GetCurrentUserResponse, User } from "../types";

export async function getCurrentUserProfile(): Promise<User> {
  const res = await httpClient<GetCurrentUserResponse>("/user/me");
  return res.user;
}
