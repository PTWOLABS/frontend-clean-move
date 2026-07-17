"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { HintTooltip, HintTooltipProvider } from "@/shared/components/hint-tooltip";
import { cn } from "@/shared/utils/cn";

export type DataCatalogTone = "neutral" | "primary" | "info" | "success" | "warning" | "danger";

export type DataCatalogTableColumn<TItem> = {
  id: string;
  header: ReactNode;
  cell: (item: TItem) => ReactNode;
  className?: string;
  headerClassName?: string;
  align?: "left" | "center" | "right";
};

export type DataCatalogTableAction<TItem> = {
  label: string;
  icon: LucideIcon;
  onClick: (item: TItem) => void;
  visible?: (item: TItem) => boolean;
  disabled?: (item: TItem) => boolean;
  tone?: DataCatalogTone;
};

type DataCatalogTableProps<TItem> = {
  items: TItem[];
  columns: DataCatalogTableColumn<TItem>[];
  getRowId: (item: TItem) => string;
  actions?: DataCatalogTableAction<TItem>[];
  ariaLabel: string;
  className?: string;
  tableClassName?: string;
};

type DataCatalogStatusBadgeProps = {
  children: ReactNode;
  tone?: DataCatalogTone;
  className?: string;
};

type DataCatalogTableSkeletonProps = {
  rows?: number;
  columns?: number;
  className?: string;
};

const alignClassNames = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} satisfies Record<NonNullable<DataCatalogTableColumn<unknown>["align"]>, string>;

const toneClassNames: Record<
  DataCatalogTone,
  {
    badge: string;
    action: string;
  }
> = {
  neutral: {
    badge: "border-border bg-muted text-muted-foreground",
    action: "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
  },
  primary: {
    badge: "border-primary/25 bg-primary/10 text-primary",
    action: "text-primary hover:bg-primary/10 hover:text-primary",
  },
  info: {
    badge: "border-info/25 bg-info-soft text-info-soft-foreground",
    action: "text-info-soft-foreground hover:bg-info-soft hover:text-info-soft-foreground",
  },
  success: {
    badge: "border-success/25 bg-success-soft text-success-soft-foreground",
    action: "text-success-soft-foreground hover:bg-success-soft hover:text-success-soft-foreground",
  },
  warning: {
    badge: "border-warning/25 bg-warning-soft text-warning-soft-foreground",
    action: "text-warning-soft-foreground hover:bg-warning-soft hover:text-warning-soft-foreground",
  },
  danger: {
    badge: "border-danger/25 bg-danger-soft text-danger-soft-foreground",
    action: "text-danger-soft-foreground hover:bg-danger-soft hover:text-danger-soft-foreground",
  },
};

export function DataCatalogStatusBadge({
  children,
  tone = "neutral",
  className,
}: DataCatalogStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "min-h-7 rounded-full px-3 py-1 text-xs font-semibold tracking-normal",
        toneClassNames[tone].badge,
        className,
      )}
    >
      {children}
    </Badge>
  );
}

export function DataCatalogTable<TItem>({
  items,
  columns,
  getRowId,
  actions = [],
  ariaLabel,
  className,
  tableClassName,
}: DataCatalogTableProps<TItem>) {
  const hasActions = actions.length > 0;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-card/60 shadow-sm",
        className,
      )}
    >
      <Table className={cn("min-w-[58rem]", tableClassName)} aria-label={ariaLabel}>
        <TableHeader className="bg-muted/20">
          <TableRow className="border-border/80 hover:bg-transparent">
            {columns.map((column, index) => (
              <TableHead
                key={column.id}
                className={cn(
                  "h-14 px-5 text-xs font-semibold uppercase tracking-normal text-muted-foreground",
                  index === 0 && "pl-6",
                  column.align && alignClassNames[column.align],
                  column.headerClassName,
                )}
              >
                {column.header}
              </TableHead>
            ))}
            {hasActions ? (
              <TableHead className="h-14 px-6 text-right text-xs font-semibold uppercase tracking-normal text-muted-foreground">
                Ações
              </TableHead>
            ) : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow
              key={getRowId(item)}
              className="border-border/70 transition-colors hover:bg-muted/25"
            >
              {columns.map((column, index) => (
                <TableCell
                  key={column.id}
                  className={cn(
                    "h-20 px-5 align-middle text-sm text-foreground font-",
                    index === 0 && "pl-6",
                    column.align && alignClassNames[column.align],
                    column.className,
                  )}
                >
                  {column.cell(item)}
                </TableCell>
              ))}
              {hasActions ? (
                <TableCell className="h-20 px-6 text-right align-middle">
                  <HintTooltipProvider>
                    <div className="flex items-center justify-end gap-2">
                      {actions
                        .filter((action) => action.visible?.(item) ?? true)
                        .map((action) => {
                          const Icon = action.icon;
                          const disabled = action.disabled?.(item) ?? false;
                          const tone = action.tone ?? "neutral";

                          return (
                            <HintTooltip key={action.label} label={action.label}>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                disabled={disabled}
                                aria-label={action.label}
                                className={cn(
                                  "size-10 rounded-md border-border/80 bg-background/50 shadow-none transition-colors",
                                  toneClassNames[tone].action,
                                )}
                                onClick={() => action.onClick(item)}
                              >
                                <Icon className="size-4" aria-hidden="true" />
                              </Button>
                            </HintTooltip>
                          );
                        })}
                    </div>
                  </HintTooltipProvider>
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function DataCatalogTableSkeleton({
  rows = 5,
  columns = 6,
  className,
}: DataCatalogTableSkeletonProps) {
  return (
    <div className={cn("overflow-hidden rounded-lg border border-border bg-card/60", className)}>
      <div className="grid h-14 grid-flow-col auto-cols-fr gap-6 border-b border-border/80 bg-muted/20 px-6">
        {Array.from({ length: columns }, (_, index) => (
          <div key={index} className="flex items-center">
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
      <div>
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid h-20 grid-flow-col auto-cols-fr items-center gap-6 border-b border-border/70 px-6 last:border-b-0"
          >
            {Array.from({ length: columns }, (_, columnIndex) => (
              <Skeleton
                key={columnIndex}
                className={cn("h-4", columnIndex === columns - 1 ? "ml-auto w-24" : "w-28")}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
