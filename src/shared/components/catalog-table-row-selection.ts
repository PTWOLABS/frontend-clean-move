import { cn } from "@/shared/utils/cn";

export function catalogTableRowClass(isSelected: boolean) {
  return cn("cursor-pointer transition-colors hover:bg-muted/40", isSelected && "bg-primary/10");
}
