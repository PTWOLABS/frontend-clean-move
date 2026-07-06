"use client";

import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import { WizardProgress } from "@/shared/components/wizard-progress";

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
  const {
    control,
    resetField,
    formState: { isSubmitting },
    trigger,
  } = useFormContext<CreateQuoteFormInput>();
  const stepOne = useWatch({ control, name: "stepOne" });
  const stepTwo = useWatch({ control, name: "stepTwo" });
  const summaryItems = useQuoteSummaryItems(stepOne, stepTwo);
  const hasCompletedStep = completedSteps.includes(currentStep);
  const isLastStep = currentStep === TOTAL_STEPS;

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
            isLastStep={isLastStep}
            isSubmitting={isSubmitting}
            onBack={handleBack}
            onClearStep={handleClearStep}
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
    </>
  );
}
