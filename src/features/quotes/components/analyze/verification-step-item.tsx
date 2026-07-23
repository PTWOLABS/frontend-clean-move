import { cn } from "@/shared/utils/cn";
import {
  QuoteApprovalVerificationStep,
  QuoteApprovalVerificationStepStatus,
} from "../../types/quote-approval-analysis-feedback";
import { AlertTriangle, Check, LoaderCircle } from "lucide-react";

function getStatusLabel(status: QuoteApprovalVerificationStepStatus) {
  const labels: Record<QuoteApprovalVerificationStepStatus, string> = {
    pending: "Aguardando",
    running: "Analisando...",
    complete: "Concluído",
    attention: "Requer atenção",
  };

  return labels[status];
}

export function VerificationStepItem({
  step,
  isLast,
}: {
  step: QuoteApprovalVerificationStep;
  isLast: boolean;
}) {
  const StepIcon = step.icon;
  const isComplete = step.status === "complete";
  const isRunning = step.status === "running";
  const needsAttention = step.status === "attention";

  return (
    <li className="relative grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 pb-5 last:pb-0">
      <div className="relative flex justify-center">
        {!isLast ? (
          <span
            className="absolute -bottom-1 top-10 w-px overflow-hidden bg-border"
            aria-hidden="true"
          >
            <span
              className={cn(
                "block h-full w-full origin-top bg-success transition-transform duration-300 ease-out motion-reduce:transition-none",
                isComplete ? "scale-y-100" : "scale-y-0",
              )}
            />
          </span>
        ) : null}

        <span
          className={cn(
            "relative z-10 flex size-10 items-center justify-center rounded-full border bg-background transition-colors duration-300 motion-reduce:transition-none",
            isComplete && "border-success bg-success-soft text-success-soft-foreground",
            isRunning &&
              "border-primary bg-primary/10 text-primary ring-4 ring-primary/10 motion-safe:animate-pulse",
            needsAttention &&
              "border-warning bg-warning-soft text-warning-soft-foreground ring-4 ring-warning/10",
            step.status === "pending" && "border-border text-muted-foreground",
          )}
        >
          {isComplete ? (
            <Check className="size-4" aria-hidden="true" />
          ) : isRunning ? (
            <LoaderCircle
              className="size-4 animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
          ) : needsAttention ? (
            <AlertTriangle className="size-4" aria-hidden="true" />
          ) : (
            <StepIcon className="size-4" aria-hidden="true" />
          )}
        </span>
      </div>

      <div
        className={cn(
          "min-w-0 rounded-lg border px-3.5 py-3 transition-colors duration-300 motion-reduce:transition-none",
          isRunning && "border-primary/25 bg-primary/5",
          needsAttention && "border-warning/35 bg-warning-soft/45",
          !isRunning && !needsAttention && "border-transparent",
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
          <p className="text-sm font-semibold text-foreground">{step.label}</p>
          <span
            className={cn(
              "text-xs font-medium",
              isComplete && "text-success-soft-foreground",
              isRunning && "text-primary",
              needsAttention && "text-warning-soft-foreground",
              step.status === "pending" && "text-muted-foreground",
            )}
          >
            {getStatusLabel(step.status)}
          </span>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.description}</p>
      </div>
    </li>
  );
}
