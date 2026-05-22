import { AppointmentsFilters } from "@/features/appointments/types/api-filters";

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
};
