import { httpClient } from "@/shared/api/httpClient";
import { DashboardMetrics } from "./types";
import { DashboardMetricsOverviewFilters } from "../types/dashboard-sections";

export async function fetchMetricsOverview(filters?: DashboardMetricsOverviewFilters) {
  return await httpClient<DashboardMetrics, DashboardMetricsOverviewFilters>(
    "/dashboard/metrics/overview",
    {
      filters,
    },
  );
}
