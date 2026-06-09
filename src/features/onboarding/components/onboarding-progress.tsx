import { Progress } from "@/components/ui/progress";
import { cn } from "@/shared/utils/cn";

type OnboardingProgressProps = {
  currentStep: number;
  totalSteps: number;
  className?: string;
};

export function OnboardingProgress({
  currentStep,
  totalSteps,
  className,
}: OnboardingProgressProps) {
  const progress = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className={cn("w-full space-y-2", className)}>
      <div className="flex items-center gap-4">
        <span className="shrink-0 text-sm font-semibold text-primary">
          Etapa {currentStep} de {totalSteps}
        </span>

        <Progress value={progress} className="h-2 flex-1" />

        <span className="shrink-0 text-sm font-semibold text-primary">{progress}%</span>
      </div>
    </div>
  );
}
