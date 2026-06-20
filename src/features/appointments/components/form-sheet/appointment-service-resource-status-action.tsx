"use client";

import { useState } from "react";

import { Trash2 } from "lucide-react";

import { AlertDialog } from "@/components/ui/alert-dialog/alert-dialog";
import { Button } from "@/components/ui/button";
import { ResourceStatusBadge } from "@/shared/components/resource-status-badge";

import type { ResourceStatus } from "../../types/appointments-dto";

type AppointmentServiceResourceStatusActionProps = {
  disabled?: boolean;
  serviceLabel: string;
  status?: ResourceStatus;
  onConfirmRemove: () => void;
};

export function AppointmentServiceResourceStatusAction({
  disabled,
  serviceLabel,
  status,
  onConfirmRemove,
}: AppointmentServiceResourceStatusActionProps) {
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  if (!status || status === "UNCHANGED") {
    return null;
  }

  const handleConfirmRemove = () => {
    onConfirmRemove();
    setConfirmationOpen(false);
  };

  return (
    <>
      <ResourceStatusBadge status={status} />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-7 shrink-0 border-border/70 bg-background/60 px-2.5 text-xs text-muted-foreground shadow-xs hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
        disabled={disabled}
        aria-label={`Remover serviço ${serviceLabel}`}
        onClick={() => setConfirmationOpen(true)}
      >
        <Trash2 className="size-3.5" aria-hidden />
        Remover
      </Button>
      <AlertDialog
        open={confirmationOpen}
        title="Remover serviço deste agendamento?"
        descriptionContent={
          <>
            Isso remove &quot;{serviceLabel}&quot; da edição atual e libera a seleção de serviços. A
            alteração só será enviada ao salvar o agendamento.
          </>
        }
        actionMessage="Remover serviço"
        cancelMessage="Manter serviço"
        onOpenChange={setConfirmationOpen}
        onCancel={() => setConfirmationOpen(false)}
        onConfirm={handleConfirmRemove}
      />
    </>
  );
}
