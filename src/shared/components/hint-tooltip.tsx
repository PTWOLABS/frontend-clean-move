"use client";

import type { ComponentProps, ReactElement, ReactNode } from "react";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/shared/utils/cn";

const hintContentClassName = "border border-border bg-popover text-popover-foreground shadow-md";

type HintTooltipProviderProps = {
  children: ReactNode;
  delayDuration?: number;
};

/** Agrupa tooltips com delay padrão (200 ms). */
export function HintTooltipProvider({ children, delayDuration = 200 }: HintTooltipProviderProps) {
  return <TooltipProvider delayDuration={delayDuration}>{children}</TooltipProvider>;
}

type HintTooltipProps = {
  /** Texto ou conteúdo do tooltip. */
  label: ReactNode;
  /** Elemento interactivo (ex.: Button). */
  children: ReactElement;
  side?: ComponentProps<typeof TooltipContent>["side"];
  sideOffset?: number;
  className?: string;
};

export function HintTooltip({
  label,
  children,
  side = "top",
  sideOffset = 6,
  className,
}: HintTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">{children}</span>
      </TooltipTrigger>
      <TooltipContent
        side={side}
        sideOffset={sideOffset}
        className={cn(hintContentClassName, className)}
      >
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
