"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CalendarClock, CheckCircle2, Loader2, Pencil, Settings, XCircle } from "lucide-react";

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
  const [confirmationOpen, setConfirmationOpen] = useState(false);
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

  function handleStatusAction(status: AppointmentStatus) {
    if (status === currentStatus || isUpdating) {
      return;
    }

    if (status === "CANCELLED") {
      setConfirmationOpen(true);
      return;
    }

    void Promise.resolve(onStatusChange(appointmentId, status)).catch(() => undefined);
  }

  function handleConfirmCancellation() {
    void Promise.resolve(onStatusChange(appointmentId, "CANCELLED"))
      .then(() => {
        if (mountedRef.current) {
          setConfirmationOpen(false);
        }
      })
      .catch(() => undefined);
  }

  const availableActions = appointmentStatusActions.filter(
    (action) => action.status !== currentStatus,
  );
  const actionsLabel = onEdit ? "Ações do agendamento" : "Alterar status";
  const actionsAriaLabel = onEdit ? "Ações do agendamento" : "Alterar status do agendamento";
  const isCancellationPending = confirmationOpen && isUpdating;

  return (
    <AlertDialog
      open={confirmationOpen}
      onOpenChange={(open) => {
        if (isUpdating) {
          return;
        }

        setConfirmationOpen(open);
      }}
    >
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
                disabled={isUpdating}
                aria-label={actionsAriaLabel}
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
        <DropdownMenuContent ref={handleActionsContentElement} align="end" className="w-56">
          {onEdit ? (
            <>
              <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                Ações
              </DropdownMenuLabel>
              <DropdownMenuItem disabled={isUpdating} onSelect={onEdit}>
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
            Esta ação altera o status do agendamento para cancelado. Tem certeza que deseja cancelar
            este agendamento?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isUpdating}>Manter agendamento</AlertDialogCancel>
          <AlertDialogAction
            className="bg-danger text-danger-foreground hover:bg-danger/90"
            disabled={isUpdating}
            onClick={(event) => {
              event.preventDefault();
              handleConfirmCancellation();
            }}
          >
            {isCancellationPending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            Cancelar agendamento
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
