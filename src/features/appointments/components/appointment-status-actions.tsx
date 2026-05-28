"use client";

import { useState } from "react";
import { CalendarClock, CheckCircle2, Loader2, Settings, XCircle } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HintTooltip, HintTooltipProvider } from "@/shared/components/hint-tooltip";
import type { AppointmentStatus } from "@/shared/types/appointments";

import { getStatusLabel } from "../lib/appointments-calendar";

type AppointmentStatusActionsProps = {
  appointmentId: string;
  currentStatus: AppointmentStatus;
  isUpdating: boolean;
  onStatusChange: (appointmentId: string, status: AppointmentStatus) => void;
};

const appointmentStatusActions: Array<{
  status: AppointmentStatus;
  label: string;
  icon: typeof CheckCircle2;
}> = [
  {
    status: "DONE",
    label: "Marcar como concluído",
    icon: CheckCircle2,
  },
  {
    status: "SCHEDULED",
    label: "Voltar para agendado",
    icon: CalendarClock,
  },
  {
    status: "CANCELLED",
    label: "Cancelar agendamento",
    icon: XCircle,
  },
];

export function AppointmentStatusActions({
  appointmentId,
  currentStatus,
  isUpdating,
  onStatusChange,
}: AppointmentStatusActionsProps) {
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  function handleStatusAction(status: AppointmentStatus) {
    if (status === currentStatus || isUpdating) {
      return;
    }

    if (status === "CANCELLED") {
      setConfirmationOpen(true);
      return;
    }

    onStatusChange(appointmentId, status);
  }

  function handleConfirmCancellation() {
    onStatusChange(appointmentId, "CANCELLED");
    setConfirmationOpen(false);
  }

  const availableActions = appointmentStatusActions.filter(
    (action) => action.status !== currentStatus,
  );

  return (
    <AlertDialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
      <DropdownMenu>
        <HintTooltipProvider>
          <HintTooltip label="Alterar status" side="left">
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-8 shrink-0 rounded-xl border-border/70 bg-background/70"
                disabled={isUpdating}
                aria-label="Alterar status do agendamento"
              >
                {isUpdating ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <Settings className="size-4" aria-hidden />
                )}
              </Button>
            </DropdownMenuTrigger>
          </HintTooltip>
        </HintTooltipProvider>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
            Status atual: {getStatusLabel(currentStatus)}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {availableActions.map((action) => {
            const Icon = action.icon;

            return (
              <DropdownMenuItem
                key={action.status}
                className={action.status === "CANCELLED" ? "text-danger focus:text-danger" : ""}
                disabled={isUpdating}
                onSelect={() => handleStatusAction(action.status)}
              >
                <Icon className="size-4" aria-hidden />
                {action.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancelar agendamento?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação altera o status do agendamento para cancelado. O backend continuará
            responsável pelas regras de permissão e validação.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isUpdating}>Manter agendamento</AlertDialogCancel>
          <AlertDialogAction
            className="bg-danger text-danger-foreground hover:bg-danger/90"
            disabled={isUpdating}
            onClick={handleConfirmCancellation}
          >
            Cancelar agendamento
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
