"use client";

import { useState } from "react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getQuoteApprovalVerificationOutcome } from "../../lib/quote-approval-analysis-feedback";
import type { QuoteListItemDto } from "../../types/quotes";
import { useAnalyzeQuoteApproval } from "../../hooks/mutations/use-analyze-quote-approval";
import { QuoteApprovalVerificationStep } from "../analyze/quote-approval-verification-step";
import {
  QuoteApprovalScheduleStep,
  type QuoteApprovalScheduleValues,
} from "./quote-approval-schedule-step";

type QuoteApprovalFlowStep = "schedule" | "analysis";

type QuoteApprovalFlowDialogProps = {
  quote: QuoteListItemDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function QuoteApprovalFlowDialog({
  quote,
  open,
  onOpenChange,
}: QuoteApprovalFlowDialogProps) {
  const [step, setStep] = useState<QuoteApprovalFlowStep>("schedule");
  const [dialogContentElement, setDialogContentElement] = useState<HTMLDivElement | null>(null);
  const {
    mutate: analyzeQuoteApproval,
    data: analyzeQuoteApprovalResult,
    isPending: analyzingQuoteApproval,
    reset: resetAnalyzeQuoteApproval,
  } = useAnalyzeQuoteApproval();
  const analysis = analyzeQuoteApprovalResult?.analysis ?? null;
  const outcome = getQuoteApprovalVerificationOutcome(analyzingQuoteApproval, analysis);
  const isChecking = step === "analysis" && outcome === "checking";

  function closeFlow() {
    setStep("schedule");
    resetAnalyzeQuoteApproval();
    onOpenChange(false);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (isChecking && !nextOpen) return;

    if (!nextOpen) {
      closeFlow();
      return;
    }

    onOpenChange(nextOpen);
  }

  function handleScheduleContinue(values: QuoteApprovalScheduleValues) {
    setStep("analysis");
    resetAnalyzeQuoteApproval();
    analyzeQuoteApproval(
      {
        quoteId: quote.id,
        startsAt: values.startsAt,
        endsAt: values.endsAt,
      },
      {
        onError: closeFlow,
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        ref={setDialogContentElement}
        className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] gap-0 overflow-y-auto rounded-xl border-border p-0 shadow-xl motion-reduce:animate-none sm:max-w-xl"
        showCloseButton={!isChecking}
        onEscapeKeyDown={(event) => {
          if (isChecking) event.preventDefault();
        }}
        onPointerDownOutside={(event) => {
          if (isChecking) event.preventDefault();
        }}
      >
        {step === "schedule" ? (
          <QuoteApprovalScheduleStep
            quote={quote}
            onCancel={closeFlow}
            onContinue={handleScheduleContinue}
            portalContainer={dialogContentElement}
          />
        ) : (
          <QuoteApprovalVerificationStep
            quote={quote}
            analysis={analysis}
            isAnalyzing={analyzingQuoteApproval}
            onClose={closeFlow}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
