import { AppointmentCategories, AppointmentStatus } from "@/shared/types/appointments";
import { PaginationParams } from "@/shared/types/pagination";

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

export type DashboardPeriod = "this-month" | "last-7-days" | "last-30-days";
export type DashboardGranularity = "auto" | "daily" | "weekly" | "monthly";

export type DashboardMetricsFiltersBase = {
  startsAt?: Date;
  endsAt?: Date;
  categories?: AppointmentCategories[];
  status?: AppointmentStatus;
  period?: DashboardPeriod;
  granularity?: DashboardGranularity;
};

export type DashboardMetricsOverviewFilters = DashboardMetricsFiltersBase & PaginationParams;

export type DashboardMetricsAppointmentsFilters = DashboardMetricsFiltersBase;

export type DashboardPopularServicesFilters = DashboardMetricsFiltersBase & PaginationParams;
