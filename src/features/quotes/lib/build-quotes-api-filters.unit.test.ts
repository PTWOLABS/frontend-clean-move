import { describe, expect, it } from "vitest";

import { buildQuotesApiFilters, DEFAULT_QUOTES_FILTERS } from "./build-quotes-api-filters";

describe("buildQuotesApiFilters", () => {
  it("formats expiration range filters as Sao Paulo day bounds in UTC ISO", () => {
    const filters = buildQuotesApiFilters({
      ...DEFAULT_QUOTES_FILTERS,
      expiresRange: {
        from: new Date(2026, 5, 30),
        to: new Date(2026, 5, 30),
      },
    });

    expect(filters.expiresFrom).toBe("2026-06-30T03:00:00.000Z");
    expect(filters.expiresTo).toBe("2026-07-01T02:59:59.999Z");
  });
});
