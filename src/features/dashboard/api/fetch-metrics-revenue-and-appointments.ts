import { httpClient } from "@/shared/api/httpClient";
import { DashboardMetricsRevenueAndAppointmentsFilters } from "../types/dashboard-sections";
import { DashboardMetricsRevenueAndAppointments } from "../types/api-types";

export async function fetchMetricsRevenueAndAppointments(
  filters?: DashboardMetricsRevenueAndAppointmentsFilters,
) {
  return await httpClient<
    DashboardMetricsRevenueAndAppointments,
    DashboardMetricsRevenueAndAppointmentsFilters
  >("/dashboard/metrics/revenue", {
    filters,
  });
}
