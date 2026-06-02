import type { Metadata } from "next";

import {
  PendingBudgetsCard,
  type PendingBudgetItem,
} from "@/features/agenda/components/pending-budgets-card";
import {
  TodayAgendaCard,
  type TodayAgendaItem,
} from "@/features/agenda/components/today-agenda-card";
import { TodayCashCard, type TodayCashSummary } from "@/features/agenda/components/today-cash-card";

export const metadata: Metadata = {
  title: "Agenda",
  description: "Acompanhe os agendamentos, horários e serviços do dia no CleanMove.",
};

const todayAgendaPreview: TodayAgendaItem[] = [
  {
    id: "marcelo-silva-0900",
    time: "09:00",
    customerName: "Marcelo Silva",
    vehicleName: "BMW 320i",
    vehiclePlate: "ABC-1D23",
    serviceName: "Polimento Técnico",
    status: "in-progress",
  },
  {
    id: "roberto-costa-1400",
    time: "14:00",
    customerName: "Roberto Costa",
    vehicleName: "Porsche Macan",
    vehiclePlate: "XYZ-9A87",
    serviceName: "Vitrificação",
    status: "scheduled",
  },
  {
    id: "ana-santos-1630",
    time: "16:30",
    customerName: "Ana Santos",
    vehicleName: "Jeep Compass",
    vehiclePlate: "QWE-5R43",
    serviceName: "Lavagem Detalhada",
    status: "scheduled",
  },
];

const todayCashPreview: TodayCashSummary = {
  balanceInCents: 245000,
  trendPercent: 15,
  entriesInCents: 280000,
  exitsInCents: 35000,
};

const pendingBudgetsPreview: PendingBudgetItem[] = [
  {
    id: "audi-q5-higienizacao",
    title: "Audi Q5 - Higienização",
    sentAtLabel: "Enviado há 2h",
    amountInCents: 85000,
  },
  {
    id: "hilux-polimento",
    title: "Hilux - Polimento",
    sentAtLabel: "Enviado ontem",
    amountInCents: 120000,
  },
];

export default function AgendaPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Agenda</h1>
        <p className="text-sm text-muted-foreground">
          Visão operacional dos horários, serviços e pendências do dia.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(20rem,1fr)]">
        <TodayAgendaCard appointments={todayAgendaPreview} />
        <div className="grid gap-4">
          <TodayCashCard summary={todayCashPreview} />
          <PendingBudgetsCard budgets={pendingBudgetsPreview} />
        </div>
      </div>
    </section>
  );
}
