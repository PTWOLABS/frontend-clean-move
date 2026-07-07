"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/shared/api/httpClient";

import { generateQuotePdf } from "../../api/generate-quote-pdf";

function downloadQuotePdf(pdfBlob: Blob, quoteId: string) {
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `orcamento-${quoteId}.pdf`;
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
      const defaultErrorMessage = "Não foi possível gerar o PDF. Tente novamente mais tarde.";

      if (error instanceof ApiError) {
        switch (error.statusCode) {
          case 400:
            toast.error("Orçamento inválido.");
          case 401:
            toast.error("Sessão inválida");
          case 403:
            toast.error("Você não tem permissão para gerar o pdf desse orçamento.");
          case 404:
            toast.error("Orçamento não encontrado.");
          case 500:
            toast.error(defaultErrorMessage);
        }
      }

      toast.error(defaultErrorMessage);
    },
  });
}
