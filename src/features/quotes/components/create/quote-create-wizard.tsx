"use client";

import { useMemo, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import {
  CarFront,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  FileText,
  IdCard,
  Phone,
  Trash2,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form } from "@/shared/forms/form";
import { WizardProgress } from "@/shared/components/wizard-progress";
import {
  WizardProgressBadge,
  WizardSummaryList,
  type WizardSummaryItem,
} from "@/shared/components/wizard-summary-list";
import { cn } from "@/shared/utils/cn";

import {
  createQuoteFormDefaultValues,
  createQuoteFormSchema,
} from "../../schemas/create-quote-schema";
import type { CreateQuoteFormInput } from "../../types/create-quote";
import { QuoteCustomerVehicleStep } from "./quote-customer-vehicle-step";

const TOTAL_STEPS = 1;

const customerVehicleStepHeader = {
  title: "Cliente e veículo",
  description:
    "Comece o orçamento informando manualmente quem solicitou o serviço e qual veículo será atendido.",
};

export function QuoteCreateWizard() {
  const [hasCompletedStep, setHasCompletedStep] = useState(false);

  function handleSubmit() {
    setHasCompletedStep(true);
  }

  return (
    <Form<CreateQuoteFormInput>
      schema={createQuoteFormSchema}
      options={{
        defaultValues: createQuoteFormDefaultValues,
        mode: "onBlur",
        reValidateMode: "onChange",
      }}
      onSubmit={handleSubmit}
      className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(21rem,25rem)] xl:items-start xl:gap-10 2xl:grid-cols-[minmax(0,1fr)_27rem]"
    >
      <QuoteCreateWizardContent
        hasCompletedStep={hasCompletedStep}
        onClearStep={() => setHasCompletedStep(false)}
      />
    </Form>
  );
}

type QuoteCreateWizardContentProps = {
  hasCompletedStep: boolean;
  onClearStep: () => void;
};

function QuoteCreateWizardContent({
  hasCompletedStep,
  onClearStep,
}: QuoteCreateWizardContentProps) {
  const [stepVersion, setStepVersion] = useState(0);
  const {
    control,
    reset,
    formState: { isSubmitting },
  } = useFormContext<CreateQuoteFormInput>();
  const stepOne = useWatch({ control, name: "stepOne" });
  const summaryItems = useQuoteSummaryItems(stepOne);

  function handleClearStep() {
    reset(createQuoteFormDefaultValues, {
      keepErrors: false,
      keepDirty: false,
      keepTouched: false,
    });
    setStepVersion((currentVersion) => currentVersion + 1);
    onClearStep();
  }

  return (
    <>
      <div className="space-y-8">
        <WizardProgress currentStep={1} totalSteps={TOTAL_STEPS} />

        <QuoteMobileSummary
          currentStep={1}
          totalSteps={TOTAL_STEPS}
          items={summaryItems}
          className="xl:hidden"
        />

        <div className="space-y-6">
          <QuoteCustomerVehicleStep key={stepVersion} {...customerVehicleStepHeader} />

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleClearStep}
              disabled={isSubmitting}
              className="border-destructive/20 text-destructive/90 hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 aria-hidden className="size-4" />
              Limpar etapa
            </Button>

            <Button type="submit" disabled={isSubmitting} className="sm:min-w-40">
              {hasCompletedStep ? (
                <>
                  <CheckCircle2 aria-hidden className="size-4" />
                  Etapa salva
                </>
              ) : (
                <>
                  Salvar etapa
                  <CheckCircle2 aria-hidden className="size-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <QuoteSummaryPanel
        currentStep={1}
        totalSteps={TOTAL_STEPS}
        items={summaryItems}
        hasCompletedStep={hasCompletedStep}
        className="hidden xl:sticky xl:top-6 xl:block xl:self-start"
      />
    </>
  );
}

function QuoteSummaryPanel({
  currentStep,
  totalSteps,
  items,
  hasCompletedStep,
  className,
}: {
  currentStep: number;
  totalSteps: number;
  items: WizardSummaryItem[];
  hasCompletedStep: boolean;
  className?: string;
}) {
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
              Confira os dados iniciais antes de avançar para os serviços.
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
            description="Depois desta etapa, o orçamento receberá itens, valores e observações."
          />
          <QuoteValueRow
            icon={CheckCircle2}
            title="Conferir antes de enviar"
            description="Os dados do cliente e veículo ajudam a manter o orçamento claro."
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
              {hasCompletedStep ? "Etapa salva" : "Primeira etapa"}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {hasCompletedStep
                ? "Dados validados para continuar."
                : "Preencha os dados para iniciar o orçamento."}
            </p>
          </div>
        </div>

        <WizardProgressBadge progress={progress} />
      </div>
    </aside>
  );
}

function QuoteMobileSummary({
  currentStep,
  totalSteps,
  items,
  className,
}: {
  currentStep: number;
  totalSteps: number;
  items: WizardSummaryItem[];
  className?: string;
}) {
  const progress = Math.round((currentStep / totalSteps) * 100);
  const completedItemsCount = items.filter((item) => item.completed).length;

  return (
    <section
      aria-label="Resumo do orçamento"
      className={cn(
        "rounded-xl border border-border/70 bg-card/70 p-4 shadow-sm backdrop-blur",
        "supports-[backdrop-filter]:bg-card/60",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ClipboardList aria-hidden className="size-5" />
          </div>

          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-foreground">Resumo rápido</h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {completedItemsCount} de {items.length} detalhes preenchidos.
            </p>
          </div>
        </div>

        <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
          {currentStep}/{totalSteps}
        </span>
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
      </div>

      <details className="group mt-3">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg py-1 text-sm font-medium text-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
          Ver resumo
          <ChevronDown
            aria-hidden
            className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
          />
        </summary>

        <WizardSummaryList items={items} compact className="mt-3 rounded-lg" />
      </details>
    </section>
  );
}

function QuoteValueRow({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof FileText;
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

function useQuoteSummaryItems(stepOne: CreateQuoteFormInput["stepOne"] | undefined) {
  return useMemo<WizardSummaryItem[]>(() => {
    const customerName = asDisplayText(stepOne?.customer.name);
    const phone = asDisplayText(stepOne?.customer.phone);
    const email = asDisplayText(stepOne?.customer.email);
    const document = asDisplayText(stepOne?.customer.cpfCnpj);
    const selectedVehicleLabel = asDisplayText(stepOne?.vehicleLabel);
    const plate = asDisplayText(stepOne?.vehicle.plate).toLocaleUpperCase("pt-BR");
    const vehicleName =
      selectedVehicleLabel ||
      getVehicleDisplayLabel({
        brand: stepOne?.vehicle.brand,
        model: stepOne?.vehicle.model,
        plate,
      });
    const contactLabel = phone || email || "Contato não informado";

    return [
      {
        label: "Cliente",
        value: customerName || "Cliente não informado",
        completed: Boolean(customerName),
        icon: UserRound,
      },
      {
        label: "Contato",
        value: contactLabel,
        completed: Boolean(phone || email),
        icon: Phone,
      },
      {
        label: "Documento",
        value: document || "não informado",
        completed: Boolean(document),
        icon: IdCard,
      },
      {
        label: "Veículo",
        value: vehicleName,
        completed: vehicleName !== "Veículo não informado",
        icon: CarFront,
      },
    ];
  }, [stepOne]);
}

function asDisplayText(value: unknown) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function getVehicleDisplayLabel({
  brand,
  model,
  plate,
}: {
  brand?: unknown;
  model?: unknown;
  plate?: unknown;
}) {
  const vehicleName = [asDisplayText(brand), asDisplayText(model)].filter(Boolean).join(" ");
  const vehiclePlate = asDisplayText(plate);

  if (vehicleName) return vehicleName;
  if (vehiclePlate) return vehiclePlate;

  return "Veículo não informado";
}
