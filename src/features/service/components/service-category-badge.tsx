import { Badge } from "@/components/ui/badge";
import { cn } from "@/shared/utils/cn";

import { formatServiceCategory } from "../lib/format-catalog";
import type { ServiceCategoryRef } from "../types";

type ServiceCategoryBadgeProps = {
  category: ServiceCategoryRef | null | undefined;
  className?: string;
};

export function ServiceCategoryBadge({ category, className }: ServiceCategoryBadgeProps) {
  const label = formatServiceCategory(category);

  return (
    <Badge
      variant="secondary"
      className={cn("border-transparent bg-muted font-medium text-foreground", className)}
    >
      {label}
    </Badge>
  );
}
