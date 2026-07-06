"use client";

import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import { AlertDialog } from "@/components/ui/alert-dialog/alert-dialog";
import { WizardProgress } from "@/shared/components/wizard-progress";
import { hasFormStepChanges } from "@/shared/forms/has-form-step-changes";

import { createQuoteFormDefaultValues } from "../../../schemas/create-quote-schema";
import type { CreateQuoteFormInput } from "../../../types/create-quote";
import { QuoteCustomerVehicleStep } from "../steps/quote-customer-vehicle-step";
import { QuoteServicesStep } from "../steps/quote-services-step";
import {
  customerVehicleStepHeader,
  servicesStepHeader,
  TOTAL_STEPS,
} from "../../../constants/quote-wizard";
import { QuoteMobileSummary } from "./quote-mobile-summary";
import { useQuoteSummaryItems } from "../../../hooks/use-quote-summary-items";
import { QuoteSummaryPanel } from "./quote-summary-panel";
import { QuoteWizardActions } from "./quote-wizard-actions";

type QuoteCreateWizardContentProps = {
  completedSteps: number[];
  onClearStep: (step: number) => void;
  onStepComplete: (step: number) => void;
};

export function QuoteCreateWizardContent({
  completedSteps,
  onClearStep,
  onStepComplete,
}: QuoteCreateWizardContentProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [stepOneVersion, setStepOneVersion] = useState(0);
  const [stepTwoVersion, setStepTwoVersion] = useState(0);
  const [openConfirmClearStepDialog, setOpenConfirmClearStepDialog] = useState(false);
  const {
    control,
    resetField,
    formState: { isSubmitting },
    trigger,
  } = useFormContext<CreateQuoteFormInput>();
  const stepOne = useWatch({
    control,
    name: "stepOne",
    defaultValue: createQuoteFormDefaultValues.stepOne,
  });
  const stepTwo = useWatch({
    control,
    name: "stepTwo",
    defaultValue: createQuoteFormDefaultValues.stepTwo,
  });
  const summaryItems = useQuoteSummaryItems(stepOne, stepTwo);
  const hasCompletedStep = completedSteps.includes(currentStep);
  const isLastStep = currentStep === TOTAL_STEPS;
  const hasCurrentStepChanges =
    currentStep === 1
      ? hasFormStepChanges(stepOne, createQuoteFormDefaultValues.stepOne)
      : hasFormStepChanges(stepTwo, createQuoteFormDefaultValues.stepTwo);

  function handleBack() {
    setCurrentStep((step) => Math.max(1, step - 1));
  }

  function handleClearStep() {
    if (currentStep === 1) {
      resetField("stepOne", {
        defaultValue: createQuoteFormDefaultValues.stepOne,
      });
      setStepOneVersion((currentVersion) => currentVersion + 1);
    } else {
      resetField("stepTwo", {
        defaultValue: createQuoteFormDefaultValues.stepTwo,
      });
      setStepTwoVersion((currentVersion) => currentVersion + 1);
    }

    onClearStep(currentStep);
    setOpenConfirmClearStepDialog(false);
  }

  function handleClearStepClick() {
    if (!hasCurrentStepChanges) return;

    setOpenConfirmClearStepDialog(true);
  }

  async function handleNextStep() {
    const isValid = await trigger("stepOne", {
      shouldFocus: true,
    });

    if (!isValid) return;

    onStepComplete(1);
    setCurrentStep(2);
  }

  return (
    <>
      <div className="space-y-8">
        <WizardProgress currentStep={currentStep} totalSteps={TOTAL_STEPS} />

        <QuoteMobileSummary
          currentStep={currentStep}
          totalSteps={TOTAL_STEPS}
          items={summaryItems}
          className="xl:hidden"
        />

        <div className="space-y-6">
          {currentStep === 1 ? (
            <QuoteCustomerVehicleStep key={stepOneVersion} {...customerVehicleStepHeader} />
          ) : (
            <QuoteServicesStep key={stepTwoVersion} {...servicesStepHeader} />
          )}

          <QuoteWizardActions
            currentStep={currentStep}
            hasCompletedStep={hasCompletedStep}
            isClearStepDisabled={!hasCurrentStepChanges}
            isLastStep={isLastStep}
            isSubmitting={isSubmitting}
            onBack={handleBack}
            onClearStep={handleClearStepClick}
            onNextStep={handleNextStep}
          />
        </div>
      </div>

      <QuoteSummaryPanel
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
        items={summaryItems}
        hasCompletedStep={hasCompletedStep}
        className="hidden xl:sticky xl:top-6 xl:block xl:self-start"
      />

      <AlertDialog
        open={openConfirmClearStepDialog}
        onOpenChange={setOpenConfirmClearStepDialog}
        title="Limpar dados desta etapa?"
        descriptionContent={
          "Os campos preenchidos nesta etapa serão apagados. As outras etapas não serão alteradas."
        }
        actionMessage="Limpar etapa"
        onConfirm={handleClearStep}
        onCancel={() => setOpenConfirmClearStepDialog(false)}
      />
    </>
  );
}
