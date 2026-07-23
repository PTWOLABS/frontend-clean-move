"use client";

import { AlertTriangle, ArrowLeft, CheckCircle2, LoaderCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatQuoteApprovalAnalysisCount } from "../../lib/quote-approval-analysis-feedback";
import {
  applyQuoteApprovalResolutionSelection,
  getResolutionCards,
  hasPendingQuoteApprovalResolutionDetails,
  isQuoteApprovalResolutionSelected,
  type QuoteApprovalResolutionValues,
} from "../../lib/quote-approval-resolution-helpers";
import type { QuoteApprovalAnalysisDto } from "../../types/analyze-quote-approval";

type QuoteApprovalResolutionStepProps = {
  analysis: QuoteApprovalAnalysisDto;
  values: QuoteApprovalResolutionValues;
  isApproving: boolean;
  onChange: (values: QuoteApprovalResolutionValues) => void;
  onApprove: () => void;
  onBack: () => void;
};

export function QuoteApprovalResolutionStep({
  analysis,
  values,
  isApproving,
  onChange,
  onApprove,
  onBack,
}: QuoteApprovalResolutionStepProps) {
  const cards = getResolutionCards(analysis);
  const selectedCount = cards.filter((card) =>
    card.actions.some(
      (action) => action.selection && isQuoteApprovalResolutionSelected(values, action.selection),
    ),
  ).length;
  const canApprove =
    selectedCount === cards.length && !hasPendingQuoteApprovalResolutionDetails(values);

  return (
    <>
      <div className="border-b border-border bg-muted/20 px-5 py-5 sm:px-6">
        <DialogHeader className="text-left">
          <div className="mb-3 flex items-center justify-between gap-3 pr-8">
            <span className="flex size-11 items-center justify-center rounded-xl border border-warning/30 bg-warning-soft text-warning-soft-foreground">
              <AlertTriangle className="size-5" aria-hidden="true" />
            </span>
            <Badge variant="outline" className="bg-background text-[11px] text-muted-foreground">
              Pendências
            </Badge>
          </div>
          <DialogTitle className="text-xl">Resolver pendências</DialogTitle>
          <DialogDescription className="leading-relaxed">
            Revise os pontos que precisam de decisão antes de confirmar a aprovação.
          </DialogDescription>
        </DialogHeader>
      </div>

      <div className="space-y-4 px-5 py-5 sm:px-6">
        <div className="rounded-lg border border-warning/30 bg-warning-soft/40 p-3 text-sm text-warning-soft-foreground">
          {selectedCount} de{" "}
          {formatQuoteApprovalAnalysisCount(
            cards.length,
            "pendência com resolução selecionada",
            "pendências com resolução selecionada",
          )}
        </div>

        <ul className="space-y-3" aria-label="Pendências de aprovação do orçamento">
          {cards.map((card) => (
            <li key={card.id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex gap-3">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/30 text-muted-foreground">
                  <card.icon className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <Badge variant="outline" className="mb-2 bg-background text-[11px]">
                    {card.area}
                  </Badge>
                  <p className="text-sm font-semibold text-foreground">{card.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {card.description}
                  </p>

                  {card.actions.length > 0 ? (
                    <div
                      className="mt-3 flex flex-wrap gap-2"
                      aria-label={`Ações para ${card.area}`}
                    >
                      {card.actions.map((action) => {
                        const isSelected = isQuoteApprovalResolutionSelected(
                          values,
                          action.selection,
                        );

                        return (
                          <Button
                            key={action.id}
                            type="button"
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            className="h-auto min-h-8 whitespace-normal px-3 py-1.5 text-left text-xs"
                            aria-pressed={isSelected}
                            onClick={() => {
                              onChange(
                                applyQuoteApprovalResolutionSelection(values, action.selection),
                              );
                            }}
                          >
                            {action.label}
                          </Button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <DialogFooter className="gap-2 border-t border-border bg-muted/15 px-5 py-4 sm:justify-between sm:space-x-0 sm:px-6">
        <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onBack}>
          <ArrowLeft aria-hidden="true" />
          Voltar à análise
        </Button>
        <Button
          type="button"
          className="w-full sm:w-auto"
          disabled={!canApprove || isApproving}
          title={canApprove ? undefined : "Selecione uma resolução para cada pendência."}
          onClick={onApprove}
        >
          {isApproving ? (
            <>
              <LoaderCircle
                className="animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
              Aprovando
            </>
          ) : (
            <>
              <CheckCircle2 aria-hidden="true" />
              Confirmar aprovação
            </>
          )}
        </Button>
      </DialogFooter>
    </>
  );
}
