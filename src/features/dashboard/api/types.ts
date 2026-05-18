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
    value: number;
    variationPercentage: number | null;
    points: MoneyMetricPoint[];
  };
  cancellationRate: {
    value: number;
    variationPercentage: number | null;
    points: MetricPoint[];
  };
  totalRevenue: {
    value: number;
    variationPercentage: number | null;
    points: MoneyMetricPoint[];
  };
};

export type DashboardMetricsAppointment = {
  appointmentsCount: number;
  cancellationRate: {
    currentPercent: number;
    comparisonPercentPoints: number | null;
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
