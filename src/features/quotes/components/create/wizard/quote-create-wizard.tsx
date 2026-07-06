"use client";

import { useState } from "react";

import { Form } from "@/shared/forms/form";

import {
  createQuoteFormDefaultValues,
  createQuoteFormSchema,
} from "../../../schemas/create-quote-schema";
import type { CreateQuoteFormInput } from "../../../types/create-quote";
import { QuoteCreateWizardContent } from "./quote-create-wizard-content";
import { TOTAL_STEPS } from "../../../constants/quote-wizard";

export function QuoteCreateWizard() {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  function handleSubmit() {
    setCompletedSteps((steps) => (steps.includes(TOTAL_STEPS) ? steps : [...steps, TOTAL_STEPS]));
  }

  function handleStepComplete(step: number) {
    setCompletedSteps((steps) => (steps.includes(step) ? steps : [...steps, step]));
  }

  function handleStepClear(step: number) {
    setCompletedSteps((steps) => steps.filter((completedStep) => completedStep !== step));
  }

  return (
    <Form<CreateQuoteFormInput>
      schema={createQuoteFormSchema}
      options={{
        defaultValues: createQuoteFormDefaultValues,
        mode: "onBlur",
        reValidateMode: "onChange",
      }}
      onSubmit={handleSubmit}
      className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(21rem,25rem)] xl:items-start xl:gap-10 2xl:grid-cols-[minmax(0,1fr)_27rem]"
    >
      <QuoteCreateWizardContent
        completedSteps={completedSteps}
        onClearStep={handleStepClear}
        onStepComplete={handleStepComplete}
      />
    </Form>
  );
}
