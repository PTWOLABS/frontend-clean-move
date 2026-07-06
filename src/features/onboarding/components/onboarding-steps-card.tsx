import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  UserRound,
  Wrench,
  Workflow,
  CarFront,
} from "lucide-react";

import {
  getWizardSummaryValue,
  WizardProgressBadge,
  WizardSummaryList,
  type WizardSummaryItem,
} from "@/shared/components/wizard-summary-list";
import { cn } from "@/shared/utils/cn";

type OnboardingValueItem = {
  title: string;
  description: string;
  icon: typeof UserRound;
};

type OnboardingStepsCardProps = {
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

const valueItems: OnboardingValueItem[] = [
  {
    title: "Visualizar sua agenda com um exemplo real",
    description: "Veja como o serviço aparecerá na agenda.",
    icon: UserRound,
  },
  {
    title: "Criar seu primeiro agendamento",
    description: "Cadastre um agendamento e veja como tudo se conecta.",
    icon: Clock3,
  },
  {
    title: "Entender o fluxo operacional",
    description: "Conheça na prática o fluxo de trabalho da plataforma.",
    icon: Workflow,
  },
];

export function OnboardingStepsCard({
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
}: OnboardingStepsCardProps) {
  const progress = Math.round((currentStep / totalSteps) * 100);
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
    <aside
      className={cn(
        "overflow-hidden rounded-2xl border border-border/70 bg-card/70 p-5 shadow-sm",
        "backdrop-blur supports-[backdrop-filter]:bg-card/60",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ClipboardList aria-hidden className="size-6" />
          </div>

          <div className="min-w-0">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              Resumo da etapa
            </h2>

            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Confira os detalhes do seu primeiro agendamento.
            </p>
          </div>
        </div>

        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {currentStep}/{totalSteps}
        </span>
      </div>

      <WizardSummaryList items={summaryItems} className="mt-6" />

      <section className="mt-6" aria-labelledby="onboarding-value-title">
        <h3 id="onboarding-value-title" className="text-sm font-semibold text-foreground">
          Por que preencher agora?
        </h3>

        <div className="mt-4 space-y-3">
          {valueItems.map((item) => (
            <ValueRow key={item.title} item={item} />
          ))}
        </div>
      </section>

      <div className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-border/70 bg-background/50 p-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 aria-hidden className="size-5" />
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground">Configuração quase concluída</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Falta pouco para você começar a operar.
            </p>
          </div>
        </div>

        <WizardProgressBadge progress={progress} />
      </div>
    </aside>
  );
}

function ValueRow({ item }: { item: OnboardingValueItem }) {
  const Icon = item.icon;

  return (
    <div className="flex gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon aria-hidden className="size-4" />
      </div>

      <div className="min-w-0">
        <h4 className="text-sm font-semibold leading-snug text-foreground">{item.title}</h4>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
      </div>
    </div>
  );
}
