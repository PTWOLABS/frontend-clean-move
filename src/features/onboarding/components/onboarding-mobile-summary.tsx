import {
  CalendarDays,
  CarFront,
  ChevronDown,
  ClipboardList,
  UserRound,
  Wrench,
} from "lucide-react";

import {
  getWizardSummaryValue,
  WizardSummaryList,
  type WizardSummaryItem,
} from "@/shared/components/wizard-summary-list";
import { cn } from "@/shared/utils/cn";

type OnboardingMobileSummaryProps = {
  currentStep: number;
  totalSteps: number;
  customerName: string;
  serviceName: string;
  vehicleName: string;
  periodLabel?: string;
  hasCustomer: boolean;
  hasService: boolean;
  hasVehicle: boolean;
  hasPeriod?: boolean;
  className?: string;
};

export function OnboardingMobileSummary({
  currentStep,
  totalSteps,
  customerName,
  serviceName,
  vehicleName,
  periodLabel = "definir datas",
  hasCustomer,
  hasService,
  hasVehicle,
  hasPeriod = false,
  className,
}: OnboardingMobileSummaryProps) {
  const progress = Math.round((currentStep / totalSteps) * 100);
  const completedItemsCount = [hasCustomer, hasService, hasVehicle, hasPeriod].filter(
    Boolean,
  ).length;
  const summaryItems: WizardSummaryItem[] = [
    {
      label: "Cliente",
      value: getWizardSummaryValue(customerName),
      completed: hasCustomer,
      icon: UserRound,
    },
    {
      label: "Serviço",
      value: getWizardSummaryValue(serviceName),
      completed: hasService,
      icon: Wrench,
    },
    {
      label: "Veículo",
      value: getWizardSummaryValue(vehicleName),
      completed: hasVehicle,
      icon: CarFront,
    },
    {
      label: "Período",
      value: getWizardSummaryValue(periodLabel),
      completed: hasPeriod,
      icon: CalendarDays,
    },
  ];

  return (
    <section
      aria-label="Resumo do onboarding"
      className={cn(
        "rounded-xl border border-border/70 bg-card/70 p-4 shadow-sm backdrop-blur",
        "supports-[backdrop-filter]:bg-card/60 xl:hidden",
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
              {completedItemsCount} de 4 detalhes preenchidos.
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

        <WizardSummaryList items={summaryItems} compact className="mt-3 rounded-lg" />
      </details>
    </section>
  );
}
