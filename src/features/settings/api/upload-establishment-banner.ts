import { httpClient } from "@/shared/api/httpClient";

import type { UploadMediaResponse } from "@/features/user/types";

export async function uploadEstablishmentBanner(
  establishmentId: string,
  file: File,
): Promise<UploadMediaResponse> {
  const formData = new FormData();
  formData.append("file", file);

  return httpClient<UploadMediaResponse>(`/establishments/${establishmentId}/banner-image`, {
    method: "POST",
    body: formData,
  });
}
