import type { LucideIcon } from "lucide-react";
import { Check, ClipboardCheck, Rocket } from "lucide-react";

import { cn } from "@/shared/utils/cn";

type OnboardingStepStatus = "completed" | "current" | "pending";

export type OnboardingSidebarStep = {
  id: string;
  title: string;
  description: string;
  status?: OnboardingStepStatus;
};

type OnboardingStepsCardProps = {
  title?: string;
  description?: string;
  steps: OnboardingSidebarStep[];
  currentStep: number;
  footerTitle?: string;
  footerDescription?: string;
  icon?: LucideIcon;
  footerIcon?: LucideIcon;
  className?: string;
};

export function OnboardingStepsCard({
  title = "O que você vai configurar",
  description = "Siga os passos ao lado para deixar tudo pronto.",
  steps,
  currentStep,
  footerTitle = "Em poucos minutos você estará pronto!",
  footerDescription = "Ao finalizar, você já poderá gerenciar clientes, veículos, serviços e muito mais.",
  icon: Icon = ClipboardCheck,
  footerIcon: FooterIcon = Rocket,
  className,
}: OnboardingStepsCardProps) {
  return (
    <aside
      className={cn(
        "rounded-2xl border border-border/70 bg-card/60 p-6 shadow-sm",
        "backdrop-blur supports-[backdrop-filter]:bg-card/50",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
          <Icon className="size-5" />
        </div>

        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>

          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </div>

      <ol aria-label="Etapas do onboarding" className="mt-8 space-y-0">
        {steps.map((step, index) => {
          const stepNumber = index + 1;

          const status: OnboardingStepStatus =
            step.status ??
            (stepNumber < currentStep
              ? "completed"
              : stepNumber === currentStep
                ? "current"
                : "pending");

          const isLast = index === steps.length - 1;

          return (
            <li
              key={step.id}
              aria-current={status === "current" ? "step" : undefined}
              className="relative flex gap-4"
            >
              <div className="flex flex-col items-center">
                <StepIndicator status={status} stepNumber={stepNumber} />

                {!isLast && (
                  <div
                    className={cn(
                      "my-2 h-12 w-px border-l border-dashed",
                      status === "completed" ? "border-cyan-400/50" : "border-border",
                    )}
                  />
                )}
              </div>

              <div className={cn("pb-6", isLast && "pb-0")}>
                <h3
                  className={cn(
                    "text-sm font-semibold",
                    status === "current"
                      ? "text-foreground"
                      : status === "completed"
                        ? "text-foreground/90"
                        : "text-muted-foreground",
                  )}
                >
                  {step.title}
                </h3>

                <p className="mt-1.5 max-w-[240px] text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="my-6 h-px bg-border/70" />

      <div className="flex items-start gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
          <FooterIcon className="size-5" />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground">{footerTitle}</h3>

          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {footerDescription}
          </p>
        </div>
      </div>
    </aside>
  );
}

type StepIndicatorProps = {
  status: OnboardingStepStatus;
  stepNumber: number;
};

function StepIndicator({ status, stepNumber }: StepIndicatorProps) {
  if (status === "completed") {
    return (
      <div className="flex size-8 items-center justify-center rounded-full bg-cyan-500 text-sm font-semibold text-white shadow-[0_0_24px_rgba(6,182,212,0.45)]">
        <Check className="size-4" />
      </div>
    );
  }

  if (status === "current") {
    return (
      <div className="flex size-8 items-center justify-center rounded-full bg-cyan-400 text-sm font-semibold text-white shadow-[0_0_28px_rgba(34,211,238,0.65)]">
        {stepNumber}
      </div>
    );
  }

  return (
    <div className="flex size-8 items-center justify-center rounded-full border border-border bg-muted/60 text-sm font-semibold text-muted-foreground">
      {stepNumber}
    </div>
  );
}
