"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CarFront, Clock3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/shared/utils/cn";

import { useAppointmentsPage } from "../contexts/appointments-page-context";
import { formatAppointmentTimeRange, statusBadgeClassName } from "../lib/appointments-page.helpers";
import { getStatusLabel } from "../lib/appointments-calendar";

export function AppointmentsDayAgendaCard() {
  const { selectedDate, selectedEventId, selectedDayAppointments, handleAgendaItemClick } =
    useAppointmentsPage();

  return (
    <Card className="rounded-3xl border-border/80 bg-card/80 shadow-card backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Agenda do dia</CardTitle>
        <p className="text-sm text-muted-foreground">
          {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {selectedDayAppointments.length ? (
          selectedDayAppointments.map((event) => {
            const isActive = selectedEventId === event.id;

            return (
              <button
                key={event.id}
                type="button"
                onClick={() => handleAgendaItemClick(event)}
                className={cn(
                  "w-full rounded-2xl border border-border/70 bg-background/55 p-4 text-left transition-colors hover:border-accent/40 hover:bg-accent-soft/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive && "border-accent/50 bg-accent-soft/45",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-card-foreground">{event.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {event.extendedProps.customer}
                    </p>
                  </div>

                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px]",
                      statusBadgeClassName[event.extendedProps.status],
                    )}
                  >
                    {getStatusLabel(event.extendedProps.status)}
                  </Badge>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="size-3.5" />
                    {formatAppointmentTimeRange(event)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CarFront className="size-3.5" />
                    {event.extendedProps.vehicle}
                  </span>
                </div>
              </button>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-border/70 bg-background/45 p-5">
            <p className="font-medium text-card-foreground">Nenhum agendamento neste dia.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Use o botão &quot;Novo agendamento&quot; para inserir um mock local no horário
              selecionado.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
