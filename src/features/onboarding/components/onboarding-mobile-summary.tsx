import {
  CalendarDays,
  CarFront,
  ChevronDown,
  ClipboardList,
  UserRound,
  Wrench,
} from "lucide-react";

import { cn } from "@/shared/utils/cn";

type OnboardingMobileSummaryItem = {
  label: string;
  value: string;
  completed: boolean;
  icon: typeof UserRound;
};

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

function getResourceLabel(label: string) {
  const emptyLabel = "não informado";

  if (label.toLocaleLowerCase("pt-BR").includes(emptyLabel)) {
    return emptyLabel;
  }

  return label;
}

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
  const summaryItems: OnboardingMobileSummaryItem[] = [
    {
      label: "Cliente",
      value: getResourceLabel(customerName),
      completed: hasCustomer,
      icon: UserRound,
    },
    {
      label: "Serviço",
      value: getResourceLabel(serviceName),
      completed: hasService,
      icon: Wrench,
    },
    {
      label: "Veículo",
      value: getResourceLabel(vehicleName),
      completed: hasVehicle,
      icon: CarFront,
    },
    {
      label: "Período",
      value: getResourceLabel(periodLabel),
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

        <dl className="mt-3 divide-y divide-border/60 rounded-lg border border-border/70 bg-background/40">
          {summaryItems.map((item) => (
            <SummaryRow key={item.label} item={item} />
          ))}
        </dl>
      </details>
    </section>
  );
}

function SummaryRow({ item }: { item: OnboardingMobileSummaryItem }) {
  const Icon = item.icon;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 py-2.5">
      <dt className="flex min-w-0 items-center gap-2 text-xs font-medium text-muted-foreground">
        <Icon aria-hidden className="size-3.5 shrink-0" />
        <span className="truncate">{item.label}</span>
      </dt>

      <dd className="flex min-w-0 items-center gap-2 text-right text-xs font-medium text-foreground">
        <span className="max-w-28 truncate">{item.value}</span>
        <span
          aria-hidden
          className={cn(
            "size-2 shrink-0 rounded-full ring-2",
            item.completed
              ? "bg-primary ring-primary/25"
              : "bg-transparent ring-muted-foreground/35",
          )}
        />
      </dd>
    </div>
  );
}
