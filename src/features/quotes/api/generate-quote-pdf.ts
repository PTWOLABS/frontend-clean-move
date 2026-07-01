import { httpClient } from "@/shared/api/httpClient";

export async function generateQuotePdf(quoteId: string) {
  return await httpClient<Blob>(`/quotes/${quoteId}/pdf`, {
    headers: {
      Accept: "application/pdf",
    },
    responseType: "blob",
  });
}
