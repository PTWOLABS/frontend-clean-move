import { addDays, format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarClock } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/shared/utils/cn";

import type { AppointmentTone } from "../types/appointment-calendar";

export type NextAppointment = {
  id: string;
  startsAt: Date;
  serviceName: string;
  customerName: string;
  vehiclePlate: string;
  tone: AppointmentTone;
};

type UpcomingAppointmentsCardProps = {
  appointments?: NextAppointment[];
};

type NextAppointmentItemProps = {
  appointment: NextAppointment;
};

const nextAppointments: NextAppointment[] = [];

const appointmentToneClassName: Record<AppointmentTone, string> = {
  primary: "bg-primary ring-primary/20",
  accent: "bg-accent ring-accent/20",
  success: "bg-success ring-success/20",
  warning: "bg-warning ring-warning/20",
  danger: "bg-danger ring-danger/20",
  info: "bg-info ring-info/20",
};

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
    <li className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-0 overflow-hidden rounded-2xl border border-border/70 bg-background/45 shadow-xs">
      <div className="flex flex-col justify-center border-r border-border/70 bg-muted/35 px-4 py-3">
        <span className="text-xs font-medium text-muted-foreground">
          {formatAppointmentDay(appointment.startsAt)}
        </span>
        <span className="mt-1 text-lg font-semibold tabular-nums text-foreground">
          {format(appointment.startsAt, "HH:mm", { locale: ptBR })}
        </span>
      </div>

      <div className="flex min-w-0 items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-start gap-3">
          <span
            aria-hidden="true"
            className={cn(
              "mt-1.5 size-3 shrink-0 rounded-full ring-4",
              appointmentToneClassName[appointment.tone],
            )}
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-card-foreground">
              {appointment.serviceName}
            </p>
            <p className="mt-1 truncate text-sm text-muted-foreground">
              {appointment.customerName}
            </p>
          </div>
        </div>

        <span className="shrink-0 rounded-full border border-border/70 bg-muted/45 px-2.5 py-1 text-xs font-semibold tabular-nums text-muted-foreground">
          {appointment.vehiclePlate}
        </span>
      </div>
    </li>
  );
}

export function UpcomingAppointmentsCard({
  appointments = nextAppointments,
}: UpcomingAppointmentsCardProps) {
  const visibleAppointments = appointments.slice(0, 5);

  return (
    <Card className="hidden min-h-0 flex-col overflow-hidden rounded-2xl border-border/80 bg-card/80 shadow-card backdrop-blur-sm sm:rounded-3xl xl:flex xl:max-h-[20.5rem] xl:shrink-0">
      <CardHeader className="shrink-0 pb-4">
        <CardTitle className="text-base">Próximos agendamentos</CardTitle>
      </CardHeader>

      <CardContent className="scrollbar-clean min-h-0 flex-1 overflow-y-auto px-6 pb-6 pr-4 pt-0">
        {visibleAppointments.length ? (
          <ol className="space-y-3">
            {visibleAppointments.map((appointment) => (
              <NextAppointmentItem key={appointment.id} appointment={appointment} />
            ))}
          </ol>
        ) : (
          <div className="rounded-2xl border border-dashed border-border/70 bg-background/45 p-5">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted/55 text-muted-foreground">
                <CalendarClock className="size-4" aria-hidden />
              </span>
              <div>
                <p className="font-medium text-card-foreground">Nenhum próximo agendamento.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Os próximos horários aparecerão aqui quando a integração estiver disponível.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
