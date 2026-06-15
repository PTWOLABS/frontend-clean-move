import * as React from "react";
import { Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HintTooltip, HintTooltipProvider } from "@/shared/components/hint-tooltip";
import { cn } from "@/shared/utils/cn";

export type DashboardPanelProps = Omit<
  React.ComponentPropsWithoutRef<typeof Card>,
  "children" | "title"
> & {
  title: string;
  titleTooltip?: React.ReactNode;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  contentClassName?: string;
};

const DashboardPanel = React.forwardRef<HTMLDivElement, DashboardPanelProps>(
  (
    { title, titleTooltip, description, action, children, className, contentClassName, ...props },
    ref,
  ) => (
    <Card
      ref={ref}
      className={cn(
        "relative h-full overflow-hidden rounded-2xl border-border/80 bg-card/80 p-4 shadow-xs backdrop-blur-sm sm:p-5",
        className,
      )}
      {...props}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <h3 className="truncate text-sm font-semibold text-card-foreground">{title}</h3>
            {titleTooltip ? (
              <HintTooltipProvider>
                <HintTooltip label={titleTooltip} side="top" className="max-w-72 leading-5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Mais informações sobre ${title}`}
                    className="size-6 shrink-0 rounded-full text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                  >
                    <Info aria-hidden="true" className="size-4" />
                  </Button>
                </HintTooltip>
              </HintTooltipProvider>
            ) : null}
          </div>
          {description ? (
            <p className="text-xs leading-5 text-muted-foreground">{description}</p>
          ) : null}
        </div>

        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      <div className={cn("mt-5", contentClassName)}>{children}</div>
    </Card>
  ),
);
DashboardPanel.displayName = "DashboardPanel";

export { DashboardPanel };
