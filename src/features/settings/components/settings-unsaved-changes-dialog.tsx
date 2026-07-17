"use client";

import { AlertDialog } from "@/components/ui/alert-dialog/alert-dialog";

type SettingsUnsavedChangesDialogProps = {
  open: boolean;
  isSaving?: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
};

export function SettingsUnsavedChangesDialog({
  open,
  isSaving = false,
  onOpenChange,
  onSave,
  onDiscard,
  onCancel,
}: SettingsUnsavedChangesDialogProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Alterações não salvas"
      descriptionContent="Você tem alterações para salvar nesta aba. Deseja salvá-las antes de sair?"
      isLoading={isSaving}
      cancelMessage="Cancelar"
      actionMessage={isSaving ? "Salvando..." : "Salvar"}
      confirmVariant="default"
      middleAction={{
        label: "Descartar",
        onClick: onDiscard,
        disabled: isSaving,
        variant: "outline",
      }}
      onConfirm={onSave}
      onCancel={onCancel}
    />
  );
}
