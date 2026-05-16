export type DashboardMetrics = {
  totalRevenueInCents: number;
  averageTicketInCents: number;
  appointmentsCount: number;
  cancellationRate: number;
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
