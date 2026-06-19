"use client";

import { ListChecks } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

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
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AppointmentPresentationService } from "@/shared/components/appointments/appointment-presenters";
import { formatCurrency } from "@/shared/utils/lib";

import type { TodayAgendaItem } from "./today-agenda-card";

type AgendaAppointmentServicesDialogProps = {
  appointment: TodayAgendaItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const entranceEase = [0.16, 1, 0.3, 1] as const;

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

function getAppointmentServices(appointment: TodayAgendaItem): AppointmentPresentationService[] {
  return appointment.services;
}

export function AgendaAppointmentServicesDialog({
  appointment,
  open,
  onOpenChange,
}: AgendaAppointmentServicesDialogProps) {
  const shouldReduceMotion = useReducedMotion();

  if (!appointment) {
    return null;
  }

  const services = getAppointmentServices(appointment);
  const amount = formatCurrency(
    services.reduce((acc, current) => {
      return (acc += current.priceInCents);
    }, 0),
  );

  const modalInitial = shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.985, y: 8 };
  const modalAnimate = shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 };
  const modalTransition = shouldReduceMotion
    ? { duration: 0.12, ease: "easeOut" as const }
    : {
        duration: 0.34,
        ease: entranceEase,
      };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border-border/80 bg-card p-0 shadow-xl data-[state=closed]:animate-none data-[state=open]:animate-none sm:max-w-2xl">
        <motion.div
          initial={modalInitial}
          animate={modalAnimate}
          transition={modalTransition}
          className="min-w-0"
        >
          <DialogHeader className="border-b border-border/70 px-5 pb-4 pt-5 pr-12 text-left">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <ListChecks className="size-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <DialogTitle className="text-xl font-semibold">Serviços do agendamento</DialogTitle>
                <DialogDescription className="mt-1">
                  Este agendamento possui {services.length} serviço
                  {services.length === 1 ? "" : "s"} vinculado
                  {services.length === 1 ? "" : "s"}.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="max-h-[calc(100dvh-10rem)] min-w-0 overflow-y-auto px-5 py-5">
            <div className="space-y-3 sm:hidden">
              {services.map((service, index) => (
                <motion.article
                  key={service.id}
                  initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                  animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  transition={
                    shouldReduceMotion
                      ? { duration: 0.12, ease: "easeOut" as const }
                      : { duration: 0.28, ease: entranceEase, delay: 0.08 + index * 0.04 }
                  }
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
                </motion.article>
              ))}
              <motion.div
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0.12, ease: "easeOut" as const }
                    : { duration: 0.28, ease: entranceEase, delay: 0.08 + services.length * 0.04 }
                }
                className="flex items-center justify-between gap-3 rounded-2xl border border-border/80 bg-muted/25 px-4 py-3"
              >
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Total dos serviços
                </span>
                <strong className="shrink-0 text-base font-semibold tabular-nums text-card-foreground">
                  {amount}
                </strong>
              </motion.div>
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
                  {services.map((service) => (
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
                <TableFooter className="border-t border-border/80 bg-muted/25">
                  <TableRow className="hover:bg-transparent">
                    <TableCell
                      colSpan={2}
                      className="pl-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground"
                    >
                      Total dos serviços
                    </TableCell>
                    <TableCell className="pr-4 py-3 text-right text-base font-semibold tabular-nums text-card-foreground">
                      {amount}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
