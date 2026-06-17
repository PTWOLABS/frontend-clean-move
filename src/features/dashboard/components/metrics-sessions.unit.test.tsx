import { afterEach, describe, expect, it, vi } from "vitest";

import { normalizeQueryParamsFilters } from "@/shared/utils/lib";

import {
  getCustomDashboardDateRangeFilters,
  getDashboardMetricsFilters,
  limitCustomDashboardDateRange,
} from "./metrics-sessions";

afterEach(() => {
  vi.useRealTimers();
});

describe("getCustomDashboardDateRangeFilters", () => {
  it("normalizes custom endsAt to the end of the selected day", () => {
    const filters = getCustomDashboardDateRangeFilters({
      from: new Date(2026, 4, 1),
      to: new Date(2026, 4, 29),
    });

    expect(filters.startsAt).toEqual(new Date(2026, 4, 1));
    expect(filters.endsAt).toEqual(new Date(2026, 4, 29, 23, 59, 59, 999));
    expect(normalizeQueryParamsFilters(filters)).toEqual({
      startsAt: "2026-05-01T00:00:00.000Z",
      endsAt: "2026-05-29T23:59:59.999Z",
    });
  });

  it("keeps endsAt undefined when the custom range has no end date", () => {
    const filters = getCustomDashboardDateRangeFilters({
      from: new Date(2026, 4, 1),
    });

    expect(filters).toEqual({
      startsAt: new Date(2026, 4, 1),
      endsAt: undefined,
    });
    expect(normalizeQueryParamsFilters(filters)).toEqual({
      startsAt: "2026-05-01T00:00:00.000Z",
    });
  });

  it("limits custom ranges to 24 months before serializing filters", () => {
    const filters = getCustomDashboardDateRangeFilters({
      from: new Date(2024, 4, 29),
      to: new Date(2026, 4, 30),
    });

    expect(filters.endsAt).toEqual(new Date(2026, 4, 29, 23, 59, 59, 999));
    expect(normalizeQueryParamsFilters(filters)).toEqual({
      startsAt: "2024-05-29T00:00:00.000Z",
      endsAt: "2026-05-29T23:59:59.999Z",
    });
  });

  it("returns a date range capped at the 24 month limit", () => {
    const limitedDateRange = limitCustomDashboardDateRange({
      from: new Date(2024, 4, 29),
      to: new Date(2026, 5, 10),
    });

    expect(limitedDateRange).toEqual({
      from: new Date(2024, 4, 29),
      to: new Date(2026, 4, 29),
    });
  });

  it("uses preset filters for custom ranges that match a preset", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-29T12:00:00"));

    expect(
      getDashboardMetricsFilters({
        period: "custom",
        dateRange: {
          from: new Date(2026, 4, 23),
          to: new Date(2026, 4, 29),
        },
        status: "ALL",
      }),
    ).toEqual({
      period: "last-7-days",
      status: ["DONE", "SCHEDULED"],
    });

    expect(
      getDashboardMetricsFilters({
        period: "custom",
        dateRange: {
          from: new Date(2026, 3, 30),
          to: new Date(2026, 4, 29),
        },
        status: "DONE",
      }),
    ).toEqual({
      period: "last-30-days",
      status: ["DONE"],
    });

    expect(
      getDashboardMetricsFilters({
        period: "custom",
        dateRange: {
          from: new Date(2026, 4, 1),
          to: new Date(2026, 4, 31),
        },
        status: "SCHEDULED",
      }),
    ).toEqual({
      period: "this-month",
      status: ["SCHEDULED"],
    });
  });

  it("resolves all dashboard statuses to done and scheduled only", () => {
    const filters = getDashboardMetricsFilters({
      period: "last-30-days",
      status: "ALL",
    });

    expect(filters).toEqual({
      period: "last-30-days",
      status: ["DONE", "SCHEDULED"],
    });
    expect(filters.status).not.toContain("CANCELLED");
    expect(normalizeQueryParamsFilters(filters)).toEqual({
      period: "last-30-days",
      status: ["DONE", "SCHEDULED"],
    });
  });

  it("uses explicit date filters for custom ranges that do not match a preset", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-29T12:00:00"));

    const filters = getDashboardMetricsFilters({
      period: "custom",
      dateRange: {
        from: new Date(2026, 4, 2),
        to: new Date(2026, 4, 29),
      },
      status: "DONE",
    });

    expect(filters).toEqual({
      startsAt: new Date(2026, 4, 2),
      endsAt: new Date(2026, 4, 29, 23, 59, 59, 999),
      status: ["DONE"],
    });
  });
});
