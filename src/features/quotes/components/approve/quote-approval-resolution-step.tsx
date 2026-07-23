"use client";

import { AlertTriangle, ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatQuoteApprovalAnalysisCount } from "../../lib/quote-approval-analysis-feedback";
import type { QuoteApprovalAnalysisDto } from "../../types/analyze-quote-approval";
import { getResolutionCards } from "../../lib/quote-approval-resolution-helpers";

type QuoteApprovalResolutionStepProps = {
  analysis: QuoteApprovalAnalysisDto;
  onBack: () => void;
};

export function QuoteApprovalResolutionStep({
  analysis,
  onBack,
}: QuoteApprovalResolutionStepProps) {
  const cards = getResolutionCards(analysis);

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
          {formatQuoteApprovalAnalysisCount(
            cards.length,
            "pendência precisa de resolução",
            "pendências precisam de resolução",
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
                      {card.actions.map((action) => (
                        <Badge
                          key={action}
                          variant="outline"
                          className="bg-background text-[11px] text-foreground"
                        >
                          {action}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <DialogFooter className="border-t border-border bg-muted/15 px-5 py-4 sm:px-6">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft aria-hidden="true" />
          Voltar à análise
        </Button>
      </DialogFooter>
    </>
  );
}
