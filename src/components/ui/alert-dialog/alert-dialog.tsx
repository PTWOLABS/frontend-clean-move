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

type AlertDialogProps = {
  open: boolean;
  title: string;
  descriptionContent: ReactNode;
  isLoading?: boolean;
  actionMessage?: string;
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
            Cancelar
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
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
