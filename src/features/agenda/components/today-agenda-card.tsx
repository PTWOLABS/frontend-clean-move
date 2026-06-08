import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, Clock3, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CountBadgeTrigger } from "@/shared/components/count-badge-trigger";
import type { AppointmentStatus } from "@/shared/types/appointments";
import { cn } from "@/shared/utils/cn";
import { TodayAgendaLoadingState } from "./today-agenda-loading-state";

type TodayAgendaStatus = AppointmentStatus | "in-progress";

export type TodayAgendaItem = {
  id: string;
  customerId: string;
  vehicleId: string;
  startsAt: Date;
  endsAt: Date | null;
  time: string;
  timeRange: string;
  customerName: string;
  vehicleName: string;
  vehicleLabel: string;
  vehiclePlate: string;
  vehicleRawPlate: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleDisplayName: string;
  serviceName: string;
  amountInCents: number;
  discountValue: string;
  description: string;
  status: TodayAgendaStatus;
  services: TodayAgendaService[];
};

export type TodayAgendaService = {
  id: string;
  name: string;
  durationInMinutes: number | null;
  priceInCents: number;
};

type TodayAgendaCardProps = {
  appointments: TodayAgendaItem[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onAppointmentClick?: (appointment: TodayAgendaItem) => void;
  onAppointmentServicesClick?: (appointment: TodayAgendaItem) => void;
  toolbar?: ReactNode;
  pagination?: ReactNode;
};

const statusMeta: Record<
  TodayAgendaStatus,
  {
    label: string;
    className: string;
  }
> = {
  "in-progress": {
    label: "Em andamento",
    className: "border-transparent bg-info-soft text-info-soft-foreground",
  },
  SCHEDULED: {
    label: "Agendado",
    className: "border-transparent bg-info-soft text-info-soft-foreground",
  },
  DONE: {
    label: "Concluído",
    className: "border-transparent bg-success-soft text-success-soft-foreground",
  },
  CANCELLED: {
    label: "Cancelado",
    className: "border-transparent bg-danger-soft text-danger-soft-foreground",
  },
};

function formatAppointmentDate(date: Date) {
  return format(date, "dd/MM", { locale: ptBR });
}

export function TodayAgendaCard({
  appointments,
  isLoading = false,
  isError = false,
  onRetry,
  onAppointmentClick,
  onAppointmentServicesClick,
  toolbar,
  pagination,
}: TodayAgendaCardProps) {
  return (
    <Card
      aria-busy={isLoading}
      className="flex min-h-[34rem] flex-col overflow-hidden rounded-2xl border-border/80 bg-card/80 shadow-card backdrop-blur-sm"
    >
      <CardHeader className="flex flex-col gap-4 border-b border-border/70 px-4 pb-4 pt-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="min-w-0">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
              <Clock3 className="size-4" aria-hidden />
            </span>
            Agendamentos
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Consulte horários, clientes, veículos e serviços por filtros operacionais.
          </p>
        </div>

        <Button asChild variant="outline" className="h-10 w-full shrink-0 sm:w-auto">
          <Link href="/appointments">
            <CalendarDays className="size-4" aria-hidden />
            Ver calendário
          </Link>
        </Button>
      </CardHeader>

      {toolbar ? (
        <div className="border-b border-border/70 px-4 py-4 sm:px-6">{toolbar}</div>
      ) : null}

      <CardContent className="min-h-0 flex-1 overflow-y-auto p-0 scrollbar-clean">
        {isLoading ? (
          <TodayAgendaLoadingState />
        ) : isError ? (
          <div className="p-4 sm:p-6">
            <div className="rounded-2xl border border-dashed border-danger-soft bg-background/45 p-5">
              <p className="font-medium text-card-foreground">
                Não foi possível carregar os agendamentos.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Atualize os dados para tentar novamente.
              </p>
              {onRetry ? (
                <Button className="mt-4 h-10 rounded-xl px-4" variant="outline" onClick={onRetry}>
                  <RotateCcw className="size-4" aria-hidden />
                  Tentar novamente
                </Button>
              ) : null}
            </div>
          </div>
        ) : appointments.length ? (
          <ol className="divide-y divide-border/60">
            {appointments.map((appointment) => {
              const status = statusMeta[appointment.status];
              const appointmentDate = formatAppointmentDate(appointment.startsAt);
              const servicesCount = appointment.services.length;

              return (
                <li
                  key={appointment.id}
                  className="relative transition-colors hover:bg-accent-soft/20"
                >
                  <button
                    type="button"
                    className="absolute inset-0 z-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                    aria-label={`Ver detalhes do agendamento de ${appointment.customerName}`}
                    onClick={() => onAppointmentClick?.(appointment)}
                  />

                  <div className="pointer-events-none relative z-10 grid gap-3 px-4 py-4 text-left sm:grid-cols-[5rem_minmax(0,1fr)_minmax(9rem,auto)] sm:items-center sm:px-6">
                    <div className="flex items-center gap-4 sm:gap-3">
                      <time
                        dateTime={appointment.startsAt.toISOString()}
                        className="flex min-w-12 flex-col tabular-nums"
                        aria-label={`${appointmentDate} às ${appointment.time}`}
                      >
                        <span className="text-xs font-medium leading-none text-muted-foreground/75">
                          {appointmentDate}
                        </span>
                        <span className="mt-1 text-sm font-semibold leading-none text-muted-foreground sm:text-base">
                          {appointment.time}
                        </span>
                      </time>
                      <Separator className="hidden h-8 sm:block" orientation="vertical" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-card-foreground">
                        {appointment.customerName}
                      </p>
                      <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span className="min-w-0 truncate">{appointment.vehicleName}</span>
                        <Badge
                          variant="outline"
                          className="shrink-0 rounded-full border-border/70 bg-muted/45 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground"
                        >
                          {appointment.vehiclePlate}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex min-w-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                      <Badge
                        variant="outline"
                        className={cn("rounded-full px-2.5 py-1 text-[11px]", status.className)}
                      >
                        {status.label}
                      </Badge>
                      <div className="flex min-w-0 items-center gap-2">
                        <p className="min-w-0 truncate text-sm font-medium text-card-foreground/85">
                          {appointment.serviceName}
                        </p>
                        {servicesCount > 1 ? (
                          <CountBadgeTrigger
                            count={servicesCount}
                            ariaLabel={`Ver ${servicesCount} serviços do agendamento`}
                            onClick={() => onAppointmentServicesClick?.(appointment)}
                            align="end"
                            className="pointer-events-auto"
                            tooltipLabel={`${servicesCount} serviços do agendamento`}
                          />
                        ) : null}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        ) : (
          <div className="p-4 sm:p-6">
            <div className="rounded-2xl border border-dashed border-border/70 bg-background/45 p-5">
              <p className="font-medium text-card-foreground">Nenhum agendamento encontrado.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Ajuste os filtros para buscar outros agendamentos.
              </p>
            </div>
          </div>
        )}
      </CardContent>

      {pagination ? (
        <div className="mt-auto border-t border-border/70 px-4 py-4 sm:px-6">{pagination}</div>
      ) : null}
    </Card>
  );
}
