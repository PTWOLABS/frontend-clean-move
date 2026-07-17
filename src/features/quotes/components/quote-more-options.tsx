"use client";

import { useState } from "react";
import { FileText, Loader2, MoreVertical, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HintTooltip, HintTooltipProvider } from "@/shared/components/hint-tooltip";
import { cn } from "@/shared/utils/cn";

import { useGenerateQuotePdf } from "../hooks/mutations/use-gerenate-quote-pdf";
import type { QuoteListItemDto } from "../types/quotes";

type QuoteMoreOptionsProps = {
  quote: QuoteListItemDto;
  variant: "table" | "mobile";
  onDelete?: (quote: QuoteListItemDto) => void;
};

export function QuoteMoreOptions({ quote, variant, onDelete }: QuoteMoreOptionsProps) {
  const [open, setOpen] = useState(false);
  const generateQuotePdf = useGenerateQuotePdf();
  const isTableVariant = variant === "table";
  const canDelete = quote.status !== "APPROVED" && Boolean(onDelete);
  const trigger = (
    <Button
      type="button"
      variant={isTableVariant ? "outline" : "ghost"}
      size="icon"
      className={cn(
        isTableVariant
          ? "size-10 rounded-md border-border/80 bg-background/50 text-muted-foreground shadow-none transition-colors hover:bg-muted/70 hover:text-foreground"
          : "size-10 rounded-full text-muted-foreground hover:bg-muted/70 hover:text-foreground",
      )}
      aria-label="Mais opções"
      onClick={(event) => event.stopPropagation()}
    >
      <MoreVertical className="size-4" aria-hidden="true" />
    </Button>
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      {isTableVariant ? (
        <HintTooltipProvider>
          <HintTooltip label="Mais opções">
            <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
          </HintTooltip>
        </HintTooltipProvider>
      ) : (
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      )}
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          disabled={generateQuotePdf.isPending}
          onSelect={(event) => {
            event.preventDefault();
            generateQuotePdf.mutate(quote.id, {
              onSuccess: () => setOpen(false),
            });
          }}
        >
          {generateQuotePdf.isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <FileText className="size-4" aria-hidden="true" />
          )}
          {generateQuotePdf.isPending ? "Gerando PDF..." : "Gerar PDF"}
        </DropdownMenuItem>
        {canDelete ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={() => onDelete?.(quote)}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Excluir orçamento
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
