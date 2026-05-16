import {
  dashboardCancellationRateMock,
  dashboardPeriodOptionsMock,
} from "@/features/dashboard/mocks/dashboard-sections.mock";

import { CancellationRateCard } from "./cancellation-rate-card";
import { MetricsCardList } from "./metric-cards-list";
import { PopularServicesCard } from "./popular-services-card";
import { RevenueAppointmentsChartCard } from "./revenue-appointments-chart-card";

export function MetricsSections() {
  return (
    <>
      <MetricsCardList />

      <RevenueAppointmentsChartCard className="md:col-span-2 lg:col-span-2" periodLabel="Diário" />

      <CancellationRateCard
        className="md:col-span-1 lg:col-span-1"
        data={dashboardCancellationRateMock}
      />

      <PopularServicesCard
        className="md:col-span-1 lg:col-span-1"
        defaultPeriod="this-month"
        periodOptions={dashboardPeriodOptionsMock}
      />
    </>
  );
}
