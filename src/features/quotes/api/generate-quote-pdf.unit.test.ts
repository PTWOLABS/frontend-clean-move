import { describe, expect, it, vi } from "vitest";

const httpClientMock = vi.fn();

vi.mock("@/shared/api/httpClient", () => ({
  httpClient: (...args: unknown[]) => httpClientMock(...args),
}));

import { generateQuotePdf } from "./generate-quote-pdf";

describe("generateQuotePdf", () => {
  it("requests the PDF through the documented GET endpoint", async () => {
    const pdf = new Blob(["PDF"]);
    httpClientMock.mockResolvedValueOnce(pdf);

    await expect(generateQuotePdf("quote-id")).resolves.toBe(pdf);

    expect(httpClientMock).toHaveBeenCalledWith("/quotes/quote-id/pdf", {
      headers: { Accept: "application/pdf" },
      responseType: "blob",
    });
  });
});
