import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm, FormProvider, type FieldValues } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import type { ReactNode } from "react";

import { StepActions } from "./step-actions";

const sampleSchema = z.object({
  name: z.string().min(2, "Informe um nome válido."),
});

type SampleValues = z.infer<typeof sampleSchema>;

function FormWrapper({
  defaultValues,
  onSubmit,
  children,
}: {
  defaultValues: FieldValues;
  onSubmit?: (data: FieldValues) => void;
  children: ReactNode;
}) {
  const methods = useForm({ defaultValues });
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit((data) => onSubmit?.(data))}>{children}</form>
    </FormProvider>
  );
}

describe("StepActions", () => {
  it("should disable the submit button when the step is invalid", () => {
    render(
      <FormWrapper defaultValues={{ name: "" }}>
        <StepActions<SampleValues> schema={sampleSchema} submitLabel="Continuar" />
      </FormWrapper>,
    );

    expect(screen.getByRole("button", { name: /continuar/i })).toBeDisabled();
  });

  it("should enable the button when the schema validates successfully", () => {
    render(
      <FormWrapper defaultValues={{ name: "Maria" }}>
        <StepActions<SampleValues> schema={sampleSchema} submitLabel="Continuar" />
      </FormWrapper>,
    );

    expect(screen.getByRole("button", { name: /continuar/i })).toBeEnabled();
  });

  it("should not render the back button when 'onback' is not provided", () => {
    render(
      <FormWrapper defaultValues={{ name: "Maria" }}>
        <StepActions<SampleValues> schema={sampleSchema} submitLabel="Continuar" />
      </FormWrapper>,
    );

    expect(screen.queryByRole("button", { name: /voltar/i })).not.toBeInTheDocument();
  });

  it("should call onback with the current form values", async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    render(
      <FormWrapper defaultValues={{ name: "Maria" }}>
        <StepActions<SampleValues> schema={sampleSchema} submitLabel="Continuar" onBack={onBack} />
      </FormWrapper>,
    );

    await user.click(screen.getByRole("button", { name: /voltar/i }));
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onBack).toHaveBeenCalledWith({ name: "Maria" });
  });

  it("should disable both buttons when 'disabled' is true", () => {
    render(
      <FormWrapper defaultValues={{ name: "Maria" }}>
        <StepActions<SampleValues>
          schema={sampleSchema}
          submitLabel="Continuar"
          disabled
          onBack={() => undefined}
        />
      </FormWrapper>,
    );

    expect(screen.getByRole("button", { name: /continuar/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /voltar/i })).toBeDisabled();
  });
});
