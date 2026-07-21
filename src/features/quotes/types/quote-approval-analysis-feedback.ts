import type { LucideIcon } from "lucide-react";

export type QuoteApprovalVerificationOutcome = "checking" | "ready" | "requires-resolution";

export type QuoteApprovalVerificationStepStatus = "pending" | "running" | "complete" | "attention";

export type QuoteApprovalVerificationStep = {
  label: string;
  description: string;
  icon: LucideIcon;
  status: QuoteApprovalVerificationStepStatus;
};

export type QuoteApprovalAnalysisIssue = {
  id: string;
  area: string;
  title: string;
  description: string;
};
