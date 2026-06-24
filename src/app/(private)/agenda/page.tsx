import type { Metadata } from "next";

import { AgendaNewAppointmentButton } from "@/features/agenda/components/agenda-new-appointment-button";
import { AgendaSummaryQueryCard } from "@/features/agenda/components/agenda-summary-query-card";
import { PendingQuotesCard } from "@/features/agenda/components/pending-quotes-card";
import { TodayAgendaQueryCard } from "@/features/agenda/components/today-agenda-query-card";

import styles from "./page.module.css";

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

      <div className={styles.agendaLayoutContainer}>
        <div className={styles.agendaLayoutGrid} data-testid="agenda-layout-grid">
          <div className={styles.agendaPrimaryColumn} data-testid="agenda-primary-column">
            <TodayAgendaQueryCard />
          </div>
          <div className={styles.agendaSecondaryColumn} data-testid="agenda-secondary-column">
            <div className={styles.agendaSummarySection}>
              <AgendaSummaryQueryCard />
            </div>
            <div className={styles.agendaPendingQuotesSection}>
              <PendingQuotesCard quotes={[]} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
