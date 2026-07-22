"use client";

import { useState } from "react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getQuoteApprovalVerificationOutcome } from "../../lib/quote-approval-analysis-feedback";
import type { QuoteListItemDto } from "../../types/quotes";
import { useAnalyzeQuoteApproval } from "../../hooks/mutations/use-analyze-quote-approval";
import { useApproveQuote } from "../../hooks/mutations/use-approve-quote";
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
  const [scheduleValues, setScheduleValues] = useState<QuoteApprovalScheduleValues | null>(null);
  const [dialogContentElement, setDialogContentElement] = useState<HTMLDivElement | null>(null);
  const {
    mutate: analyzeQuoteApproval,
    data: analyzeQuoteApprovalResult,
    isPending: analyzingQuoteApproval,
    reset: resetAnalyzeQuoteApproval,
  } = useAnalyzeQuoteApproval();
  const {
    mutate: approveQuote,
    isPending: approvingQuote,
    reset: resetApproveQuote,
  } = useApproveQuote();
  const analysis = analyzeQuoteApprovalResult?.analysis ?? null;
  const outcome = getQuoteApprovalVerificationOutcome(analyzingQuoteApproval, analysis);
  const isChecking = step === "analysis" && outcome === "checking";
  const isSubmitting = isChecking || approvingQuote;

  function closeFlow() {
    setStep("schedule");
    setScheduleValues(null);
    resetAnalyzeQuoteApproval();
    resetApproveQuote();
    onOpenChange(false);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (isSubmitting && !nextOpen) return;

    if (!nextOpen) {
      closeFlow();
      return;
    }

    onOpenChange(nextOpen);
  }

  function handleScheduleContinue(values: QuoteApprovalScheduleValues) {
    setStep("analysis");
    setScheduleValues(values);
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

  function handleApprove() {
    if (!scheduleValues) return;

    approveQuote(
      {
        quoteId: quote.id,
        startsAt: scheduleValues.startsAt,
        endsAt: scheduleValues.endsAt,
      },
      {
        onSuccess: closeFlow,
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        ref={setDialogContentElement}
        className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] gap-0 overflow-y-auto rounded-xl border-border p-0 shadow-xl motion-reduce:animate-none sm:max-w-xl"
        showCloseButton={!isSubmitting}
        onEscapeKeyDown={(event) => {
          if (isSubmitting) event.preventDefault();
        }}
        onPointerDownOutside={(event) => {
          if (isSubmitting) event.preventDefault();
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
            isApproving={approvingQuote}
            onApprove={handleApprove}
            onClose={closeFlow}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
