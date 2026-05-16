import { describe, expect, it } from "vitest";

import { buildQueryParamsFilters, normalizeQueryParamsFilters } from "./lib";

describe("query params filters", () => {
  it("formats array values as repeated query params", () => {
    const normalizedFilters = normalizeQueryParamsFilters({
      page: 1,
      size: 20,
      status: ["DONE", "SCHEDULED"],
    });

    expect(normalizedFilters).toEqual({
      page: "1",
      size: "20",
      status: ["DONE", "SCHEDULED"],
    });
    expect(buildQueryParamsFilters(normalizedFilters)).toBe(
      "?page=1&size=20&status=DONE&status=SCHEDULED",
    );
  });
});
