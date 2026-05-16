import { DashboardMetricsAppointmentsFilters } from "../types/dashboard-sections";
import { httpClient } from "@/shared/api/httpClient";
import { DashboardMetricsAppointment } from "./types";

export async function fetchMetricsAppointment(filters?: DashboardMetricsAppointmentsFilters) {
  return await httpClient<DashboardMetricsAppointment, DashboardMetricsAppointmentsFilters>(
    "/dashboard/metrics/appointments",
    {
      filters,
    },
  );
}
