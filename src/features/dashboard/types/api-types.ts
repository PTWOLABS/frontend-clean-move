import { TopCustomer } from "./dashboard-sections";

type MetricPoint = {
  date: string;
  label: string;
  value: number;
};

type MoneyMetricPoint = {
  date: string;
  label: string;
  valueInCents: number;
};

export type DashboardMetricsOverview = {
  appointments: {
    value: number;
    variationPercentage: number | null;
    points: MetricPoint[];
  };
  averageTicket: {
    valueInCents: number;
    variationPercentage: number | null;
    points: MoneyMetricPoint[];
  };
  cancellationRate: {
    value: number;
    variationPercentage: number | null;
    points: MetricPoint[];
  };
  totalRevenue: {
    valueInCents: number;
    variationPercentage: number | null;
    points: MoneyMetricPoint[];
  };
};

export type DashboardMetricsAppointment = {
  total: number;
  byStatus: {
    scheduled: number;
    done: number;
    cancelled: number;
  };
  rates: {
    completion: number;
    cancellation: number;
  };
};

export type DashboardPopularServices = {
  popularServices: {
    id: string;
    name: string;
    completedCount: number;
    percent: number;
  }[];
  totalServices: number;
};

export type DashboardMetricsRevenueAndAppointments = {
  points: {
    date: string;
    label: string;
    revenueInCents: number;
    appointments: number;
  }[];
  summary: {
    revenueInCents: number;
    appointments: number;
    revenueTrendPercent: number | null;
    appointmentsTrendPercent: number | null;
  };
};

export type TopCustomers = {
  customers: TopCustomer[];
  totalCustomers: number;
};
