import type {
  CancellationRateData,
  DashboardPeriodOption,
  PopularService,
  RevenueAppointmentsPoint,
  RevenueAppointmentsSummary,
} from "@/features/dashboard/types/dashboard-sections";

export const dashboardRevenueAppointmentsMock: RevenueAppointmentsPoint[] = [
  {
    date: "20/05/2024",
    label: "20/05",
    revenueInCents: 545000,
    appointments: 31,
  },
  {
    date: "21/05/2024",
    label: "21/05",
    revenueInCents: 790000,
    appointments: 45,
  },
  {
    date: "22/05/2024",
    label: "22/05",
    revenueInCents: 670000,
    appointments: 36,
  },
  {
    date: "23/05/2024",
    label: "23/05",
    revenueInCents: 985000,
    appointments: 42,
  },
  {
    date: "24/05/2024",
    label: "24/05",
    revenueInCents: 590000,
    appointments: 29,
  },
  {
    date: "25/05/2024",
    label: "25/05",
    revenueInCents: 786000,
    appointments: 39,
  },
  {
    date: "26/05/2024",
    label: "26/05",
    revenueInCents: 372900,
    appointments: 34,
  },
];

export const dashboardRevenueAppointmentsSummaryMock: RevenueAppointmentsSummary = {
  revenueInCents: 4738900,
  appointments: 256,
  revenueTrendPercent: 21,
  appointmentsTrendPercent: 18,
};

export const dashboardCancellationRateMock: CancellationRateData = {
  currentPercent: 4.2,
  targetPercent: 5.8,
  comparisonPercentPoints: -1.6,
};

export const dashboardPopularServicesMock: PopularService[] = [
  {
    id: "full-wash",
    name: "Lavagem Completa",
    completedCount: 128,
  },
  {
    id: "interior-cleaning",
    name: "Higienização Interna",
    completedCount: 86,
  },
  {
    id: "polishing",
    name: "Polimento",
    completedCount: 46,
  },
  {
    id: "crystallization",
    name: "Cristalização",
    completedCount: 28,
  },
  {
    id: "waxing",
    name: "Enceramento",
    completedCount: 16,
  },
  {
    id: "paint-protection",
    name: "Vitrificação",
    completedCount: 11,
  },
];

export const dashboardPeriodOptionsMock: DashboardPeriodOption[] = [
  {
    value: "this-month",
    label: "Este mês",
  },
  {
    value: "last-7-days",
    label: "Últimos 7 dias",
  },
  {
    value: "last-30-days",
    label: "Últimos 30 dias",
  },
];
