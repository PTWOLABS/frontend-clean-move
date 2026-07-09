"use client";

import { useState } from "react";

import { Form } from "@/shared/forms/form";
import { cn } from "@/shared/utils/cn";

import {
  createQuoteFormDefaultValues,
  createQuoteFormSchema,
} from "../../../schemas/create-quote-schema";
import type { CreateQuoteFormValues } from "../../../types/create-quote";
import { useCreateQuote } from "../../../hooks/mutations/use-create-quote";
import { QuoteCreateWizardContent } from "./quote-create-wizard-content";
import { QUOTE_CREATE_FORM_ID, TOTAL_STEPS } from "../../../constants/quote-wizard";

type QuoteCreateWizardProps = {
  className?: string;
  contentClassName?: string;
  mobileSummaryClassName?: string;
  summaryPanelClassName?: string;
};

export function QuoteCreateWizard({
  className,
  contentClassName,
  mobileSummaryClassName,
  summaryPanelClassName,
}: QuoteCreateWizardProps) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const createQuoteMutation = useCreateQuote();
  const formLayoutClassName =
    className ??
    "xl:grid-cols-[minmax(0,1fr)_minmax(21rem,25rem)] xl:items-start xl:gap-10 2xl:grid-cols-[minmax(0,1fr)_27rem]";

  async function handleSubmit(values: CreateQuoteFormValues) {
    await createQuoteMutation.mutateAsync(values);

    setCompletedSteps((steps) => (steps.includes(TOTAL_STEPS) ? steps : [...steps, TOTAL_STEPS]));
  }

  function handleStepComplete(step: number) {
    setCompletedSteps((steps) => (steps.includes(step) ? steps : [...steps, step]));
  }

  function handleStepClear(step: number) {
    setCompletedSteps((steps) => steps.filter((completedStep) => completedStep !== step));
  }

  return (
    <Form<CreateQuoteFormValues>
      id={QUOTE_CREATE_FORM_ID}
      schema={createQuoteFormSchema}
      options={{
        defaultValues: createQuoteFormDefaultValues,
        mode: "onBlur",
        reValidateMode: "onChange",
      }}
      onSubmit={handleSubmit}
      className={cn("grid gap-8", formLayoutClassName)}
    >
      <QuoteCreateWizardContent
        completedSteps={completedSteps}
        contentClassName={contentClassName}
        mobileSummaryClassName={mobileSummaryClassName}
        onClearStep={handleStepClear}
        onStepComplete={handleStepComplete}
        summaryPanelClassName={summaryPanelClassName}
      />
    </Form>
  );
}
