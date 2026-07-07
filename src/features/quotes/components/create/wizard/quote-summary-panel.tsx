import type { LucideIcon } from "lucide-react";
import { CheckCircle2, ClipboardList, CreditCard, FileText } from "lucide-react";

import {
  WizardProgressBadge,
  WizardSummaryList,
  type WizardSummaryItem,
} from "@/shared/components/wizard-summary-list";
import { cn } from "@/shared/utils/cn";

type QuoteSummaryPanelProps = {
  currentStep: number;
  totalSteps: number;
  items: WizardSummaryItem[];
  hasCompletedStep: boolean;
  className?: string;
};

export function QuoteSummaryPanel({
  currentStep,
  totalSteps,
  items,
  hasCompletedStep,
  className,
}: QuoteSummaryPanelProps) {
  const progress = Math.round((currentStep / totalSteps) * 100);

  return (
    <aside
      className={cn(
        "overflow-hidden rounded-2xl border border-border/70 bg-card/70 p-5 shadow-sm",
        "backdrop-blur supports-[backdrop-filter]:bg-card/60",
        className,
      )}
      aria-label="Resumo do orçamento"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ClipboardList aria-hidden className="size-6" />
          </div>

          <div className="min-w-0">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              Resumo do orçamento
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Acompanhe os dados preenchidos em cada etapa do orçamento.
            </p>
          </div>
        </div>

        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {currentStep}/{totalSteps}
        </span>
      </div>

      <WizardSummaryList items={items} className="mt-6" />

      <section className="mt-6" aria-labelledby="quote-next-steps-title">
        <h3 id="quote-next-steps-title" className="text-sm font-semibold text-foreground">
          Próximas etapas
        </h3>

        <div className="mt-4 space-y-3">
          <QuoteValueRow
            icon={FileText}
            title="Adicionar serviços"
            description="Inclua os itens, valores e cortesias combinadas com o cliente."
          />
          <QuoteValueRow
            icon={CreditCard}
            title="Definir pagamento"
            description="Informe formas aceitas, parcelas e descontos quando houver."
          />
          <QuoteValueRow
            icon={CheckCircle2}
            title="Conferir antes de enviar"
            description="O resumo final reunirá cliente, veículo, serviços e pagamento."
          />
        </div>
      </section>

      <div className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-border/70 bg-background/50 p-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CheckCircle2 aria-hidden className="size-5" />
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground">
              {hasCompletedStep ? "Etapa salva" : "Etapa em andamento"}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {hasCompletedStep
                ? "Dados validados para continuar."
                : "Preencha e valide esta etapa para avançar."}
            </p>
          </div>
        </div>

        <WizardProgressBadge progress={progress} />
      </div>
    </aside>
  );
}

function QuoteValueRow({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon aria-hidden className="size-4" />
      </div>

      <div className="min-w-0">
        <h4 className="text-sm font-semibold leading-snug text-foreground">{title}</h4>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
