import { httpClient } from "@/shared/api/httpClient";
import {
  AnalyzeQuoteApprovalBody,
  AnalyzeQuoteApprovalResponseDto,
} from "../types/analyze-quote-approval";

export async function analyzeQuoteApproval(quoteId: string, body: AnalyzeQuoteApprovalBody) {
  return await httpClient<AnalyzeQuoteApprovalResponseDto>(`/quotes/${quoteId}/approval-analysis`, {
    body,
    method: "POST",
  });
}
