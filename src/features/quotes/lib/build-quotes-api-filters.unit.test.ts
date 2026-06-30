import { describe, expect, it } from "vitest";

import { buildQuotesApiFilters, DEFAULT_QUOTES_FILTERS } from "./build-quotes-api-filters";

describe("buildQuotesApiFilters", () => {
  it("formats expiration range filters as full UTC-shaped local day bounds", () => {
    const filters = buildQuotesApiFilters({
      ...DEFAULT_QUOTES_FILTERS,
      expiresRange: {
        from: new Date(2026, 5, 30),
        to: new Date(2026, 5, 30),
      },
    });

    expect(filters.expiresFrom).toBe("2026-06-30T00:00:00.000Z");
    expect(filters.expiresTo).toBe("2026-06-30T23:59:59.999Z");
  });
});
