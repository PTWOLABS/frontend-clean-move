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
