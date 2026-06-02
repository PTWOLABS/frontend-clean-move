"use client";

import { MoreVertical } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HintTooltip, HintTooltipProvider } from "@/shared/components/hint-tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/shared/utils/cn";

import { useListAppointments } from "@/features/appointments/hooks/queries/use-list-appointments";
import { useQueryFeedbackError } from "@/shared/hooks/use-query-feedback-error";
import { formatBrlFromCents } from "@/shared/money/format-brl-money";
import { AppointmentsHistoryTableSkeletonRows } from "./appointments-history-table-skeleton-rows";
import { AppointmentsHistoryMobileCards } from "./appointments-history-mobile-cards";
import type { AppointmentsFilters } from "@/features/appointments/types/api-filters";
import {
  appointmentsHistoryStatusMeta,
  getAppointmentAmountInCents,
  getAppointmentDateTimeLabels,
  getCustomerName,
  getServiceName,
  getVehicleBrandLabel,
  getVehicleModelLabel,
} from "@/shared/utils/appointments-helpers";
import { formatLocalDateTimeAsUtcISOString } from "@/shared/utils/lib";
import type { DashboardMetricsFiltersBase } from "../../../types/dashboard-sections";

type TruncatedResourceLabelProps = {
  label: string;
  className?: string;
};

type AppointmentsHistoryTableProps = {
  className?: string;
  filters?: Pick<DashboardMetricsFiltersBase, "startsAt" | "endsAt">;
};

const APPOINTMENTS_HISTORY_TABLE_COLUMN_COUNT = 7;

function AppointmentsHistoryTableMessageRow({ message }: { message: string }) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell
        colSpan={APPOINTMENTS_HISTORY_TABLE_COLUMN_COUNT}
        className="h-24 px-6 text-center text-sm text-muted-foreground"
      >
        {message}
      </TableCell>
    </TableRow>
  );
}

function TruncatedResourceLabel({ label, className }: TruncatedResourceLabelProps) {
  return (
    <HintTooltip label={label} className="max-w-80 break-words leading-5">
      <span className={cn("block min-w-0 truncate", className)}>{label}</span>
    </HintTooltip>
  );
}

function getAppointmentsHistoryFilters(
  filters?: AppointmentsHistoryTableProps["filters"],
): AppointmentsFilters {
  return {
    startsAt: filters?.startsAt ? formatLocalDateTimeAsUtcISOString(filters.startsAt) : undefined,
    endsAt: filters?.endsAt ? formatLocalDateTimeAsUtcISOString(filters.endsAt) : undefined,
    size: 5,
  };
}

export function AppointmentsHistoryTable({ className, filters }: AppointmentsHistoryTableProps) {
  const { data, error, isPending, isPlaceholderData } = useListAppointments(
    getAppointmentsHistoryFilters(filters),
  );
  const showSkeletonRows = isPending || isPlaceholderData;

  const feedback = useQueryFeedbackError({
    error,
    resourceKey: "dashboard-history-appointments",
    resourceLabel: "os agendamentos",
  });

  return (
    <Card className={cn("h-full min-w-0 md:col-span-2 xl:col-span-4", className)}>
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-3">
        <CardTitle className="text-base font-semibold">Histórico de agendamentos</CardTitle>
        <Button type="button" variant="outline" size="sm" className="shrink-0">
          Ver todos
        </Button>
      </CardHeader>

      <CardContent className="min-w-0 p-0">
        <HintTooltipProvider>
          <AppointmentsHistoryMobileCards
            appointments={data?.appointments}
            isLoading={showSkeletonRows}
            message={feedback?.description}
          />

          <div className="hidden md:block">
            <Table className="min-w-[1024px] table-fixed">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-36 pl-6 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Data/Hora
                  </TableHead>
                  <TableHead className="w-44 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Cliente
                  </TableHead>
                  <TableHead className="w-56 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Veículo
                  </TableHead>
                  <TableHead className="w-48 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Serviço
                  </TableHead>
                  <TableHead className="w-32 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="w-28 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Valor
                  </TableHead>
                  <TableHead className="w-12 pr-4 text-right">
                    <span className="sr-only">Ações</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {showSkeletonRows ? <AppointmentsHistoryTableSkeletonRows /> : null}
                {!showSkeletonRows && feedback ? (
                  <AppointmentsHistoryTableMessageRow message={feedback.description} />
                ) : null}
                {!showSkeletonRows && !feedback && !data?.appointments?.length ? (
                  <AppointmentsHistoryTableMessageRow message="Nenhum agendamento encontrado." />
                ) : null}
                {!showSkeletonRows && !feedback
                  ? data?.appointments?.map((appointment) => {
                      const dateTime = getAppointmentDateTimeLabels(appointment.startsAt);
                      const customerName = getCustomerName(appointment);
                      const vehicleModel = getVehicleModelLabel(appointment);
                      const serviceName = getServiceName(appointment);
                      const status = appointmentsHistoryStatusMeta[appointment.status];

                      return (
                        <TableRow key={appointment.id} className="hover:bg-muted/30">
                          <TableCell className="pl-6 align-middle">
                            <div className="flex flex-col gap-0.5 whitespace-nowrap tabular-nums leading-tight">
                              <span className="text-xs font-medium text-foreground">
                                {dateTime.date}
                              </span>
                              <span className="text-[0.6875rem] text-muted-foreground">
                                {dateTime.time}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="min-w-0 align-middle text-foreground">
                            <TruncatedResourceLabel
                              label={customerName}
                              className="w-40 max-w-40"
                            />
                          </TableCell>
                          <TableCell className="min-w-0 align-middle">
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="inline-flex h-6 min-w-8 shrink-0 items-center justify-center rounded-sm border border-border/70 bg-muted/40 px-1.5 text-[0.65rem] font-semibold uppercase leading-none text-muted-foreground">
                                {getVehicleBrandLabel(appointment)}
                              </span>
                              <TruncatedResourceLabel
                                label={vehicleModel}
                                className="w-36 max-w-36 text-foreground"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="min-w-0 align-middle text-foreground">
                            <TruncatedResourceLabel label={serviceName} className="w-44 max-w-44" />
                          </TableCell>
                          <TableCell className="align-middle">
                            <Badge
                              className={cn(
                                "px-2 py-1 font-medium hover:cursor-default",
                                status.className,
                              )}
                            >
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap align-middle font-medium tabular-nums text-foreground">
                            {formatBrlFromCents(getAppointmentAmountInCents(appointment))}
                          </TableCell>
                          <TableCell className="pr-4 text-right align-middle">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-8 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                              aria-label={`Abrir ações de ${customerName}`}
                            >
                              <MoreVertical className="size-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  : null}
              </TableBody>
            </Table>
          </div>
        </HintTooltipProvider>
      </CardContent>
    </Card>
  );
}
