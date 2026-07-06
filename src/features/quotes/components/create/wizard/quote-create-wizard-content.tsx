"use client";

import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import { AlertDialog } from "@/components/ui/alert-dialog/alert-dialog";
import { WizardProgress } from "@/shared/components/wizard-progress";
import { hasFormStepChanges } from "@/shared/forms/has-form-step-changes";

import { createQuoteFormDefaultValues } from "../../../schemas/create-quote-schema";
import type { CreateQuoteFormInput } from "../../../types/create-quote";
import { QuoteCustomerVehicleStep } from "../steps/quote-customer-vehicle-step";
import { QuotePaymentStep } from "../steps/quote-payment-step";
import { QuoteServicesStep } from "../steps/quote-services-step";
import {
  customerVehicleStepHeader,
  paymentStepHeader,
  servicesStepHeader,
  TOTAL_STEPS,
} from "../../../constants/quote-wizard";
import { QuoteMobileSummary } from "./quote-mobile-summary";
import { useQuoteSummaryItems } from "../../../hooks/use-quote-summary-items";
import { QuoteCreateSummaryDialog } from "./quote-create-summary-dialog";
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
  const [stepThreeVersion, setStepThreeVersion] = useState(0);
  const [openConfirmClearStepDialog, setOpenConfirmClearStepDialog] = useState(false);
  const [openSummaryDialog, setOpenSummaryDialog] = useState(false);
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
  const stepThree = useWatch({
    control,
    name: "stepThree",
    defaultValue: createQuoteFormDefaultValues.stepThree,
  });
  const summaryItems = useQuoteSummaryItems(stepOne, stepTwo, stepThree);
  const hasCompletedStep = completedSteps.includes(currentStep);
  const isLastStep = currentStep === TOTAL_STEPS;
  const hasCurrentStepChanges =
    currentStep === 1
      ? hasFormStepChanges(stepOne, createQuoteFormDefaultValues.stepOne)
      : currentStep === 2
        ? hasFormStepChanges(stepTwo, createQuoteFormDefaultValues.stepTwo)
        : hasFormStepChanges(stepThree, createQuoteFormDefaultValues.stepThree);

  function handleBack() {
    setCurrentStep((step) => Math.max(1, step - 1));
  }

  function handleClearStep() {
    if (currentStep === 1) {
      resetField("stepOne", {
        defaultValue: createQuoteFormDefaultValues.stepOne,
      });
      setStepOneVersion((currentVersion) => currentVersion + 1);
    } else if (currentStep === 2) {
      resetField("stepTwo", {
        defaultValue: createQuoteFormDefaultValues.stepTwo,
      });
      setStepTwoVersion((currentVersion) => currentVersion + 1);
    } else {
      resetField("stepThree", {
        defaultValue: createQuoteFormDefaultValues.stepThree,
      });
      setStepThreeVersion((currentVersion) => currentVersion + 1);
    }

    onClearStep(currentStep);
    setOpenConfirmClearStepDialog(false);
  }

  function handleClearStepClick() {
    if (!hasCurrentStepChanges) return;

    setOpenConfirmClearStepDialog(true);
  }

  async function handleNextStep() {
    const stepName = getStepName(currentStep);
    const isValid = await trigger(stepName, {
      shouldFocus: true,
    });

    if (!isValid) return;

    onStepComplete(currentStep);
    setCurrentStep((step) => Math.min(TOTAL_STEPS, step + 1));
  }

  async function handleReviewQuote() {
    const isValid = await trigger(undefined, {
      shouldFocus: true,
    });

    if (!isValid) return;

    onStepComplete(TOTAL_STEPS);
    setOpenSummaryDialog(true);
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
          {currentStep === 1 && (
            <QuoteCustomerVehicleStep key={stepOneVersion} {...customerVehicleStepHeader} />
          )}

          {currentStep === 2 && <QuoteServicesStep key={stepTwoVersion} {...servicesStepHeader} />}

          {currentStep === 3 && <QuotePaymentStep key={stepThreeVersion} {...paymentStepHeader} />}

          <QuoteWizardActions
            currentStep={currentStep}
            isClearStepDisabled={!hasCurrentStepChanges}
            isLastStep={isLastStep}
            isSubmitting={isSubmitting}
            onBack={handleBack}
            onClearStep={handleClearStepClick}
            onNextStep={handleNextStep}
            onReviewQuote={handleReviewQuote}
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

      <QuoteCreateSummaryDialog
        open={openSummaryDialog}
        isSubmitting={isSubmitting}
        stepOne={stepOne}
        stepTwo={stepTwo}
        stepThree={stepThree}
        onOpenChange={setOpenSummaryDialog}
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

function getStepName(currentStep: number): "stepOne" | "stepTwo" | "stepThree" {
  if (currentStep === 1) return "stepOne";
  if (currentStep === 2) return "stepTwo";

  return "stepThree";
}
