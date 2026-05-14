import * as React from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/shared/utils/cn";

export type DashboardPanelProps = Omit<
  React.ComponentPropsWithoutRef<typeof Card>,
  "children" | "title"
> & {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  contentClassName?: string;
};

const DashboardPanel = React.forwardRef<HTMLDivElement, DashboardPanelProps>(
  ({ title, description, action, children, className, contentClassName, ...props }, ref) => (
    <Card
      ref={ref}
      className={cn(
        "relative h-full overflow-hidden rounded-2xl border-border/80 bg-card/80 p-4 shadow-card backdrop-blur-sm sm:p-5",
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
          <h3 className="text-sm font-semibold leading-none text-card-foreground">{title}</h3>
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
