/** @vitest-environment jsdom */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getInitialAgendaFiltersState, persistAgendaFilters } from "./agenda-filters-storage";

const AGENDA_FILTERS_STORAGE_KEY = "clean-move:agenda:appointment-filters";

describe("agenda filters storage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-19T12:00:00.000Z"));
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
    vi.useRealTimers();
  });

  it("does not persist the search input value", () => {
    persistAgendaFilters({
      statusFilter: "DONE",
      searchField: "customerName",
      search: "Ana Martins",
      periodMode: "custom",
      dateRange: {
        from: new Date("2026-06-10T12:00:00.000Z"),
        to: new Date("2026-06-12T12:00:00.000Z"),
      },
    });

    const storedFilters = JSON.parse(
      window.localStorage.getItem(AGENDA_FILTERS_STORAGE_KEY) ?? "{}",
    );

    expect(storedFilters).not.toHaveProperty("search");
    expect(storedFilters).toMatchObject({
      statusFilter: "DONE",
      searchField: "customerName",
      periodMode: "custom",
      dateRange: {
        from: "2026-06-10T12:00:00.000Z",
        to: "2026-06-12T12:00:00.000Z",
      },
    });
  });

  it("ignores search input values stored by previous versions", () => {
    window.localStorage.setItem(
      AGENDA_FILTERS_STORAGE_KEY,
      JSON.stringify({
        statusFilter: "CANCELLED",
        searchField: "vehiclePlate",
        search: "ABC-1234",
        periodMode: "all",
      }),
    );

    expect(getInitialAgendaFiltersState()).toMatchObject({
      statusFilter: "CANCELLED",
      searchField: "vehiclePlate",
      search: "",
      periodMode: "all",
    });
  });
});
