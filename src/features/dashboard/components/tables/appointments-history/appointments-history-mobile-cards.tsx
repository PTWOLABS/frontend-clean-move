"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { HintTooltip } from "@/shared/components/hint-tooltip";
import {
  appointmentsHistoryStatusMeta,
  getAppointmentAmountInCents,
  getAppointmentDateTimeLabels,
  getCustomerName,
  getServiceName,
  getVehicleBrandLabel,
  getVehicleModelLabel,
  type AppointmentListItem,
} from "@/shared/utils/appointments-helpers";
import { formatBrlFromCents } from "@/shared/money/format-brl-money";
import { cn } from "@/shared/utils/cn";
import { AppointmentsHistoryMobileCardsSkeleton } from "./appointments-history-mobile-cards-skeleton";

type AppointmentsHistoryMobileCardsProps = {
  appointments?: AppointmentListItem[];
  isLoading?: boolean;
  message?: string;
  className?: string;
};

function getVehiclePlateLabel(appointment: AppointmentListItem) {
  return appointment.vehicle?.plate?.trim() || "---";
}

function getShortDateLabel(dateLabel: string) {
  const [day, month, year] = dateLabel.split("/");

  if (!day || !month || !year) {
    return dateLabel;
  }

  return `${day}/${month}/${year.slice(-2)}`;
}

function AppointmentsHistoryMobileMessage({ message }: { message: string }) {
  return (
    <div className="px-3 pb-4 pt-1 min-[380px]:px-4">
      <div className="flex min-h-24 items-center justify-center rounded-xl border border-dashed border-border/70 bg-background/45 px-4 text-center text-sm text-muted-foreground">
        {message}
      </div>
    </div>
  );
}

function AppointmentsHistoryMobileCardsList({
  appointments,
}: {
  appointments: AppointmentListItem[];
}) {
  return (
    <ul className="space-y-3 px-3 pb-4 pt-1 min-[380px]:px-4">
      {appointments.map((appointment) => {
        const dateTime = getAppointmentDateTimeLabels(appointment.startsAt);
        const dateLabel = getShortDateLabel(dateTime.date);
        const customerName = getCustomerName(appointment);
        const vehicleBrand = getVehicleBrandLabel(appointment);
        const vehicleModel = getVehicleModelLabel(appointment);
        const vehiclePlate = getVehiclePlateLabel(appointment);
        const serviceName = getServiceName(appointment);
        const status = appointmentsHistoryStatusMeta[appointment.status];
        const amount = formatBrlFromCents(getAppointmentAmountInCents(appointment));

        return (
          <li
            key={appointment.id}
            className="grid min-w-0 grid-cols-[3.75rem_minmax(0,1fr)] overflow-hidden rounded-xl border border-border/70 bg-background/45 shadow-xs transition-colors hover:border-accent/40 hover:bg-accent-soft/20 min-[380px]:grid-cols-[4.25rem_minmax(0,1fr)]"
          >
            <div className="flex flex-col justify-center border-r border-border/70 px-2 py-4 text-center min-[380px]:px-3">
              <span className="text-sm font-semibold tabular-nums text-muted-foreground">
                {dateTime.time}
              </span>
              <span className="mt-1 text-[0.6875rem] font-medium tabular-nums text-muted-foreground/80">
                {dateLabel}
              </span>
            </div>

            <div className="min-w-0 px-3 py-3 min-[380px]:px-4">
              <div className="grid min-w-0 gap-2 min-[400px]:grid-cols-[minmax(0,1fr)_auto] min-[400px]:items-start">
                <div className="min-w-0 overflow-hidden">
                  <HintTooltip label={customerName} className="max-w-72 break-words leading-5">
                    <span className="block max-w-full truncate text-sm font-semibold text-foreground">
                      {customerName}
                    </span>
                  </HintTooltip>

                  <div className="mt-1 flex min-w-0 flex-col items-start gap-1 min-[380px]:flex-row min-[380px]:items-center min-[380px]:gap-2">
                    <div className="min-w-0 max-w-full overflow-hidden">
                      <HintTooltip
                        label={`${vehicleBrand} ${vehicleModel}`}
                        className="max-w-72 break-words leading-5"
                      >
                        <span className="block max-w-full truncate text-xs text-muted-foreground">
                          {vehicleBrand} {vehicleModel}
                        </span>
                      </HintTooltip>
                    </div>
                    <Badge
                      variant="outline"
                      className="max-w-20 shrink-0 truncate rounded-sm border-border/70 bg-muted/45 px-1.5 py-0.5 text-[0.625rem] font-semibold tabular-nums text-muted-foreground"
                    >
                      {vehiclePlate}
                    </Badge>
                  </div>
                </div>

                <Badge
                  className={cn(
                    "w-fit max-w-full shrink-0 truncate rounded-full px-2 py-1 text-[0.6875rem] font-semibold hover:cursor-default min-[400px]:justify-self-end",
                    status.className,
                  )}
                >
                  {status.label}
                </Badge>
              </div>

              <div className="mt-3 flex min-w-0 flex-col gap-1 min-[400px]:flex-row min-[400px]:items-end min-[400px]:justify-between min-[400px]:gap-3">
                <div className="min-w-0 overflow-hidden">
                  <HintTooltip label={serviceName} className="max-w-72 break-words leading-5">
                    <span className="block max-w-full truncate text-sm font-medium text-foreground">
                      {serviceName}
                    </span>
                  </HintTooltip>
                </div>
                <span className="shrink-0 self-end text-xs font-semibold tabular-nums text-muted-foreground min-[400px]:self-auto">
                  {amount}
                </span>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function AppointmentsHistoryMobileCards({
  appointments = [],
  isLoading = false,
  message,
  className,
}: AppointmentsHistoryMobileCardsProps) {
  return (
    <div className={cn("md:hidden", className)}>
      {isLoading ? <AppointmentsHistoryMobileCardsSkeleton /> : null}
      {!isLoading && message ? <AppointmentsHistoryMobileMessage message={message} /> : null}
      {!isLoading && !message && !appointments.length ? (
        <AppointmentsHistoryMobileMessage message="Nenhum agendamento encontrado." />
      ) : null}
      {!isLoading && !message && appointments.length ? (
        <AppointmentsHistoryMobileCardsList appointments={appointments} />
      ) : null}
    </div>
  );
}
