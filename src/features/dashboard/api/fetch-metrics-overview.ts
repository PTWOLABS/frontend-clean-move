import { httpClient } from "@/shared/api/httpClient";
import { DashboardMetrics } from "./types";

export async function fetchMetricsOverview(filters?: string) {
  return await httpClient<DashboardMetrics>(`/dashboard/metrics/overview?${filters}`, {});
}
