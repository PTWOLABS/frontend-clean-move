import { httpClient } from "@/shared/api/httpClient";
import type { ApproveQuoteBody, ApproveQuoteResponseDto } from "../types/quote-approval";

export async function approveQuote(quoteId: string, body: ApproveQuoteBody) {
  return await httpClient<ApproveQuoteResponseDto>(`/quotes/${quoteId}/approve`, {
    body,
    method: "POST",
  });
}
