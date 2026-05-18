import { httpClient } from "@/shared/api/httpClient";
import { DashboardMetricsOverview } from "./types";
import { DashboardMetricsOverviewFilters } from "../types/dashboard-sections";

export async function fetchMetricsOverview(filters?: DashboardMetricsOverviewFilters) {
  return await httpClient<DashboardMetricsOverview, DashboardMetricsOverviewFilters>(
    "/dashboard/metrics/overview",
    {
      filters,
    },
  );
}
