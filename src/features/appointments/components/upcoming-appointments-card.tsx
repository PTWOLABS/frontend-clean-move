import { addDays, format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarClock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/shared/utils/cn";

import type { AppointmentTone } from "../types/appointment-calendar";
import { HintTooltip } from "@/shared/components/hint-tooltip";

export type NextAppointment = {
  id: string;
  startsAt: Date;
  serviceName: string;
  vehiclePlate: string;
  tone: AppointmentTone;
  customerName?: string;
};

type UpcomingAppointmentsCardProps = {
  appointments?: NextAppointment[];
  isLoading?: boolean;
};

type NextAppointmentItemProps = {
  appointment: NextAppointment;
};

const appointmentToneClassName: Record<AppointmentTone, string> = {
  primary: "bg-primary ring-primary/20",
  accent: "bg-accent ring-accent/20",
  success: "bg-success ring-success/20",
  warning: "bg-warning ring-warning/20",
  danger: "bg-danger ring-danger/20",
  info: "bg-info ring-info/20",
};

const upcomingAppointmentSkeletonRows = ["first", "second", "third"];

function formatAppointmentDay(date: Date) {
  const today = new Date();
  const tomorrow = addDays(today, 1);

  if (isSameDay(date, today)) {
    return "Hoje";
  }

  if (isSameDay(date, tomorrow)) {
    return "Amanhã";
  }

  return format(date, "dd/MM", { locale: ptBR });
}

export function NextAppointmentItem({ appointment }: NextAppointmentItemProps) {
  return (
    <li className="grid min-h-14 grid-cols-[4rem_minmax(0,1fr)]">
      <div className="flex flex-col justify-center rounded-l-xl border border-border/60 bg-background/45 px-3 py-2">
        <span className="text-[11px] font-medium leading-none text-muted-foreground">
          {formatAppointmentDay(appointment.startsAt)}
        </span>
        <span className="mt-1.5 text-sm font-semibold tabular-nums text-foreground">
          {format(appointment.startsAt, "HH:mm", { locale: ptBR })}
        </span>
      </div>

      <div className="-ml-px flex min-w-0 items-center justify-between gap-3 rounded-r-xl border border-border/60 bg-background/45 px-3 py-2 shadow-xs transition-colors hover:border-accent/40 hover:bg-accent-soft/25">
        <div className="flex min-w-0 items-start gap-2.5">
          <span
            aria-hidden="true"
            className={cn(
              "mt-1.5 size-2.5 shrink-0 rounded-full ring-2 ring-background/80",
              appointmentToneClassName[appointment.tone],
            )}
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-card-foreground">
              {appointment.serviceName}
            </p>
            {appointment.customerName ? (
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {appointment.customerName}
              </p>
            ) : null}
          </div>
        </div>

        <Badge
          variant="outline"
          className="max-w-24 shrink-0 truncate rounded-full border-border/70 bg-muted/45 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground"
        >
          {appointment.vehiclePlate}
        </Badge>
      </div>
    </li>
  );
}

function NextAppointmentSkeletonItem() {
  return (
    <div className="grid min-h-14 grid-cols-[4rem_minmax(0,1fr)]">
      <div className="flex flex-col justify-center rounded-l-xl border border-border/60 bg-background/45 px-3 py-2">
        <Skeleton className="h-3 w-8" />
        <Skeleton className="mt-2 h-4 w-10" />
      </div>

      <div className="-ml-px flex min-w-0 items-center justify-between gap-3 rounded-r-xl border border-border/60 bg-background/45 px-3 py-2 shadow-xs">
        <div className="flex min-w-0 flex-1 items-start gap-2.5">
          <Skeleton className="mt-1.5 size-2.5 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1">
            <Skeleton className="h-4 w-4/5 max-w-36" />
            <Skeleton className="mt-2 h-3 w-3/5 max-w-28" />
          </div>
        </div>

        <Skeleton className="h-5 w-14 shrink-0 rounded-full" />
      </div>
    </div>
  );
}

function UpcomingAppointmentsLoadingState() {
  return (
    <div role="status" aria-label="Carregando próximos agendamentos" className="space-y-2">
      {upcomingAppointmentSkeletonRows.map((row) => (
        <NextAppointmentSkeletonItem key={row} />
      ))}
    </div>
  );
}

export function UpcomingAppointmentsCard({
  appointments = [],
  isLoading = false,
}: UpcomingAppointmentsCardProps) {
  const visibleAppointments = appointments.slice(0, 5);

  return (
    <Card
      aria-busy={isLoading}
      className="hidden min-h-0 flex-col overflow-hidden rounded-2xl border-border/70 bg-card shadow-xs sm:rounded-3xl xl:flex xl:shrink-0"
    >
      <CardHeader className="shrink-0 border-b border-border/60 px-6 pb-4 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <CalendarClock className="size-4" aria-hidden />
              </span>
              Próximos agendamentos
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">Até 5 horários na sequência</p>
          </div>

          <Badge
            variant="outline"
            className="rounded-full border-border/70 bg-muted/45 px-2.5 py-1 text-[11px] text-muted-foreground"
          >
            {isLoading ? <Skeleton className="h-3 w-4 rounded-full" /> : visibleAppointments.length}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="scrollbar-clean min-h-0 flex-1 overflow-y-auto px-6 pb-6 pr-4 pt-4">
        {isLoading ? (
          <UpcomingAppointmentsLoadingState />
        ) : visibleAppointments.length ? (
          <ol className="space-y-2">
            {visibleAppointments.map((appointment) => (
              <HintTooltip
                className="max-w-78 shrink-0"
                key={appointment.id}
                label={`${appointment.serviceName} - ${appointment.customerName}`}
              >
                <NextAppointmentItem key={appointment.id} appointment={appointment} />
              </HintTooltip>
            ))}
          </ol>
        ) : (
          <div className="rounded-2xl border border-dashed border-border/70 bg-background/45 p-5">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted/55 text-muted-foreground">
                <CalendarClock className="size-4" aria-hidden />
              </span>
              <div>
                <p className="font-medium text-card-foreground">Nenhum próximo agendamento.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Os próximos horários aparecerão aqui quando houver.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
