"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CarFront, Clock3, RotateCcw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/shared/utils/cn";

import { getAppointmentsForDate, getStatusLabel } from "../lib/appointments-calendar";
import { formatAppointmentTimeRange, statusBadgeClassName } from "../lib/appointments-page.helpers";
import type { AppointmentCalendarEvent } from "../types/appointment-calendar";

type AppointmentsDayAgendaCardProps = {
  selectedDate: Date;
  selectedEventId: string | null;
  events: AppointmentCalendarEvent[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onSelectEvent: (event: AppointmentCalendarEvent) => void;
};

export function AppointmentsDayAgendaCard({
  selectedDate,
  selectedEventId,
  events,
  isLoading,
  isError,
  onRetry,
  onSelectEvent,
}: AppointmentsDayAgendaCardProps) {
  const selectedDayAppointments = getAppointmentsForDate(events, selectedDate);

  return (
    <Card className="flex max-h-96 min-h-0 flex-col overflow-hidden rounded-2xl border-border/80 bg-card/80 shadow-card backdrop-blur-sm sm:rounded-3xl">
      <CardHeader className="shrink-0 pb-4">
        <CardTitle className="text-base">Agenda do dia</CardTitle>
        <p className="text-sm text-muted-foreground">
          {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
        </p>
      </CardHeader>
      <CardContent className="scrollbar-clean min-h-0 flex-1 space-y-3 overflow-y-auto px-6 pb-6 pr-4 pt-0">
        {isLoading ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-background/45 p-5">
            <p className="font-medium text-card-foreground">Carregando agenda do dia.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Os agendamentos deste período ainda estão sendo sincronizados.
            </p>
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-dashed border-danger-soft bg-background/45 p-5">
            <p className="font-medium text-card-foreground">Não foi possível carregar a agenda.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Atualize os dados para tentar novamente.
            </p>
            <Button className="mt-4 h-10 rounded-xl px-4" variant="outline" onClick={onRetry}>
              <RotateCcw className="size-4" />
              Tentar novamente
            </Button>
          </div>
        ) : selectedDayAppointments.length ? (
          selectedDayAppointments.map((event) => {
            const isActive = selectedEventId === event.id;

            return (
              <button
                key={event.id}
                type="button"
                onClick={() => onSelectEvent(event)}
                className={cn(
                  "w-full rounded-2xl border border-border/70 bg-background/55 p-4 text-left transition-colors hover:border-accent/40 hover:bg-accent-soft/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive && "border-accent/50 bg-accent-soft/45",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-card-foreground">{event.title}</p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {event.extendedProps.customer}
                    </p>
                  </div>

                  <Badge
                    variant="outline"
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 text-[11px]",
                      statusBadgeClassName[event.extendedProps.status],
                    )}
                  >
                    {getStatusLabel(event.extendedProps.status)}
                  </Badge>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex min-w-0 items-center gap-1.5">
                    <Clock3 className="size-3.5 shrink-0" />
                    {formatAppointmentTimeRange(event)}
                  </span>
                  <span className="inline-flex min-w-0 max-w-full items-center gap-1.5">
                    <CarFront className="size-3.5 shrink-0" />
                    <span className="truncate">{event.extendedProps.vehicle}</span>
                  </span>
                </div>
              </button>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-border/70 bg-background/45 p-5">
            <p className="font-medium text-card-foreground">Nenhum agendamento neste dia.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
