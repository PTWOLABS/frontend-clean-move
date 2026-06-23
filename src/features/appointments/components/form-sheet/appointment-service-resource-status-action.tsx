"use client";

import { useState, type ReactNode } from "react";

import { Trash2 } from "lucide-react";

import { AlertDialog } from "@/components/ui/alert-dialog/alert-dialog";
import { Button } from "@/components/ui/button";
import { ResourceStatusBadge } from "@/shared/components/resource-status-badge";

import type { ResourceStatus } from "../../types/appointments-dto";

type AppointmentResourceStatusActionProps = {
  disabled?: boolean;
  resourceLabel: string;
  resourceName: string;
  resourceSourceName?: string;
  removeActionLabel: string;
  removeDescription: ReactNode;
  removeTitle: string;
  status?: ResourceStatus;
  onConfirmRemove: () => void;
};

export function AppointmentResourceStatusAction({
  disabled,
  resourceLabel,
  resourceName,
  resourceSourceName = "cadastro",
  removeActionLabel,
  removeDescription,
  removeTitle,
  status,
  onConfirmRemove,
}: AppointmentResourceStatusActionProps) {
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
      <ResourceStatusBadge
        status={status}
        resourceName={resourceName}
        sourceName={resourceSourceName}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-7 shrink-0 border-border/70 bg-background/60 px-2.5 text-xs text-muted-foreground shadow-xs hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
        disabled={disabled}
        aria-label={`Remover ${resourceName} ${resourceLabel}`}
        onClick={() => setConfirmationOpen(true)}
      >
        <Trash2 className="size-3.5" aria-hidden />
        Remover
      </Button>
      <AlertDialog
        open={confirmationOpen}
        title={removeTitle}
        descriptionContent={removeDescription}
        actionMessage={removeActionLabel}
        cancelMessage={`Manter ${resourceName}`}
        onOpenChange={setConfirmationOpen}
        onCancel={() => setConfirmationOpen(false)}
        onConfirm={handleConfirmRemove}
      />
    </>
  );
}

export function AppointmentServiceResourceStatusAction({
  disabled,
  serviceLabel,
  status,
  onConfirmRemove,
}: {
  disabled?: boolean;
  serviceLabel: string;
  status?: ResourceStatus;
  onConfirmRemove: () => void;
}) {
  return (
    <AppointmentResourceStatusAction
      disabled={disabled}
      resourceLabel={serviceLabel}
      resourceName="serviço"
      resourceSourceName="catálogo"
      removeActionLabel="Remover serviço"
      removeTitle="Remover serviço deste agendamento?"
      removeDescription={
        <>
          Isso remove &quot;{serviceLabel}&quot; da edição atual e libera a seleção de serviços. A
          alteração só será enviada ao salvar o agendamento.
        </>
      }
      status={status}
      onConfirmRemove={onConfirmRemove}
    />
  );
}
