import { AppointmentCategories, AppointmentStatus } from "@/shared/types/appointments";

export type RevenueAppointmentsPoint = {
  date: string;
  label: string;
  revenueInCents: number;
  appointments: number;
};

export type RevenueAppointmentsSummary = {
  revenueInCents: number;
  appointments: number;
  revenueTrendPercent: number;
  appointmentsTrendPercent: number;
};

export type CancellationRateData = {
  currentPercent: number;
  targetPercent: number;
  comparisonPercentPoints: number;
};

export type PopularService = {
  id: string;
  name: string;
  completedCount: number;
};

export type DashboardPeriodOption = {
  value: string;
  label: string;
};

export type DashboardMetricsFiltersBase = {
  startsAt?: Date;
  endsAt?: Date;
  categories?: AppointmentCategories;
  status?: AppointmentStatus;
};

export type DashboardMetricsOverviewFilters = DashboardMetricsFiltersBase;

export type DashboardMetricsAppointments = DashboardMetricsFiltersBase;
