import { httpClient } from "@/shared/api/httpClient";

import type { User } from "../types";

export async function getCurrentUserProfile() {
  return httpClient<User>("/users/me");
}
