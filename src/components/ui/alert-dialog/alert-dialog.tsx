import { ReactNode } from "react";
import {
  AlertDialog as AlertDialogPrimitive,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "../alert-dialog";
import { Button } from "../button";

type AlertDialogMiddleAction = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "outline" | "default";
};

type AlertDialogProps = {
  open: boolean;
  title: string;
  descriptionContent: ReactNode;
  isLoading?: boolean;
  actionMessage?: string;
  cancelMessage?: string;
  confirmVariant?: "default" | "destructive";
  middleAction?: AlertDialogMiddleAction;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
};

export function AlertDialog({
  open,
  title,
  descriptionContent,
  isLoading,
  actionMessage,
  cancelMessage = "Cancelar",
  confirmVariant = "destructive",
  middleAction,
  onOpenChange,
  onConfirm,
  onCancel,
}: AlertDialogProps) {
  return (
    <AlertDialogPrimitive open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{descriptionContent}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading} onClick={() => onCancel()}>
            {cancelMessage}
          </AlertDialogCancel>
          {middleAction ? (
            <Button
              type="button"
              variant={middleAction.variant ?? "outline"}
              disabled={isLoading || middleAction.disabled}
              onClick={() => middleAction.onClick()}
            >
              {middleAction.label}
            </Button>
          ) : null}
          <Button
            type="button"
            variant={confirmVariant}
            disabled={isLoading}
            onClick={() => onConfirm()}
          >
            {actionMessage}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogPrimitive>
  );
}
