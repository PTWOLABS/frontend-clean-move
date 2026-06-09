import { httpClient } from "@/shared/api/httpClient";

import type { UploadMediaResponse } from "@/features/user/types";

export async function uploadUserProfileImage(file: File): Promise<UploadMediaResponse> {
  const formData = new FormData();
  formData.append("file", file);

  return httpClient<UploadMediaResponse>("/user/profile-image", {
    method: "POST",
    body: formData,
  });
}
