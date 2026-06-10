import { httpClient } from "@/shared/api/httpClient";

export async function deleteUserProfileImage() {
  return httpClient<void>("/user/profile-image", {
    method: "DELETE",
  });
}
