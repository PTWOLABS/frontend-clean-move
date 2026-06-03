"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarClock, CarFront, FileText, UserRound, Wrench } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useRef } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppointmentStatusActions } from "@/features/appointments/components/appointment-status-actions";
import type { AppointmentStatus } from "@/shared/types/appointments";
import { formatCurrency } from "@/shared/utils/lib";
import { cn } from "@/shared/utils/cn";

import type { TodayAgendaItem } from "./today-agenda-card";

type AgendaAppointmentDetailsDialogProps = {
  appointment: TodayAgendaItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isUpdatingStatus?: boolean;
  onEdit?: (appointment: TodayAgendaItem) => void;
  onStatusChange?: (appointmentId: string, status: AppointmentStatus) => void;
};

const statusClassName: Record<TodayAgendaItem["status"], string> = {
  "in-progress": "border-transparent bg-info-soft text-info-soft-foreground",
  SCHEDULED: "border-transparent bg-info-soft text-info-soft-foreground",
  DONE: "border-transparent bg-success-soft text-success-soft-foreground",
  CANCELLED: "border-transparent bg-danger-soft text-danger-soft-foreground",
};

const statusLabel: Record<TodayAgendaItem["status"], string> = {
  "in-progress": "Em andamento",
  SCHEDULED: "Agendado",
  DONE: "Concluído",
  CANCELLED: "Cancelado",
};

const entranceEase = [0.16, 1, 0.3, 1] as const;

function isAppointmentStatus(status: TodayAgendaItem["status"]): status is AppointmentStatus {
  return status !== "in-progress";
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarClock;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background/45 p-4">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-card-foreground">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export function AgendaAppointmentDetailsDialog({
  appointment,
  open,
  onOpenChange,
  isUpdatingStatus = false,
  onEdit,
  onStatusChange,
}: AgendaAppointmentDetailsDialogProps) {
  const shouldReduceMotion = useReducedMotion();
  const dialogContentRef = useRef<HTMLDivElement | null>(null);

  if (!appointment) {
    return null;
  }

  const modalInitial = shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.985, y: 8 };
  const modalAnimate = shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 };
  const modalTransition = shouldReduceMotion
    ? { duration: 0.12, ease: "easeOut" as const }
    : {
        duration: 0.34,
        ease: entranceEase,
      };

  const getContentMotion = (delay: number) => ({
    initial: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 },
    animate: shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 },
    transition: shouldReduceMotion
      ? { duration: 0.12, ease: "easeOut" as const }
      : { duration: 0.28, ease: entranceEase, delay },
  });
  const actionableStatus = isAppointmentStatus(appointment.status) ? appointment.status : null;
  const canShowActions = actionableStatus && onStatusChange;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={dialogContentRef}
        tabIndex={-1}
        className="w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border-border/80 bg-card p-0 shadow-xl outline-none data-[state=closed]:animate-none data-[state=open]:animate-none sm:max-w-2xl"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          dialogContentRef.current?.focus();
        }}
      >
        <motion.div
          initial={modalInitial}
          animate={modalAnimate}
          transition={modalTransition}
          className="max-h-[calc(100dvh-2rem)] min-w-0 overflow-y-auto"
        >
          <DialogHeader className="border-b border-border/70 px-5 pb-4 pt-5 pr-12 text-left">
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <DialogTitle className="truncate text-xl font-semibold">
                  {appointment.serviceName}
                </DialogTitle>
                <DialogDescription className="mt-1">
                  {format(appointment.startsAt, "EEEE, d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                </DialogDescription>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "w-fit shrink-0 rounded-full px-2.5 py-1 text-[11px]",
                    statusClassName[appointment.status],
                  )}
                >
                  {statusLabel[appointment.status]}
                </Badge>

                {canShowActions ? (
                  <AppointmentStatusActions
                    appointmentId={appointment.id}
                    currentStatus={actionableStatus}
                    isUpdating={isUpdatingStatus}
                    onEdit={onEdit ? () => onEdit(appointment) : undefined}
                    onStatusChange={onStatusChange}
                  />
                ) : null}
              </div>
            </div>
          </DialogHeader>

          <div className="min-w-0 space-y-4 px-5 py-5">
            <div className="grid min-w-0 gap-3 sm:grid-cols-2">
              <motion.div {...getContentMotion(0.08)}>
                <DetailRow icon={UserRound} label="Cliente" value={appointment.customerName} />
              </motion.div>
              <motion.div {...getContentMotion(0.12)}>
                <DetailRow icon={CarFront} label="Veículo" value={appointment.vehicleLabel} />
              </motion.div>
              <motion.div {...getContentMotion(0.16)}>
                <DetailRow icon={CalendarClock} label="Horário" value={appointment.timeRange} />
              </motion.div>
              <motion.div {...getContentMotion(0.2)}>
                <DetailRow
                  icon={FileText}
                  label="Valor estimado"
                  value={formatCurrency(appointment.amountInCents)}
                />
              </motion.div>
            </div>

            <motion.div
              {...getContentMotion(0.24)}
              className="rounded-2xl border border-border/70 bg-background/45 p-4"
            >
              <div className="flex items-start gap-3">
                <Wrench className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                <div className="min-w-0">
                  <p className="break-words text-sm font-medium text-card-foreground">
                    {appointment.description || "Sem observações operacionais."}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">Observações</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
