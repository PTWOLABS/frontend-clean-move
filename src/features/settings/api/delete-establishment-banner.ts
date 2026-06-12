import { httpClient } from "@/shared/api/httpClient";

export async function deleteEstablishmentBanner(establishmentId: string) {
  return httpClient<void>(`/establishments/${establishmentId}/banner-image`, {
    method: "DELETE",
  });
}
