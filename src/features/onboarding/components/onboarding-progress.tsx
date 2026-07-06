import { WizardProgress } from "@/shared/components/wizard-progress";

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
  return <WizardProgress currentStep={currentStep} totalSteps={totalSteps} className={className} />;
}
