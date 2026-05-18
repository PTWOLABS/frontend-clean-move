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

  it("serializes dates as UTC ISO strings", () => {
    const normalizedFilters = normalizeQueryParamsFilters({
      startsAt: new Date(2026, 3, 1),
      endsAt: new Date(2026, 3, 7),
    });

    expect(normalizedFilters).toEqual({
      startsAt: "2026-04-01T00:00:00.000Z",
      endsAt: "2026-04-07T00:00:00.000Z",
    });
    expect(buildQueryParamsFilters(normalizedFilters)).toBe(
      "?startsAt=2026-04-01T00%3A00%3A00.000Z&endsAt=2026-04-07T00%3A00%3A00.000Z",
    );
  });
});
