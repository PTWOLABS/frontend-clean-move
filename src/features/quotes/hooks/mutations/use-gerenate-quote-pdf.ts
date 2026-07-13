"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { generateQuotePdf } from "../../api/generate-quote-pdf";
import { resolveGenerateQuotePdfErrorFeedback } from "../../lib/generate-quote-pdf-error-feedback";

function downloadQuotePdf(pdfBlob: Blob, quoteId: string) {
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `orçamento-${quoteId}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function useGenerateQuotePdf() {
  return useMutation({
    mutationFn: generateQuotePdf,
    onSuccess: (pdfBlob, quoteId) => {
      downloadQuotePdf(pdfBlob, quoteId);
      toast.success("PDF baixado com sucesso.");
    },
    onError: (error) => {
      const feedback = resolveGenerateQuotePdfErrorFeedback(error);

      toast.error(feedback.title, {
        id: feedback.id,
        description: feedback.description,
      });
    },
  });
}
