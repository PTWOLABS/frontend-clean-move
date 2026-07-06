import { ArrowLeft, CheckCircle2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type QuoteWizardActionsProps = {
  currentStep: number;
  hasCompletedStep: boolean;
  isClearStepDisabled: boolean;
  isLastStep: boolean;
  isSubmitting: boolean;
  onBack: () => void;
  onClearStep: () => void;
  onNextStep: () => void;
};

export function QuoteWizardActions({
  currentStep,
  hasCompletedStep,
  isClearStepDisabled,
  isLastStep,
  isSubmitting,
  onBack,
  onClearStep,
  onNextStep,
}: QuoteWizardActionsProps) {
  const actionLabel = getActionLabel({
    currentStep,
    hasCompletedStep,
    isLastStep,
  });

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
        <Button
          type="button"
          variant="outline"
          onClick={onClearStep}
          disabled={isSubmitting || isClearStepDisabled}
          className="border-destructive/20 text-destructive/90 hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 aria-hidden className="size-4" />
          Limpar etapa
        </Button>

        {currentStep > 1 && (
          <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
            <ArrowLeft aria-hidden className="size-4" />
            Voltar
          </Button>
        )}
      </div>

      <Button
        type={isLastStep ? "submit" : "button"}
        onClick={isLastStep ? undefined : onNextStep}
        disabled={isSubmitting}
        className="sm:min-w-44"
      >
        {actionLabel}
        <CheckCircle2 aria-hidden className="size-4" />
      </Button>
    </div>
  );
}

function getActionLabel({
  currentStep,
  hasCompletedStep,
  isLastStep,
}: {
  currentStep: number;
  hasCompletedStep: boolean;
  isLastStep: boolean;
}) {
  if (isLastStep) return hasCompletedStep ? "Etapa salva" : "Salvar pagamento";
  if (currentStep === 1) return "Continuar para serviços";

  return "Continuar para pagamento";
}
