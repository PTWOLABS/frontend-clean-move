"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

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
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Alterações não salvas</AlertDialogTitle>
          <AlertDialogDescription>
            Você tem alterações por salvar nesta aba. Deseja salvá-las antes de sair?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSaving} onClick={onCancel}>
            Cancelar
          </AlertDialogCancel>
          <Button type="button" variant="outline" disabled={isSaving} onClick={onDiscard}>
            Descartar
          </Button>
          <Button type="button" disabled={isSaving} onClick={onSave}>
            {isSaving ? "Salvando..." : "Salvar"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
