import { Sparkles } from "lucide-react";

import { cn } from "@/shared/utils/cn";

type ServiceCatalogItemThumbProps = {
  /** Ex.: `size-10` (tabela) ou `size-12` (cards). */
  className?: string;
  iconClassName?: string;
};

/** Miniatura decorativa à esquerda do nome do serviço (listagem). */
export function ServiceCatalogItemThumb({
  className,
  iconClassName,
}: ServiceCatalogItemThumbProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-md border border-border bg-muted/80 text-muted-foreground",
        className,
      )}
      aria-hidden
    >
      <Sparkles className={cn("size-5", iconClassName)} aria-hidden />
    </div>
  );
}
