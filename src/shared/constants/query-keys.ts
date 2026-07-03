import type { ListCustomersQuery } from "@/features/customer/types";
import type { ListServiceCategoriesQuery } from "@/features/service-category/types";
import type {
  ListEstablishmentVehiclesQuery,
  ListVehiclesQuery,
  VehicleOptionsQuery,
} from "@/features/vehicle/types";
import type { DashboardTopCustomersFilters } from "@/features/dashboard/types/dashboard-sections";
import type { OptionsQuery } from "@/shared/types/options-query";
import type { AppointmentsQueryKeyParams } from "../types/appointments";
import type { QuotesQueryKeyParams } from "../types/quotes";

export const QUERY_KEYS = {
  authSession: ["auth", "session"] as const,
  login: ["login"],
  googleLogin: ["googleLogin"],
  logout: ["logout"],
  registerEstablishment: ["registerEstablishment"],
  requestPasswordReset: ["requestPasswordReset"],
  confirmPasswordReset: ["confirmPasswordReset"],
  updateUserPassword: ["updateUserPassword"],
  requestPasswordChangeCode: ["requestPasswordChangeCode"],
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
  quotes: (params?: QuotesQueryKeyParams) => {
    const root = ["quotes"] as const;

    if (!params) {
      return root;
    }

    const { quoteId, filters } = params;

    if (quoteId && filters) {
      return [...root, "detail", quoteId, "filters", filters] as const;
    }

    if (quoteId) {
      return [...root, "detail", quoteId] as const;
    }

    if (filters) {
      return [...root, "list", filters] as const;
    }

    return root;
  },
  services: (filters?: { page?: number; size?: number; name?: string; isActive?: boolean }) =>
    filters ? (["services", "list", filters] as const) : (["services", "list"] as const),
  customers: (filters?: ListCustomersQuery) =>
    filters ? (["customers", filters] as const) : (["customers"] as const),
  customer: (customerId?: string) =>
    customerId
      ? (["customers", "detail", customerId] as const)
      : (["customers", "detail"] as const),
  topCustomers: (filters?: DashboardTopCustomersFilters) =>
    filters
      ? (["dashboard", "top-customers", filters] as const)
      : (["dashboard", "top-customers"] as const),
  customerOptions: (filters?: OptionsQuery) =>
    filters ? (["customers", "options", filters] as const) : (["customers", "options"] as const),
  vehicles: (customerId: string, filters?: ListVehiclesQuery) =>
    filters ? (["vehicles", customerId, filters] as const) : (["vehicles", customerId] as const),
  vehiclesAll: (filters?: ListEstablishmentVehiclesQuery) =>
    filters ? (["vehicles", filters] as const) : (["vehicles"] as const),
  vehicleOptions: (filters?: VehicleOptionsQuery) =>
    filters ? (["vehicles", "options", filters] as const) : (["vehicles", "options"] as const),
  serviceOptions: (filters?: OptionsQuery) =>
    filters ? (["services", "options", filters] as const) : (["services", "options"] as const),
  serviceCategories: (filters?: ListServiceCategoriesQuery) =>
    filters ? (["service-categories", filters] as const) : (["service-categories"] as const),
  serviceCategoryOptions: (filters?: OptionsQuery) =>
    filters
      ? (["service-categories", "options", filters] as const)
      : (["service-categories", "options"] as const),
  userMe: () => ["user", "me"] as const,
  establishment: (id?: string) => ["establishment", id] as const,
};
