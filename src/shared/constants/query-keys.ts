import {
  AppointmentsFilters,
  OptionsFilters,
  VehicleOptionsFilters,
} from "@/features/appointments/types/api-filters";

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
  appointments: (filters?: AppointmentsFilters, appointmentId?: string) =>
    [
      "appointments",
      ...(filters ? [filters] : []),
      ...(appointmentId ? [appointmentId] : []),
    ] as const,
  services: (filters?: { page?: number; size?: number; name?: string; isActive?: boolean }) =>
    filters ? (["services", filters] as const) : (["services"] as const),
  customers: (filters?: { page?: number; size?: number; search?: string }) =>
    filters ? (["customers", filters] as const) : (["customers"] as const),
  vehicles: (customerId: string, filters?: { page?: number; size?: number }) =>
    filters ? (["vehicles", customerId, filters] as const) : (["vehicles", customerId] as const),
  serviceOptions: (filters?: OptionsFilters) =>
    filters ? (["services", "options", filters] as const) : (["services", "options"] as const),
  customerOptions: (filters?: OptionsFilters) =>
    ["customers", ...(filters ? [filters] : [])] as const,
  vehicleOptions: (filters?: VehicleOptionsFilters) =>
    ["vehicle", ...(filters ? [filters] : [])] as const,
};
