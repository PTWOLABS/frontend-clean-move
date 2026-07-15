"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/shared/utils/cn";

type DiscardChangesButtonProps = {
  disabled?: boolean;
  className?: string;
  onClick: () => void;
};

export function DiscardChangesButton({
  disabled = false,
  className,
  onClick,
}: DiscardChangesButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      disabled={disabled}
      className={cn("w-full sm:w-auto", className)}
      onClick={onClick}
    >
      Descartar alterações
    </Button>
  );
}
