import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PendingQuotesCard } from "@/features/agenda/components/pending-quotes-card";
import { TodayAgendaQueryCard } from "@/features/agenda/components/today-agenda-query-card";
import { TodayCashCard, type TodayCashSummary } from "@/features/agenda/components/today-cash-card";

export const metadata: Metadata = {
  title: "Agenda",
  description: "Acompanhe os agendamentos, horários e serviços do dia no CleanMove.",
};

const todayCashPreview: TodayCashSummary = {
  balanceInCents: 245000,
  trendPercent: 15,
  entriesInCents: 280000,
  exitsInCents: 35000,
};

// const pendingQuotesPreview: PendingQuoteItem[] = [
//   {
//     id: "audi-q5-higienizacao",
//     title: "Audi Q5 - Higienização",
//     sentAtLabel: "Enviado há 2h",
//     amountInCents: 85000,
//   },
//   {
//     id: "hilux-polimento",
//     title: "Hilux - Polimento",
//     sentAtLabel: "Enviado ontem",
//     amountInCents: 120000,
//   },
// ];

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

        <Button asChild className="h-11 w-full sm:w-auto sm:min-w-50">
          <Link href="/appointments?new=true">
            <Plus className="size-4" aria-hidden />
            Novo agendamento
          </Link>
        </Button>
      </header>

      <div className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(20rem,1fr)]">
        <TodayAgendaQueryCard />
        <div className="grid gap-4 xl:h-full xl:min-h-0 xl:grid-rows-[minmax(0,1fr)_minmax(0,1fr)]">
          <TodayCashCard summary={todayCashPreview} />
          <PendingQuotesCard quotes={[]} />
        </div>
      </div>
    </section>
  );
}
