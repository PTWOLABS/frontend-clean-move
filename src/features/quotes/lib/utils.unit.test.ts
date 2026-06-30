/** @vitest-environment node */

import { describe, expect, it } from "vitest";

import { formatShortDate } from "./utils";

describe("formatShortDate", () => {
  it("formats quote dates in the Sao Paulo timezone", () => {
    expect(formatShortDate("2026-06-30T02:30:00.000Z")).toBe("29/06");
  });

  it("keeps fallback labels for missing or invalid dates", () => {
    expect(formatShortDate(null)).toBe("sem data");
    expect(formatShortDate("invalid-date")).toBe("data inválida");
  });
});
