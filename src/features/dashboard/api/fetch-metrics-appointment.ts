import {
  DashboardMetricsAppointment,
  DashboardMetricsAppointmentsFilters,
} from "../types/dashboard-sections";
import { httpClient } from "@/shared/api/httpClient";

export async function fetchMetricsAppointment(filters?: DashboardMetricsAppointmentsFilters) {
  return await httpClient<DashboardMetricsAppointment, DashboardMetricsAppointmentsFilters>(
    "/dashboard/metrics/appointments",
    {
      filters,
    },
  );
}
