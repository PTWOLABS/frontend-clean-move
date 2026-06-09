"use client";

import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CountBadgeTrigger } from "@/shared/components/count-badge-trigger";
import { HintTooltip } from "@/shared/components/hint-tooltip";
import type { AppointmentDisplayStatus } from "@/shared/utils/appointments-status";
import { appointmentStatusMeta } from "@/shared/utils/appointments-status";
import { cn } from "@/shared/utils/cn";

export type AppointmentMobileCardItem = {
  id: string;
  dateLabel: string;
  timeLabel: string;
  customerName: string;
  vehicleLabel: string;
  vehiclePlate: string;
  serviceName: string;
  amountLabel: string;
  status: AppointmentDisplayStatus;
  servicesCount?: number;
  servicesTooltipLabel?: ReactNode;
};

type AppointmentMobileCardsListProps = {
  appointments: AppointmentMobileCardItem[];
  className?: string;
  onAppointmentClick?: (appointment: AppointmentMobileCardItem) => void;
  onAppointmentServicesClick?: (appointment: AppointmentMobileCardItem) => void;
};

type AppointmentMobileCardsSkeletonProps = {
  ariaLabel?: string;
};

const appointmentMobileSkeletonCards = ["first", "second", "third", "fourth", "fifth"];

export function AppointmentMobileCardsSkeleton({
  ariaLabel = "Carregando agendamentos",
}: AppointmentMobileCardsSkeletonProps) {
  return (
    <div role="status" aria-label={ariaLabel} className="space-y-3 px-3 pb-4 pt-1 min-[401px]:px-4">
      {appointmentMobileSkeletonCards.map((card) => (
        <div
          key={`appointment-mobile-card-${card}`}
          className="overflow-hidden rounded-xl border border-border/70 bg-background/45 shadow-xs min-[401px]:grid min-[401px]:grid-cols-[4.25rem_minmax(0,1fr)]"
        >
          <div className="flex flex-col justify-center px-3 pb-0 pt-3 min-[401px]:border-r min-[401px]:border-border/70 min-[401px]:px-3 min-[401px]:py-4">
            <Skeleton className="h-3 w-10 min-[401px]:mx-auto min-[401px]:h-4" />
            <Skeleton className="mt-1 h-4 w-12 min-[401px]:mx-auto min-[401px]:mt-2 min-[401px]:h-3 min-[401px]:w-10" />
          </div>

          <div className="min-w-0 px-3 pb-3 pt-2 min-[401px]:px-4 min-[401px]:py-3">
            <div className="grid gap-2 min-[401px]:grid-cols-[minmax(0,1fr)_auto] min-[401px]:items-start">
              <div className="min-w-0 flex-1">
                <Skeleton className="h-4 w-28" />
                <div className="mt-2 flex items-center gap-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-5 w-14 rounded-sm" />
                </div>
              </div>
              <Skeleton className="hidden h-6 w-20 rounded-full min-[401px]:block" />
            </div>

            <div className="mt-3 flex items-center gap-2 min-[401px]:items-end min-[401px]:justify-between min-[401px]:gap-3">
              <Skeleton className="h-6 w-20 rounded-full min-[401px]:hidden" />
              <Skeleton className="h-4 min-w-0 flex-1" />
              <Skeleton className="hidden h-3 w-14 min-[401px]:block" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AppointmentMobileCardsList({
  appointments,
  className,
  onAppointmentClick,
  onAppointmentServicesClick,
}: AppointmentMobileCardsListProps) {
  return (
    <ul className={cn("space-y-3 px-3 pb-4 pt-1 min-[401px]:px-4", className)}>
      {appointments.map((appointment) => {
        const status = appointmentStatusMeta[appointment.status];
        const canOpenAppointment = Boolean(onAppointmentClick);
        const servicesCount = appointment.servicesCount ?? 0;
        const canOpenServices = servicesCount > 1 && Boolean(onAppointmentServicesClick);

        return (
          <li
            key={appointment.id}
            className="relative min-w-0 overflow-hidden rounded-xl border border-border/70 bg-background/45 shadow-xs transition-colors hover:border-accent/40 hover:bg-accent-soft/20 min-[401px]:grid min-[401px]:grid-cols-[4.25rem_minmax(0,1fr)]"
          >
            {canOpenAppointment ? (
              <button
                type="button"
                className="absolute inset-0 z-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                aria-label={`Ver detalhes do agendamento de ${appointment.customerName}`}
                onClick={() => onAppointmentClick?.(appointment)}
              />
            ) : null}

            <div className="pointer-events-none relative z-10 flex flex-col justify-center px-3 pb-0 pt-3 text-left min-[401px]:border-r min-[401px]:border-border/70 min-[401px]:px-3 min-[401px]:py-4 min-[401px]:text-center">
              <span className="order-1 text-[0.6875rem] font-medium tabular-nums text-muted-foreground/80 min-[401px]:order-2 min-[401px]:mt-1">
                {appointment.dateLabel}
              </span>
              <span className="order-2 mt-0.5 text-sm font-semibold tabular-nums text-muted-foreground min-[401px]:order-1 min-[401px]:mt-0">
                {appointment.timeLabel}
              </span>
            </div>

            <div className="pointer-events-none relative z-10 min-w-0 px-3 pb-3 pt-2 min-[401px]:px-4 min-[401px]:py-3">
              <div className="grid min-w-0 gap-2 min-[401px]:grid-cols-[minmax(0,1fr)_auto] min-[401px]:items-start">
                <div className="min-w-0 overflow-hidden">
                  <HintTooltip
                    label={appointment.customerName}
                    className="max-w-72 break-words leading-5"
                  >
                    <span className="block max-w-full truncate text-sm font-semibold text-foreground">
                      {appointment.customerName}
                    </span>
                  </HintTooltip>

                  <div className="mt-1 flex min-w-0 items-center gap-2">
                    <div className="min-w-0 max-w-full overflow-hidden">
                      <HintTooltip
                        label={appointment.vehicleLabel}
                        className="max-w-72 break-words leading-5"
                      >
                        <span className="block max-w-full truncate text-xs text-muted-foreground">
                          {appointment.vehicleLabel}
                        </span>
                      </HintTooltip>
                    </div>
                    <Badge
                      variant="outline"
                      className="max-w-20 shrink-0 truncate rounded-sm border-border/70 bg-muted/45 px-1.5 py-0.5 text-[0.625rem] font-semibold tabular-nums text-muted-foreground"
                    >
                      {appointment.vehiclePlate}
                    </Badge>
                  </div>
                </div>

                <Badge
                  className={cn(
                    "hidden w-fit max-w-full shrink-0 truncate rounded-full px-2 py-1 text-[0.6875rem] font-semibold hover:cursor-default min-[401px]:inline-flex min-[401px]:justify-self-end",
                    status.className,
                  )}
                >
                  {status.label}
                </Badge>
              </div>

              <div className="mt-3 flex min-w-0 items-center gap-2 min-[401px]:items-end min-[401px]:justify-between min-[401px]:gap-3">
                <Badge
                  className={cn(
                    "w-fit max-w-[7rem] shrink-0 truncate rounded-full px-2 py-1 text-[0.6875rem] font-semibold hover:cursor-default min-[401px]:hidden",
                    status.className,
                  )}
                >
                  {status.label}
                </Badge>

                <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden min-[401px]:flex-none">
                  <div className="min-w-0 overflow-hidden">
                    <HintTooltip
                      label={appointment.serviceName}
                      className="max-w-72 break-words leading-5"
                    >
                      <span className="block max-w-full truncate text-sm font-medium text-foreground">
                        {appointment.serviceName}
                      </span>
                    </HintTooltip>
                  </div>

                  {canOpenServices ? (
                    <CountBadgeTrigger
                      count={servicesCount}
                      ariaLabel={`Ver ${servicesCount} serviços do agendamento`}
                      onClick={() => onAppointmentServicesClick?.(appointment)}
                      align="end"
                      className="pointer-events-auto shrink-0"
                      tooltipLabel={
                        appointment.servicesTooltipLabel ??
                        `${servicesCount} serviços do agendamento`
                      }
                    />
                  ) : null}
                </div>
                <span className="hidden shrink-0 text-xs font-semibold tabular-nums text-muted-foreground min-[401px]:block">
                  {appointment.amountLabel}
                </span>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
