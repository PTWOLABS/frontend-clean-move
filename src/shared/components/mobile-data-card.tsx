import type { KeyboardEvent, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/shared/utils/cn";

export type MobileDataCardTone = "neutral" | "primary" | "info" | "success" | "warning" | "danger";

export type MobileDataCardBadge = {
  label: ReactNode;
  tone?: MobileDataCardTone;
  className?: string;
};

export type MobileDataCardAction = {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
  tone?: MobileDataCardTone;
};

export type MobileDataCardFooter = {
  icon: LucideIcon;
  label: ReactNode;
  tone?: MobileDataCardTone;
};

type MobileDataCardProps = {
  title: ReactNode;
  value: ReactNode;
  status?: MobileDataCardBadge;
  metadata?: MobileDataCardBadge[];
  description?: ReactNode;
  footer?: MobileDataCardFooter;
  actions?: MobileDataCardAction[];
  accentTone?: MobileDataCardTone;
  selected?: boolean;
  onSelect?: () => void;
  className?: string;
};

const toneClassNames: Record<
  MobileDataCardTone,
  {
    accent: string;
    badge: string;
    action: string;
    text: string;
  }
> = {
  neutral: {
    accent: "bg-border",
    badge: "border-border bg-muted text-muted-foreground",
    action: "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
    text: "text-muted-foreground",
  },
  primary: {
    accent: "bg-primary",
    badge: "border-primary/30 bg-primary/10 text-primary",
    action: "text-primary hover:bg-primary/10 hover:text-primary",
    text: "text-primary",
  },
  info: {
    accent: "bg-info",
    badge: "border-info/30 bg-info-soft text-info-soft-foreground",
    action: "text-info-soft-foreground hover:bg-info-soft hover:text-info-soft-foreground",
    text: "text-info-soft-foreground",
  },
  success: {
    accent: "bg-success",
    badge: "border-success/30 bg-success-soft text-success-soft-foreground",
    action: "text-success-soft-foreground hover:bg-success-soft hover:text-success-soft-foreground",
    text: "text-success-soft-foreground",
  },
  warning: {
    accent: "bg-warning",
    badge: "border-warning/30 bg-warning-soft text-warning-soft-foreground",
    action: "text-warning-soft-foreground hover:bg-warning-soft hover:text-warning-soft-foreground",
    text: "text-warning-soft-foreground",
  },
  danger: {
    accent: "bg-danger",
    badge: "border-danger/30 bg-danger-soft text-danger-soft-foreground",
    action: "text-danger-soft-foreground hover:bg-danger-soft hover:text-danger-soft-foreground",
    text: "text-danger-soft-foreground",
  },
};

function renderBadge({ label, tone = "neutral", className }: MobileDataCardBadge) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "min-h-6 max-w-full rounded-sm px-2 py-0.5 text-[11px] font-semibold uppercase leading-none tracking-normal",
        toneClassNames[tone].badge,
        className,
      )}
    >
      <span className="truncate">{label}</span>
    </Badge>
  );
}

function isKeyboardSelection(event: KeyboardEvent<HTMLElement>) {
  return event.key === "Enter" || event.key === " ";
}

export function MobileDataCard({
  title,
  value,
  status,
  metadata = [],
  description,
  footer,
  actions = [],
  accentTone = status?.tone ?? "neutral",
  selected = false,
  onSelect,
  className,
}: MobileDataCardProps) {
  const selectableProps = onSelect
    ? {
        role: "button",
        tabIndex: 0,
        onClick: onSelect,
        onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
          if (!isKeyboardSelection(event)) return;
          event.preventDefault();
          onSelect();
        },
      }
    : {};

  return (
    <Card
      aria-selected={selected || undefined}
      className={cn(
        "relative overflow-hidden shadow-sm transition-colors",
        onSelect &&
          "cursor-pointer hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring",
        selected && "border-primary/70 ring-2 ring-primary/20",
        className,
      )}
      {...selectableProps}
    >
      <span
        className={cn("absolute inset-y-0 left-0 w-1", toneClassNames[accentTone].accent)}
        aria-hidden="true"
      />

      <CardContent className="space-y-3 p-4 pl-5">
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="min-w-0 space-y-2">
            <h3 className="line-clamp-2 text-lg font-bold leading-snug text-foreground">{title}</h3>
            {metadata.length > 0 || description ? (
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                {metadata.map((item, index) => (
                  <span key={index} className="min-w-0">
                    {renderBadge(item)}
                  </span>
                ))}
                {description ? (
                  <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                    {description}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2 text-right">
            <p className="text-lg font-bold leading-snug tabular-nums text-foreground">{value}</p>
            {status ? renderBadge(status) : null}
          </div>
        </div>

        {(footer || actions.length > 0) && <Separator />}

        {(footer || actions.length > 0) && (
          <div className="flex min-h-10 items-center justify-between gap-3">
            {footer ? (
              <div
                className={cn(
                  "flex min-w-0 items-center gap-2 text-sm font-medium",
                  toneClassNames[footer.tone ?? "neutral"].text,
                )}
              >
                <footer.icon className="size-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{footer.label}</span>
              </div>
            ) : (
              <span aria-hidden="true" />
            )}

            {actions.length > 0 && (
              <div className="flex shrink-0 items-center gap-1.5">
                {actions.map(({ label, icon: Icon, onClick, disabled, tone = "neutral" }) => (
                  <Button
                    key={label}
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={cn("size-10 rounded-full", toneClassNames[tone].action)}
                    disabled={disabled}
                    aria-label={label}
                    onClick={(event) => {
                      event.stopPropagation();
                      onClick();
                    }}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

type MobileDataCardSkeletonProps = {
  className?: string;
};

export function MobileDataCardSkeleton({ className }: MobileDataCardSkeletonProps) {
  return (
    <Card className={cn("relative overflow-hidden shadow-sm", className)}>
      <span className="absolute inset-y-0 left-0 w-1 bg-border" aria-hidden="true" />
      <CardContent className="space-y-3 p-4 pl-5">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="space-y-3">
            <Skeleton className="h-6 w-44 max-w-full" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
        <Separator />
        <div className="flex min-h-10 items-center justify-between gap-3">
          <Skeleton className="h-5 w-32" />
          <div className="flex items-center gap-1.5">
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="size-10 rounded-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
