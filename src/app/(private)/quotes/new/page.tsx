import type { Metadata } from "next";
import { FileText } from "lucide-react";

import { QuoteCreateWizard } from "@/features/quotes/components/create/quote-create-wizard";
import { BackButton } from "@/shared/components/back-button";

export const metadata: Metadata = {
  title: "Novo orçamento",
  description: "Crie um novo orçamento no Clean Move.",
};

export default function NewQuotePage() {
  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <FileText className="mt-1 size-10 shrink-0 text-primary" strokeWidth={1.8} />

          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Novo <span className="text-primary">orçamento</span>
            </h1>
            <p className="max-w-2xl text-sm font-medium text-muted-foreground sm:text-base">
              Preencha os primeiros dados do cliente e veículo para iniciar a proposta.
            </p>
          </div>
        </div>

        <BackButton href="/quotes" className="h-10 w-full sm:w-auto" />
      </header>

      <QuoteCreateWizard />
    </section>
  );
}
