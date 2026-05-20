"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarClock, CalendarDays, CarFront, RotateCcw, UserRound, Wrench } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/shared/utils/cn";

import { getStatusLabel } from "../lib/appointments-calendar";
import {
  formatAppointmentTimeRange,
  getInitials,
  statusBadgeClassName,
} from "../lib/appointments-page.helpers";
import type { AppointmentCalendarEvent } from "../types/appointment-calendar";

type AppointmentDetailsCardProps = {
  events: AppointmentCalendarEvent[];
  selectedEventId: string | null;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
};

export function AppointmentDetailsCard({
  events,
  selectedEventId,
  isLoading,
  isError,
  onRetry,
}: AppointmentDetailsCardProps) {
  const selectedEvent =
    (selectedEventId ? events.find((event) => event.id === selectedEventId) : null) ?? null;

  return (
    <Card className="rounded-3xl border-border/80 bg-card/80 shadow-card backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Detalhes do agendamento</CardTitle>
        <p className="text-sm text-muted-foreground">
          Painel alimentado por `eventClick` e pela lista lateral.
        </p>
      </CardHeader>
      <CardContent>
        {selectedEvent ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border/70 bg-background/55 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display text-xl font-semibold text-card-foreground">
                    {selectedEvent.title}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedEvent.extendedProps.service}
                  </p>
                </div>

                <Badge
                  variant="outline"
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px]",
                    statusBadgeClassName[selectedEvent.extendedProps.status],
                  )}
                >
                  {getStatusLabel(selectedEvent.extendedProps.status)}
                </Badge>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-border/70 bg-background/45 p-4">
              <div className="flex items-start gap-3">
                <CalendarClock className="mt-0.5 size-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-card-foreground">
                    {format(selectedEvent.start, "EEEE, d 'de' MMMM", { locale: ptBR })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatAppointmentTimeRange(selectedEvent)} •{" "}
                    {selectedEvent.extendedProps.reminder}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <UserRound className="mt-0.5 size-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-card-foreground">
                    {selectedEvent.extendedProps.customer}
                  </p>
                  <p className="text-xs text-muted-foreground">Cliente do atendimento</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CarFront className="mt-0.5 size-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-card-foreground">
                    {selectedEvent.extendedProps.vehicle}
                  </p>
                  <p className="text-xs text-muted-foreground">Veículo vinculado</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Wrench className="mt-0.5 size-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-card-foreground">
                    {selectedEvent.extendedProps.notes}
                  </p>
                  <p className="text-xs text-muted-foreground">Observações operacionais</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-background/45 p-4">
              <p className="text-sm font-medium text-card-foreground">Equipe alocada</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedEvent.extendedProps.attendants.map((attendant) => (
                  <div
                    key={attendant}
                    className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-2.5 py-1.5"
                  >
                    <span className="inline-flex size-7 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                      {getInitials(attendant)}
                    </span>
                    <span className="text-sm text-card-foreground">{attendant}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : isLoading ? (
          <div className="space-y-3 rounded-2xl border border-dashed border-border/70 bg-background/45 p-5">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 text-accent" />
              <p className="font-medium text-card-foreground">Carregando detalhes</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Os dados do agendamento selecionado estão sendo carregados.
            </p>
          </div>
        ) : isError ? (
          <div className="space-y-3 rounded-2xl border border-dashed border-danger-soft bg-background/45 p-5">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 text-danger" />
              <p className="font-medium text-card-foreground">Não foi possível carregar</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Tente atualizar os agendamentos para exibir os detalhes novamente.
            </p>
            <Button className="h-10 rounded-xl px-4" variant="outline" onClick={onRetry}>
              <RotateCcw className="size-4" />
              Tentar novamente
            </Button>
          </div>
        ) : (
          <div className="space-y-3 rounded-2xl border border-dashed border-border/70 bg-background/45 p-5">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 text-accent" />
              <p className="font-medium text-card-foreground">Nenhum evento selecionado</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Clique em um evento no calendário ou na lista lateral para carregar os detalhes.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
