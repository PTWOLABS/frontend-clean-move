"use client";

import { ArrowLeft, CheckCircle2, UserRoundCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  QUOTE_CUSTOMER_CONFLICT_LABELS,
  QUOTE_CUSTOMER_MATCHED_BY_LABELS,
} from "../../constants/quote-approval-analysis-labels";
import {
  formatQuoteApprovalAnalysisCount,
  formatQuoteApprovalAnalysisList,
} from "../../lib/quote-approval-analysis-feedback";
import type { QuoteCustomerCandidateDto } from "../../types/analyze-quote-approval";

type QuoteApprovalCustomerCandidateStepProps = {
  candidates: QuoteCustomerCandidateDto[];
  selectedCustomerId?: string;
  onSelect: (customerId: string) => void;
  onBack: () => void;
};

export function QuoteApprovalCustomerCandidateStep({
  candidates,
  selectedCustomerId,
  onSelect,
  onBack,
}: QuoteApprovalCustomerCandidateStepProps) {
  return (
    <>
      <div className="border-b border-border bg-muted/20 px-5 py-5 sm:px-6">
        <DialogHeader className="text-left">
          <div className="mb-3 flex items-center justify-between gap-3 pr-8">
            <span className="flex size-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
              <UserRoundCheck className="size-5" aria-hidden="true" />
            </span>
            <Badge variant="outline" className="bg-background text-[11px] text-muted-foreground">
              Cliente
            </Badge>
          </div>
          <DialogTitle className="text-xl">Escolher cliente</DialogTitle>
          <DialogDescription className="leading-relaxed">
            Selecione qual cliente existente deve ser vinculado ao orçamento.
          </DialogDescription>
        </DialogHeader>
      </div>

      <div className="space-y-4 px-5 py-5 sm:px-6">
        <div className="rounded-lg border border-border bg-muted/25 p-3 text-sm text-muted-foreground">
          {formatQuoteApprovalAnalysisCount(
            candidates.length,
            "cliente candidato encontrado",
            "clientes candidatos encontrados",
          )}
        </div>

        <ul className="space-y-3" aria-label="Clientes candidatos">
          {candidates.map((candidate, index) => {
            const matchedBy = candidate.matchedBy.map(
              (matchedByItem) => QUOTE_CUSTOMER_MATCHED_BY_LABELS[matchedByItem],
            );
            const conflicts = candidate.conflictingFields.map(
              (field) => QUOTE_CUSTOMER_CONFLICT_LABELS[field],
            );
            const isSelected = candidate.customerId === selectedCustomerId;

            return (
              <li key={candidate.customerId}>
                <button
                  type="button"
                  className="w-full rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[selected=true]:border-primary data-[selected=true]:bg-primary/5"
                  data-selected={isSelected}
                  aria-pressed={isSelected}
                  aria-label={`Selecionar cliente candidato ${index + 1}`}
                  onClick={() => onSelect(candidate.customerId)}
                >
                  <div className="flex gap-3">
                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/30 text-muted-foreground">
                      {isSelected ? (
                        <CheckCircle2 className="size-4 text-primary" aria-hidden="true" />
                      ) : (
                        <UserRoundCheck className="size-4" aria-hidden="true" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">
                          Cliente candidato {index + 1}
                        </p>
                        {candidate.advisoryOnly ? (
                          <Badge variant="outline" className="bg-background text-[11px]">
                            Apenas alerta
                          </Badge>
                        ) : null}
                      </div>
                      <p className="mt-1 break-all font-mono text-xs text-muted-foreground">
                        {candidate.customerId}
                      </p>
                      {matchedBy.length > 0 ? (
                        <p className="mt-3 text-sm text-muted-foreground">
                          Correspondências por {formatQuoteApprovalAnalysisList(matchedBy)}.
                        </p>
                      ) : null}
                      {conflicts.length > 0 ? (
                        <p className="mt-1 text-sm text-warning-soft-foreground">
                          Campos conflitantes: {formatQuoteApprovalAnalysisList(conflicts)}.
                        </p>
                      ) : null}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <DialogFooter className="gap-2 border-t border-border bg-muted/15 px-5 py-4 sm:justify-start sm:space-x-0 sm:px-6">
        <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onBack}>
          <ArrowLeft aria-hidden="true" />
          Voltar às pendências
        </Button>
      </DialogFooter>
    </>
  );
}
