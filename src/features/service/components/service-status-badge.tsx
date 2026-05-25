import { Badge } from "@/components/ui/badge";
import { cn } from "@/shared/utils/cn";

type ServiceStatusBadgeProps = {
  isActive: boolean;
  className?: string;
};

export function ServiceStatusBadge({ isActive, className }: ServiceStatusBadgeProps) {
  if (isActive) {
    return (
      <Badge
        variant="secondary"
        className={cn("border-transparent bg-muted font-medium text-foreground", className)}
      >
        Ativo
      </Badge>
    );
  }
  return (
    <Badge
      variant="secondary"
      className={cn("border-transparent bg-muted/80 font-medium text-foreground", className)}
    >
      Inativo
    </Badge>
  );
}
