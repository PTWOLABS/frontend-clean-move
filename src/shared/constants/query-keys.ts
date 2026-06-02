import type { ListCustomersQuery } from "@/features/customer/types";
import type { DashboardTopCustomersFilters } from "@/features/dashboard/types/dashboard-sections";
import type { ListVehiclesQuery, VehicleOptionsQuery } from "@/features/vehicle/types";
import type { OptionsQuery } from "@/shared/types/options-query";
import type { AppointmentsQueryKeyParams } from "../types/appointments";

export const QUERY_KEYS = {
  authSession: ["auth", "session"] as const,
  login: ["login"],
  googleLogin: ["googleLogin"],
  logout: ["logout"],
  registerEstablishment: ["registerEstablishment"],
  metricsOverview: ["metrics-overview"],
  metricsAppointment: ["metrics-appointment"],
  popularServices: ["popular-services"],
  revenueAndAppointments: ["revenue-and-appointments"],
  appointments: (params?: AppointmentsQueryKeyParams) => {
    const root = ["appointments"] as const;

    if (!params) {
      return root;
    }

    const { appointmentId, filters } = params;

    if (appointmentId && filters) {
      return [...root, "detail", appointmentId, "filters", filters] as const;
    }

    if (appointmentId) {
      return [...root, "detail", appointmentId] as const;
    }

    if (filters) {
      return [...root, "list", filters] as const;
    }

    return root;
  },
  services: (filters?: { page?: number; size?: number; name?: string; isActive?: boolean }) =>
    filters ? (["services", filters] as const) : (["services"] as const),
  customers: (filters?: ListCustomersQuery) =>
    filters ? (["customers", filters] as const) : (["customers"] as const),
  topCustomers: (filters?: DashboardTopCustomersFilters) =>
    filters
      ? (["dashboard", "top-customers", filters] as const)
      : (["dashboard", "top-customers"] as const),
  customerOptions: (filters?: OptionsQuery) =>
    filters ? (["customers", "options", filters] as const) : (["customers", "options"] as const),
  vehicles: (customerId: string, filters?: ListVehiclesQuery) =>
    filters ? (["vehicles", customerId, filters] as const) : (["vehicles", customerId] as const),
  vehiclesAll: () => ["vehicles"] as const,
  vehicleOptions: (filters?: VehicleOptionsQuery) =>
    filters ? (["vehicles", "options", filters] as const) : (["vehicles", "options"] as const),
  serviceOptions: (filters?: OptionsQuery) =>
    filters ? (["services", "options", filters] as const) : (["services", "options"] as const),
};
