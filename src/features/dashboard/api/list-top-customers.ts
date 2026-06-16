import { httpClient } from "@/shared/api/httpClient";
import { DashboardTopCustomersFilters } from "../types/dashboard-sections";
import { TopCustomers } from "../types/api-types";

export async function listTopCustomers(filters?: DashboardTopCustomersFilters) {
  return await httpClient<TopCustomers, DashboardTopCustomersFilters>(
    "/dashboard/metrics/top-customers",
    {
      filters,
    },
  );
}
