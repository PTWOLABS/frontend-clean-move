import { describe, expect, it } from "vitest";

import type { AppointmentsFilters } from "@/features/appointments/types/api-filters";

import { QUERY_KEYS } from "./query-keys";

describe("QUERY_KEYS appointments", () => {
  it("builds appointment keys from named parameters", () => {
    const filters: AppointmentsFilters = {
      startsAt: "2026-05-01T00:00:00.000Z",
      endsAt: "2026-06-01T00:00:00.000Z",
      status: ["SCHEDULED"],
    };

    expect(QUERY_KEYS.appointments()).toEqual(["appointments"]);
    expect(QUERY_KEYS.appointments({ filters })).toEqual(["appointments", "list", filters]);
    expect(QUERY_KEYS.appointments({ appointmentId: "appointment-1" })).toEqual([
      "appointments",
      "detail",
      "appointment-1",
    ]);
    expect(QUERY_KEYS.appointments({ appointmentId: "appointment-1", filters })).toEqual([
      "appointments",
      "detail",
      "appointment-1",
      "filters",
      filters,
    ]);
  });
});

describe("QUERY_KEYS services", () => {
  it("builds service list keys separate from options", () => {
    const filters = { page: 1, size: 5, name: "lavagem", isActive: true as const };

    expect(QUERY_KEYS.services()).toEqual(["services", "list"]);
    expect(QUERY_KEYS.services(filters)).toEqual(["services", "list", filters]);
    expect(QUERY_KEYS.serviceOptions()).toEqual(["services", "options"]);
    expect(QUERY_KEYS.serviceOptions({ limit: 1000 })).toEqual([
      "services",
      "options",
      { limit: 1000 },
    ]);
  });
});
