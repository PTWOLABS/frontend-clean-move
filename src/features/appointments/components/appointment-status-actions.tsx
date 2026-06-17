"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  Loader2,
  Pencil,
  Settings,
  Trash2,
  XCircle,
} from "lucide-react";

import { AlertDialog } from "@/components/ui/alert-dialog/alert-dialog";
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

import { useDeleteAppointment } from "../hooks/mutations/use-delete-appointment-mutation";
import { getStatusLabel } from "../lib/appointments-calendar";

type AppointmentStatusActionsProps = {
  appointmentId: string;
  currentStatus: AppointmentStatus;
  isUpdating: boolean;
  onEdit?: () => void;
  onStatusChange: (appointmentId: string, status: AppointmentStatus) => Promise<void> | void;
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

function stopNativeEventPropagation(event: Event) {
  event.stopPropagation();
  event.stopImmediatePropagation();
}

function useNativeMouseDownPropagationStopper<TElement extends HTMLElement>() {
  const elementRef = useRef<TElement | null>(null);

  const setElement = useCallback((nextElement: TElement | null) => {
    elementRef.current?.removeEventListener("mousedown", stopNativeEventPropagation);
    elementRef.current = nextElement;
    elementRef.current?.addEventListener("mousedown", stopNativeEventPropagation);
  }, []);

  useEffect(
    () => () => {
      elementRef.current?.removeEventListener("mousedown", stopNativeEventPropagation);
    },
    [],
  );

  return setElement;
}

function isTargetInsideElement(element: HTMLElement | null, target: EventTarget | null) {
  return target instanceof Node && Boolean(element?.contains(target));
}

export function AppointmentStatusActions({
  appointmentId,
  currentStatus,
  isUpdating,
  onEdit,
  onStatusChange,
}: AppointmentStatusActionsProps) {
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false);
  const [cancellationConfirmationOpen, setCancellationConfirmationOpen] = useState(false);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const mountedRef = useRef(false);
  const consumeOutsideInteractionFollowUpRef = useRef(false);
  const clearOutsideInteractionFollowUpTimeoutRef = useRef<ReturnType<
    typeof globalThis.setTimeout
  > | null>(null);
  const actionsTriggerRef = useRef<HTMLButtonElement | null>(null);
  const actionsContentRef = useRef<HTMLDivElement | null>(null);
  const setActionsTriggerElement = useNativeMouseDownPropagationStopper<HTMLButtonElement>();
  const setActionsContentElement = useNativeMouseDownPropagationStopper<HTMLDivElement>();

  const handleActionsTriggerElement = useCallback(
    (element: HTMLButtonElement | null) => {
      actionsTriggerRef.current = element;
      setActionsTriggerElement(element);
    },
    [setActionsTriggerElement],
  );

  const handleActionsContentElement = useCallback(
    (element: HTMLDivElement | null) => {
      actionsContentRef.current = element;
      setActionsContentElement(element);
    },
    [setActionsContentElement],
  );

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      if (clearOutsideInteractionFollowUpTimeoutRef.current !== null) {
        globalThis.clearTimeout(clearOutsideInteractionFollowUpTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleOutsideInteractionFollowUp = (event: Event) => {
      if (!consumeOutsideInteractionFollowUpRef.current) {
        return;
      }

      stopNativeEventPropagation(event);

      if (event.type === "click") {
        consumeOutsideInteractionFollowUpRef.current = false;
      }
    };
    const listenerOptions = { capture: true };

    document.addEventListener("mousedown", handleOutsideInteractionFollowUp, listenerOptions);
    document.addEventListener("click", handleOutsideInteractionFollowUp, listenerOptions);

    return () => {
      document.removeEventListener("mousedown", handleOutsideInteractionFollowUp, listenerOptions);
      document.removeEventListener("click", handleOutsideInteractionFollowUp, listenerOptions);
    };
  }, []);

  useEffect(() => {
    if (!actionsMenuOpen) {
      return;
    }

    const handleOutsideInteraction = (event: Event) => {
      if (
        isTargetInsideElement(actionsTriggerRef.current, event.target) ||
        isTargetInsideElement(actionsContentRef.current, event.target)
      ) {
        return;
      }

      consumeOutsideInteractionFollowUpRef.current = true;

      if (clearOutsideInteractionFollowUpTimeoutRef.current !== null) {
        globalThis.clearTimeout(clearOutsideInteractionFollowUpTimeoutRef.current);
      }

      clearOutsideInteractionFollowUpTimeoutRef.current = globalThis.setTimeout(() => {
        consumeOutsideInteractionFollowUpRef.current = false;
        clearOutsideInteractionFollowUpTimeoutRef.current = null;
      }, 500);
      setActionsMenuOpen(false);
      stopNativeEventPropagation(event);
    };
    const listenerOptions = { capture: true };

    document.addEventListener("pointerdown", handleOutsideInteraction, listenerOptions);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideInteraction, listenerOptions);
    };
  }, [actionsMenuOpen]);

  const { mutate: deleteAppointment, isPending: isDeletingAppointment } = useDeleteAppointment();

  function handleStatusAction(status: AppointmentStatus) {
    if (status === currentStatus || isUpdating || isDeletingAppointment) {
      return;
    }

    if (status === "CANCELLED") {
      setCancellationConfirmationOpen(true);
      return;
    }

    void Promise.resolve(onStatusChange(appointmentId, status)).catch(() => undefined);
  }

  function handleConfirmCancellation() {
    void Promise.resolve(onStatusChange(appointmentId, "CANCELLED"))
      .then(() => {
        if (mountedRef.current) {
          setCancellationConfirmationOpen(false);
        }
      })
      .catch(() => undefined);
  }

  function handleDeleteAction() {
    if (currentStatus === "DONE" || isUpdating || isDeletingAppointment) {
      return;
    }

    setDeleteConfirmationOpen(true);
  }

  function handleConfirmDelete() {
    if (currentStatus === "DONE" || isUpdating || isDeletingAppointment) {
      return;
    }

    deleteAppointment(appointmentId, {
      onSuccess: () => {
        if (mountedRef.current) {
          setDeleteConfirmationOpen(false);
        }
      },
    });
  }

  const availableActions = appointmentStatusActions.filter(
    (action) => action.status !== currentStatus,
  );
  const actionsLabel = onEdit ? "Ações do agendamento" : "Alterar status";
  const actionsAriaLabel = onEdit ? "Ações do agendamento" : "Alterar status do agendamento";
  const canDeleteAppointment = currentStatus !== "DONE";
  const isActionPending = isUpdating || isDeletingAppointment;

  return (
    <>
      <DropdownMenu open={actionsMenuOpen} onOpenChange={setActionsMenuOpen}>
        <HintTooltipProvider>
          <HintTooltip label={actionsLabel} side="left">
            <DropdownMenuTrigger asChild>
              <Button
                ref={handleActionsTriggerElement}
                type="button"
                variant="outline"
                size="icon"
                className="size-8 shrink-0 rounded-xl border-border/70 bg-background/70"
                disabled={isActionPending}
                aria-label={actionsAriaLabel}
              >
                {isActionPending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <Settings className="size-4" aria-hidden />
                )}
              </Button>
            </DropdownMenuTrigger>
          </HintTooltip>
        </HintTooltipProvider>
        <DropdownMenuContent ref={handleActionsContentElement} align="end" className="w-56">
          {onEdit ? (
            <>
              <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                Ações
              </DropdownMenuLabel>
              <DropdownMenuItem disabled={isActionPending} onSelect={onEdit}>
                <Pencil className="size-4" aria-hidden />
                Editar agendamento
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          ) : null}
          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
            Status atual: {getStatusLabel(currentStatus)}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {availableActions.map((action) => {
            const Icon = action.icon;

            return (
              <DropdownMenuItem
                key={action.status}
                className={
                  action.status === "CANCELLED" ? "text-destructive focus:text-destructive" : ""
                }
                disabled={isActionPending}
                onSelect={() => handleStatusAction(action.status)}
              >
                <Icon className="size-4" aria-hidden />
                {action.label}
              </DropdownMenuItem>
            );
          })}
          {canDeleteAppointment ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                disabled={isActionPending}
                onSelect={handleDeleteAction}
              >
                <Trash2 className="size-4" aria-hidden />
                Excluir agendamento
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={cancellationConfirmationOpen}
        title="Cancelar agendamento?"
        descriptionContent={
          <>
            Esta ação altera o status do agendamento para cancelado. Tem certeza que deseja cancelar
            este agendamento?
          </>
        }
        isLoading={isUpdating}
        actionMessage="Cancelar agendamento"
        cancelMessage="Manter agendamento"
        onOpenChange={(open) => {
          if (isUpdating) {
            return;
          }

          setCancellationConfirmationOpen(open);
        }}
        onConfirm={handleConfirmCancellation}
        onCancel={() => setCancellationConfirmationOpen(false)}
      />

      <AlertDialog
        open={deleteConfirmationOpen}
        title="Excluir agendamento?"
        descriptionContent={
          <>Esta ação não pode ser desfeita. O agendamento será removido permanentemente.</>
        }
        isLoading={isDeletingAppointment}
        actionMessage="Excluir agendamento"
        cancelMessage="Manter agendamento"
        onOpenChange={(open) => {
          if (isDeletingAppointment) {
            return;
          }

          setDeleteConfirmationOpen(open);
        }}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmationOpen(false)}
      />
    </>
  );
}
