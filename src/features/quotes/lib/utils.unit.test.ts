/** @vitest-environment node */

import { describe, expect, it } from "vitest";

import { formatShortDate } from "./utils";

describe("formatShortDate", () => {
  it("formats UTC quote dates in Sao Paulo civil time", () => {
    expect(formatShortDate("2026-07-09T00:06:34.252Z")).toBe("08/07");
    expect(formatShortDate("2026-07-01T00:00:00.000Z")).toBe("30/06");
    expect(formatShortDate("2026-06-30T03:00:00.000Z")).toBe("30/06");
  });

  it("keeps fallback labels for missing or invalid dates", () => {
    expect(formatShortDate(null)).toBe("sem data");
    expect(formatShortDate("invalid-date")).toBe("data inválida");
  });
});
