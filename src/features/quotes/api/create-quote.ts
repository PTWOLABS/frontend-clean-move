import { httpClient } from "@/shared/api/httpClient";
import type { CreateQuoteBody } from "../types/create-quote";

export async function createQuote(body: CreateQuoteBody) {
  return await httpClient<Blob>(`/quotes`, {
    body,
    method: "POST",
  });
}
