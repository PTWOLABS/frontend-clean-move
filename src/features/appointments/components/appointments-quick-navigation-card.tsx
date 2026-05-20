"use client";

import type FullCalendar from "@fullcalendar/react";
import { isSameMonth, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Sparkles } from "lucide-react";
import { useState, type RefObject } from "react";

import { Calendar as MiniCalendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { formatDayKey, navigationCalendarClassNames } from "../lib/appointments-page.helpers";
import type { AppointmentCalendarEvent } from "../types/appointment-calendar";

type AppointmentsQuickNavigationCardProps = {
  calendarRef: RefObject<FullCalendar | null>;
  events: AppointmentCalendarEvent[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
};

export function AppointmentsQuickNavigationCard({
  calendarRef,
  events,
  selectedDate,
  onSelectDate,
}: AppointmentsQuickNavigationCardProps) {
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(selectedDate));

  const busyDaysInVisibleMonth = new Set(
    events
      .filter((event) => isSameMonth(event.start, visibleMonth))
      .map((event) => formatDayKey(event.start)),
  ).size;

  function handleSelect(date: Date | undefined) {
    if (!date) {
      return;
    }

    onSelectDate(date);
    calendarRef.current?.getApi()?.gotoDate(date);
  }

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
            month={visibleMonth}
            onMonthChange={setVisibleMonth}
            selected={selectedDate}
            onSelect={handleSelect}
            className="w-full bg-transparent p-4"
            classNames={navigationCalendarClassNames}
          />
        </div>

        <div className="rounded-2xl border border-border/70 bg-background/50 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-card-foreground">
            <Sparkles className="size-4 text-accent" />
            {busyDaysInVisibleMonth} dias ocupados neste mês
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Dias com pelo menos um agendamento dentro do mês atualmente exibido.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
