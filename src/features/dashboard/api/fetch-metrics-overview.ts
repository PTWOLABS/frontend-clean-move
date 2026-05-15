import { httpClient } from "@/shared/api/httpClient";
import { DashboardMetrics } from "./types";
import { DashboardMetricsOverviewFilters } from "../types/dashboard-sections";
import { buildQueryParamsFilters, normalizeQueryParamsFilters } from "@/shared/utils/lib";

export async function fetchMetricsOverview(filters?: DashboardMetricsOverviewFilters) {
  let normalizedFilters = normalizeQueryParamsFilters(filters);
  let buildedFilters = buildQueryParamsFilters(normalizedFilters);

  return await httpClient<DashboardMetrics>(`/dashboard/metrics/overview${buildedFilters}`);
}
