import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { resolveAnalyzeQuoteApprovalErrorFeedback } from "../../lib/analyze-quote-approval-error-feedback";
import { AnalyzeQuoteApprovalBody } from "../../types/analyze-quote-approval";
import { analyzeQuoteApproval } from "../../api/analyze-quote-approval";

type UseAnalyzeQuoteApprovalParams = {
  quoteId: string;
} & AnalyzeQuoteApprovalBody;

export function useAnalyzeQuoteApproval() {
  return useMutation({
    mutationFn: async (values: UseAnalyzeQuoteApprovalParams) =>
      analyzeQuoteApproval(values.quoteId, { startsAt: values.startsAt, endsAt: values.endsAt }),
    onError: (error) => {
      const feedback = resolveAnalyzeQuoteApprovalErrorFeedback(error);

      toast.error(feedback.title, {
        id: feedback.id,
        description: feedback.description,
      });
    },
  });
}
