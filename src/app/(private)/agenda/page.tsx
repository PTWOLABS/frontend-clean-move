import type { Metadata } from "next";

import { AgendaNewAppointmentButton } from "@/features/agenda/components/agenda-new-appointment-button";
import { AgendaSummaryQueryCard } from "@/features/agenda/components/agenda-summary-query-card";
import { PendingQuotesCard } from "@/features/agenda/components/pending-quotes-card";
import { TodayAgendaQueryCard } from "@/features/agenda/components/today-agenda-query-card";

export const metadata: Metadata = {
  title: "Agenda",
  description: "Acompanhe os agendamentos, horários e serviços do dia no CleanMove.",
};

export default function AgendaPage() {
  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Agenda</h1>
          <p className="text-sm text-muted-foreground">
            Visão operacional dos horários, serviços e pendências do dia.
          </p>
        </div>

        <AgendaNewAppointmentButton />
      </header>

      <div className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(20rem,1fr)]">
        <TodayAgendaQueryCard />
        <div className="flex min-w-0 flex-col gap-4 xl:h-full xl:min-h-0">
          <div className="shrink-0">
            <AgendaSummaryQueryCard />
          </div>
          <div className="xl:min-h-0 xl:flex-1">
            <PendingQuotesCard quotes={[]} />
          </div>
        </div>
      </div>
    </section>
  );
}
