"use client";

import { ArrowLeft, CheckCircle2, IdCard, Mail, Phone, UserRoundCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  QUOTE_CUSTOMER_DIVERGENT_FIELD_LABELS,
  QUOTE_CUSTOMER_MATCHED_BY_LABELS,
} from "../../constants/quote-approval-analysis-labels";
import { formatQuoteApprovalAnalysisCount } from "../../lib/quote-approval-analysis-feedback";
import type { QuoteCustomerCandidateDto } from "../../types/analyze-quote-approval";

type QuoteApprovalCustomerCandidateStepProps = {
  candidates: QuoteCustomerCandidateDto[];
  selectedCustomerId?: string;
  onSelect: (customerId: string) => void;
  onBack: () => void;
};

const CUSTOMER_DETAIL_ITEMS = [
  {
    key: "phone",
    label: "Telefone",
    icon: Phone,
  },
  {
    key: "email",
    label: "E-mail",
    icon: Mail,
  },
  {
    key: "cpfCnpj",
    label: "CPF/CNPJ",
    icon: IdCard,
  },
] satisfies Array<{
  key: keyof Pick<QuoteCustomerCandidateDto, "phone" | "email" | "cpfCnpj">;
  label: string;
  icon: typeof Phone;
}>;

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
          {candidates.map((candidate) => {
            const matchedBy = candidate.matchedBy.map(
              (matchedByItem) => QUOTE_CUSTOMER_MATCHED_BY_LABELS[matchedByItem],
            );
            const divergentFields = candidate.conflictingFields.map(
              (field) => QUOTE_CUSTOMER_DIVERGENT_FIELD_LABELS[field],
            );
            const visibleDetails = CUSTOMER_DETAIL_ITEMS.map((item) => ({
              ...item,
              value: candidate[item.key],
            })).filter((item) => item.value);
            const isSelected = candidate.customerId === selectedCustomerId;

            return (
              <li key={candidate.customerId}>
                <button
                  type="button"
                  className="group w-full rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-muted/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[selected=true]:border-primary data-[selected=true]:bg-primary/5"
                  data-selected={isSelected}
                  aria-pressed={isSelected}
                  aria-label={`Selecionar cliente ${candidate.name}`}
                  onClick={() => onSelect(candidate.customerId)}
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/30 text-muted-foreground transition-colors group-hover:border-primary/30 group-hover:text-primary group-data-[selected=true]:border-primary/30 group-data-[selected=true]:bg-primary/10 group-data-[selected=true]:text-primary">
                      {isSelected ? (
                        <CheckCircle2 className="size-4" aria-hidden="true" />
                      ) : (
                        <UserRoundCheck className="size-4" aria-hidden="true" />
                      )}
                    </span>

                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {candidate.name}
                          </p>
                          {visibleDetails.length === 0 ? (
                            <p className="mt-1 text-xs text-muted-foreground">
                              Sem dados de contato disponíveis.
                            </p>
                          ) : null}
                        </div>

                        <div className="flex flex-wrap justify-end gap-1.5">
                          {isSelected ? <Badge className="text-[11px]">Selecionado</Badge> : null}
                          {candidate.advisoryOnly ? (
                            <Badge variant="outline" className="bg-background text-[11px]">
                              Apenas alerta
                            </Badge>
                          ) : null}
                        </div>
                      </div>

                      {visibleDetails.length > 0 ? (
                        <dl className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
                          {visibleDetails.map((detail) => (
                            <div key={detail.key} className="flex min-w-0 items-center gap-2">
                              <detail.icon
                                className="size-3.5 shrink-0 text-muted-foreground"
                                aria-hidden="true"
                              />
                              <div className="min-w-0">
                                <dt className="text-[11px] font-medium text-muted-foreground">
                                  {detail.label}
                                </dt>
                                <dd className="truncate text-xs text-foreground">{detail.value}</dd>
                              </div>
                            </div>
                          ))}
                        </dl>
                      ) : null}

                      {matchedBy.length > 0 || divergentFields.length > 0 ? (
                        <div className="space-y-2 border-t border-border pt-3">
                          {matchedBy.length > 0 ? (
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="mr-1 text-xs font-medium text-muted-foreground">
                                Correspondências
                              </span>
                              {matchedBy.map((match) => (
                                <Badge
                                  key={match}
                                  variant="outline"
                                  className="bg-success-soft/40 text-[11px] text-success-soft-foreground"
                                >
                                  {match}
                                </Badge>
                              ))}
                            </div>
                          ) : null}

                          {divergentFields.length > 0 ? (
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="mr-1 text-xs font-medium text-muted-foreground">
                                Dados divergentes
                              </span>
                              {divergentFields.map((field) => (
                                <Badge
                                  key={field}
                                  variant="outline"
                                  className="bg-warning-soft/50 text-[11px] text-warning-soft-foreground"
                                >
                                  {field}
                                </Badge>
                              ))}
                            </div>
                          ) : null}
                        </div>
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
