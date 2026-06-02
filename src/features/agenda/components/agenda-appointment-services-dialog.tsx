"use client";

import { ListChecks } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/shared/utils/lib";

import type { TodayAgendaItem, TodayAgendaService } from "./today-agenda-card";

type AgendaAppointmentServicesDialogProps = {
  appointment: TodayAgendaItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function formatServiceDuration(durationInMinutes: number | null) {
  if (!durationInMinutes || durationInMinutes <= 0) {
    return "Não informada";
  }

  if (durationInMinutes < 60) {
    return `${durationInMinutes} min`;
  }

  const hours = Math.floor(durationInMinutes / 60);
  const minutes = durationInMinutes % 60;

  if (!minutes) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}min`;
}

function getAdditionalServices(appointment: TodayAgendaItem): TodayAgendaService[] {
  return appointment.services.slice(1);
}

export function AgendaAppointmentServicesDialog({
  appointment,
  open,
  onOpenChange,
}: AgendaAppointmentServicesDialogProps) {
  if (!appointment) {
    return null;
  }

  const additionalServices = getAdditionalServices(appointment);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border-border/80 bg-card p-0 shadow-xl sm:max-w-2xl">
        <DialogHeader className="border-b border-border/70 px-5 pb-4 pt-5 pr-12 text-left">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
              <ListChecks className="size-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <DialogTitle className="text-xl font-semibold">Serviços adicionais</DialogTitle>
              <DialogDescription className="mt-1">
                Além de {appointment.serviceName}, este agendamento possui mais{" "}
                {additionalServices.length} serviço
                {additionalServices.length === 1 ? "" : "s"}.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[calc(100dvh-10rem)] min-w-0 overflow-y-auto px-5 py-5">
          <div className="space-y-3 sm:hidden">
            {additionalServices.map((service) => (
              <article
                key={service.id}
                className="rounded-2xl border border-border/70 bg-background/45 p-4"
              >
                <h3 className="break-words text-sm font-semibold text-card-foreground">
                  {service.name}
                </h3>

                <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">Duração</dt>
                    <dd className="mt-1 font-medium text-card-foreground">
                      {formatServiceDuration(service.durationInMinutes)}
                    </dd>
                  </div>
                  <div className="text-right">
                    <dt className="text-xs text-muted-foreground">Valor</dt>
                    <dd className="mt-1 font-semibold tabular-nums text-card-foreground">
                      {formatCurrency(service.priceInCents)}
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-2xl border border-border/70 sm:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-background/45">
                  <TableHead className="pl-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Serviço
                  </TableHead>
                  <TableHead className="w-32 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Duração
                  </TableHead>
                  <TableHead className="w-32 pr-4 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Valor
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {additionalServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="pl-4 font-medium text-card-foreground">
                      {service.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatServiceDuration(service.durationInMinutes)}
                    </TableCell>
                    <TableCell className="pr-4 text-right font-medium tabular-nums text-card-foreground">
                      {formatCurrency(service.priceInCents)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
