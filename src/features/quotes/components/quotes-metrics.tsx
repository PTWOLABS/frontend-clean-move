import { KpiCardsGrid } from "@/shared/components/kpi-card";
import { quotesPageKpisMock } from "../mocks";

export function QuotesMetrics() {
  return (
    <>
      <KpiCardsGrid items={quotesPageKpisMock}></KpiCardsGrid>
    </>
  );
}
