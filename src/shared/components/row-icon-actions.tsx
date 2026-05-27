import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { HintTooltip, HintTooltipProvider } from "@/shared/components/hint-tooltip";
import { cn } from "@/shared/utils/cn";

type RowIconAction = {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  variant?: "ghost" | "outline";
};

type RowIconActionsProps = {
  actions: RowIconAction[];
  className?: string;
};

export function RowIconActions({ actions, className }: RowIconActionsProps) {
  return (
    <HintTooltipProvider>
      <div className={cn("flex items-center gap-1", className)}>
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <HintTooltip key={action.label} label={action.label}>
              <Button
                type="button"
                variant={action.variant ?? "ghost"}
                size="icon"
                className={action.className}
                disabled={action.disabled}
                aria-label={action.label}
                onClick={action.onClick}
              >
                <Icon className="size-4" />
              </Button>
            </HintTooltip>
          );
        })}
      </div>
    </HintTooltipProvider>
  );
}
