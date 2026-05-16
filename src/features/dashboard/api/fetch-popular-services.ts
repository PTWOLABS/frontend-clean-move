import { httpClient } from "@/shared/api/httpClient";
import { DashboardPopularServices } from "./types";
import { DashboardPopularServicesFilters } from "../types/dashboard-sections";

export async function fetchPopularServices(filters?: DashboardPopularServicesFilters) {
  return await httpClient<DashboardPopularServices, DashboardPopularServicesFilters>(
    "/dashboard/metrics/popular-services",
    {
      filters,
    },
  );
}
