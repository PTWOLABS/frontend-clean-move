"use client";

import { AlertTriangle, ArrowLeft, CheckCircle2, LoaderCircle, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/shared/utils/cn";
import { QuoteListItemDto } from "../../types/quotes";
import { QuoteApprovalAnalysisDto } from "../../types/analyze-quote-approval";
import {
  formatQuoteApprovalAnalysisCount,
  getQuoteApprovalAnalysisIssues,
  getQuoteApprovalVerificationOutcome,
  getQuoteApprovalVerificationSteps,
} from "../../lib/quote-approval-analysis-feedback";
import { VerificationStepItem } from "./verification-step-item";

type QuoteApprovalVerificationStepProps = {
  quote: QuoteListItemDto;
  analysis?: QuoteApprovalAnalysisDto | null;
  isAnalyzing: boolean;
  onClose: () => void;
};

export function QuoteApprovalVerificationStep({
  quote,
  analysis,
  isAnalyzing,
  onClose,
}: QuoteApprovalVerificationStepProps) {
  const outcome = getQuoteApprovalVerificationOutcome(isAnalyzing, analysis);
  const isChecking = outcome === "checking";
  const steps = getQuoteApprovalVerificationSteps(analysis, isAnalyzing);
  const issues = getQuoteApprovalAnalysisIssues(analysis);
  const checkedSteps = steps.filter(
    (step) => step.status === "complete" || step.status === "attention",
  ).length;
  const progressValue = isChecking ? 25 : (checkedSteps / steps.length) * 100;
  const automaticResolutionCount = analysis?.automaticResolutions.length ?? 0;

  const title =
    outcome === "ready"
      ? "Orçamento pronto para aprovação"
      : outcome === "requires-resolution"
        ? "Pendências antes da aprovação"
        : "Verificando orçamento";
  const description =
    outcome === "ready"
      ? "A análise não encontrou pendências que bloqueiem a aprovação."
      : outcome === "requires-resolution"
        ? "Resolva os pontos abaixo antes de continuar com a aprovação."
        : `Estamos analisando cliente, veículo e serviços do orçamento de ${quote.customerName}.`;

  return (
    <>
      <div className="border-b border-border bg-muted/20 px-5 py-5 sm:px-6">
        <DialogHeader className="text-left">
          <div className="mb-3 flex items-center justify-between gap-3 pr-8">
            <span
              className={cn(
                "flex size-11 items-center justify-center rounded-xl border",
                outcome === "ready" &&
                  "border-success/25 bg-success-soft text-success-soft-foreground",
                outcome === "requires-resolution" &&
                  "border-warning/30 bg-warning-soft text-warning-soft-foreground",
                isChecking && "border-primary/20 bg-primary/10 text-primary",
              )}
            >
              {outcome === "ready" ? (
                <CheckCircle2 className="size-5" aria-hidden="true" />
              ) : outcome === "requires-resolution" ? (
                <AlertTriangle className="size-5" aria-hidden="true" />
              ) : (
                <ShieldCheck className="size-5" aria-hidden="true" />
              )}
            </span>
            <Badge variant="outline" className="bg-background text-[11px] text-muted-foreground">
              Análise
            </Badge>
          </div>
          <DialogTitle className="text-xl">{title}</DialogTitle>
          <DialogDescription className="leading-relaxed">{description}</DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between gap-4 text-xs font-medium text-muted-foreground">
            <span>
              {isChecking
                ? "Análise em andamento"
                : `${checkedSteps} de ${steps.length} verificações analisadas`}
            </span>
            <span className="tabular-nums">{Math.round(progressValue)}%</span>
          </div>
          <Progress
            value={progressValue}
            className="h-1.5 bg-muted"
            aria-label="Progresso da análise de aprovação do orçamento"
          />
        </div>
      </div>

      <div className="px-5 py-5 sm:px-6">
        <p className="sr-only" role="status" aria-live="polite">
          {isChecking ? "Analisando orçamento para aprovação." : title}
        </p>

        <ol aria-label="Etapas da análise de aprovação do orçamento">
          {steps.map((step, index) => (
            <VerificationStepItem
              key={step.label}
              step={step}
              isLast={index === steps.length - 1}
            />
          ))}
        </ol>

        {outcome === "ready" ? (
          <div className="mt-5 animate-in rounded-xl border border-success/25 bg-success-soft/55 p-4 text-success-soft-foreground fade-in-0 slide-in-from-bottom-2 duration-300 motion-reduce:animate-none">
            <div className="flex gap-3">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold">Nenhuma pendência encontrada</p>
                <p className="mt-1 text-sm leading-relaxed">
                  {automaticResolutionCount > 0
                    ? `${formatQuoteApprovalAnalysisCount(
                        automaticResolutionCount,
                        "resolução automática foi aplicada",
                        "resoluções automáticas foram aplicadas",
                      )} durante a análise.`
                    : "Cliente, veículo e serviços estão consistentes com os dados atuais."}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {outcome === "requires-resolution" ? (
          <div
            className="mt-5 animate-in rounded-xl border border-warning/30 bg-warning-soft/55 p-4 text-warning-soft-foreground fade-in-0 slide-in-from-bottom-2 duration-300 motion-reduce:animate-none"
            role="alert"
          >
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-sm font-semibold">
                  {formatQuoteApprovalAnalysisCount(
                    issues.length,
                    "pendência encontrada",
                    "pendências encontradas",
                  )}
                </p>
                <ul className="mt-3 space-y-3">
                  {issues.map((issue) => (
                    <li
                      key={issue.id}
                      className="rounded-lg border border-warning/25 bg-card/60 p-3"
                    >
                      <Badge
                        variant="outline"
                        className="mb-2 bg-background text-[11px] text-warning-soft-foreground"
                      >
                        {issue.area}
                      </Badge>
                      <p className="text-sm font-semibold">{issue.title}</p>
                      <p className="mt-1 text-sm leading-relaxed">{issue.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <DialogFooter className="border-t border-border bg-muted/15 px-5 py-4 sm:px-6">
        {isChecking ? (
          <div className="flex w-full items-center justify-center gap-2 text-sm text-muted-foreground">
            <LoaderCircle
              className="size-4 animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
            Aguarde enquanto concluímos a análise
          </div>
        ) : (
          <Button type="button" onClick={onClose}>
            {outcome === "ready" ? (
              <>
                <CheckCircle2 aria-hidden="true" />
                Fechar
              </>
            ) : (
              <>
                <ArrowLeft aria-hidden="true" />
                Voltar ao orçamento
              </>
            )}
          </Button>
        )}
      </DialogFooter>
    </>
  );
}
