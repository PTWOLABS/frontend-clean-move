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

import { cn } from "@/shared/utils/cn";

type OnboardingSummaryItem = {
  label: string;
  value: string;
  completed: boolean;
  icon: typeof UserRound;
};

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

function getResourceLabel(label: string) {
  const emptyLabel = "não informado";

  if (label.toLocaleLowerCase("pt-BR").includes(emptyLabel)) {
    return emptyLabel;
  }

  return label;
}

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
  const summaryItems: OnboardingSummaryItem[] = [
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

      <dl className="mt-6 divide-y divide-border/60 rounded-xl border border-border/70 bg-background/40">
        {summaryItems.map((item) => (
          <SummaryRow key={item.label} item={item} />
        ))}
      </dl>

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

        <ProgressBadge progress={progress} />
      </div>
    </aside>
  );
}

function SummaryRow({ item }: { item: OnboardingSummaryItem }) {
  const Icon = item.icon;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
      <dt className="flex min-w-0 items-center gap-3 text-sm font-medium text-muted-foreground">
        <Icon aria-hidden className="size-4 shrink-0" />
        <span className="truncate">{item.label}</span>
      </dt>

      <dd className="flex min-w-0 items-center gap-2 text-right text-sm font-medium text-foreground">
        <span className="max-w-32 truncate">{item.value}</span>
        <span
          aria-hidden
          className={cn(
            "size-2.5 shrink-0 rounded-full ring-2",
            item.completed
              ? "bg-primary ring-primary/25"
              : "bg-transparent ring-muted-foreground/35",
          )}
        />
      </dd>
    </div>
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

function ProgressBadge({ progress }: { progress: number }) {
  const radius = 17;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <div
      className="relative flex size-14 shrink-0 items-center justify-center"
      aria-label={`${progress}% concluído`}
    >
      <svg aria-hidden className="absolute inset-0 size-14 -rotate-90" viewBox="0 0 44 44">
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-muted"
        />
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          className="text-primary"
        />
      </svg>
      <span className="text-xs font-bold tabular-nums text-foreground">{progress}%</span>
    </div>
  );
}
