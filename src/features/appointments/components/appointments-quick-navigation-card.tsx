"use client";

import { ptBR } from "date-fns/locale";
import { Sparkles } from "lucide-react";

import { Calendar as MiniCalendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useAppointmentsPage } from "../contexts/appointments-page-context";
import { navigationCalendarClassNames } from "../lib/appointments-page.helpers";

export function AppointmentsQuickNavigationCard() {
  const {
    busyDaysInMiniCalendarMonth,
    miniCalendarMonth,
    selectedDate,
    handleMiniCalendarSelect,
    setMiniCalendarMonth,
  } = useAppointmentsPage();

  return (
    <Card className="hidden rounded-3xl border-border/80 bg-card/80 shadow-card backdrop-blur-sm xl:block">
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Navegação rápida</CardTitle>
        <p className="text-sm text-muted-foreground">
          Ajuste a data ativa pelo mini calendário sem trocar a estrutura principal.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-background/50">
          <MiniCalendar
            mode="single"
            locale={ptBR}
            month={miniCalendarMonth}
            onMonthChange={setMiniCalendarMonth}
            selected={selectedDate}
            onSelect={handleMiniCalendarSelect}
            className="w-full bg-transparent p-4"
            classNames={navigationCalendarClassNames}
          />
        </div>

        <div className="rounded-2xl border border-border/70 bg-background/50 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-card-foreground">
            <Sparkles className="size-4 text-accent" />
            {busyDaysInMiniCalendarMonth} dias ocupados neste mês
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Os pontos de trabalho permanecem mockados e podem ser expandidos com integração real em
            uma próxima etapa.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
