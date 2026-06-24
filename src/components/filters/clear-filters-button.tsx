import { RotateCcw } from "lucide-react";

import { Button, type ButtonProps } from "@/components/ui/button";

type ClearFiltersButtonProps = Omit<ButtonProps, "asChild" | "children" | "type" | "variant">;

export function ClearFiltersButton({ className, ...props }: ClearFiltersButtonProps) {
  return (
    <Button type="button" variant="outline" className={className} {...props}>
      <RotateCcw className="size-4" />
      Limpar filtros
    </Button>
  );
}
