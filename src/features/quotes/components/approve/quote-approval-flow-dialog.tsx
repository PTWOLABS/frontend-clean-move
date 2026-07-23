"use client";

import { useState } from "react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getQuoteApprovalVerificationOutcome } from "../../lib/quote-approval-analysis-feedback";
import type { QuoteListItemDto } from "../../types/quotes";
import { useAnalyzeQuoteApproval } from "../../hooks/mutations/use-analyze-quote-approval";
import { useApproveQuote } from "../../hooks/mutations/use-approve-quote";
import {
  applyQuoteApprovalResolutionSelection,
  createEmptyQuoteApprovalResolutionValues,
  CUSTOMER_LINK_EXISTING_PENDING_SELECTION_ID,
  type QuoteApprovalResolutionValues,
} from "../../lib/quote-approval-resolution-helpers";
import { QuoteApprovalVerificationStep } from "../analyze/quote-approval-verification-step";
import { QuoteApprovalCustomerCandidateStep } from "./quote-approval-customer-candidate-step";
import { QuoteApprovalResolutionStep } from "./quote-approval-resolution-step";
import {
  QuoteApprovalScheduleStep,
  type QuoteApprovalScheduleValues,
} from "./quote-approval-schedule-step";

type QuoteApprovalFlowStep = "schedule" | "analysis" | "resolution" | "customer-candidate";

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
  const [resolutionValues, setResolutionValues] = useState(
    createEmptyQuoteApprovalResolutionValues,
  );
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
    setResolutionValues(createEmptyQuoteApprovalResolutionValues());
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
    setResolutionValues(createEmptyQuoteApprovalResolutionValues());
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
        customerResolution: resolutionValues.customerResolution,
        vehicleResolution: resolutionValues.vehicleResolution,
        serviceResolutions: resolutionValues.serviceResolutions,
      },
      {
        onSuccess: closeFlow,
      },
    );
  }

  function handleResolveRequired() {
    if (!analysis) return;

    setStep("resolution");
  }

  function handleResolutionChange(values: QuoteApprovalResolutionValues) {
    setResolutionValues(values);

    if (
      analysis &&
      analysis.customer.candidates.length > 1 &&
      values.pendingSelections?.some(
        (selection) => selection.id === CUSTOMER_LINK_EXISTING_PENDING_SELECTION_ID,
      )
    ) {
      setStep("customer-candidate");
    }
  }

  function handleCustomerCandidateSelect(customerId: string) {
    setResolutionValues((currentValues) =>
      applyQuoteApprovalResolutionSelection(currentValues, {
        target: "customer",
        resolution: {
          action: "LINK_EXISTING",
          customerId,
        },
      }),
    );
    setStep("resolution");
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
        ) : step === "resolution" && analysis ? (
          <QuoteApprovalResolutionStep
            analysis={analysis}
            values={resolutionValues}
            isApproving={approvingQuote}
            onChange={handleResolutionChange}
            onApprove={handleApprove}
            onBack={() => setStep("analysis")}
          />
        ) : step === "customer-candidate" && analysis ? (
          <QuoteApprovalCustomerCandidateStep
            candidates={analysis.customer.candidates}
            selectedCustomerId={
              resolutionValues.customerResolution?.action === "LINK_EXISTING"
                ? resolutionValues.customerResolution.customerId
                : undefined
            }
            onSelect={handleCustomerCandidateSelect}
            onBack={() => setStep("resolution")}
          />
        ) : (
          <QuoteApprovalVerificationStep
            quote={quote}
            analysis={analysis}
            isAnalyzing={analyzingQuoteApproval}
            isApproving={approvingQuote}
            onApprove={handleApprove}
            onResolveRequired={handleResolveRequired}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
