import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm, FormProvider, type FieldValues } from "react-hook-form";
import { Mail, User } from "lucide-react";
import { describe, expect, it } from "vitest";
import type { ReactNode } from "react";

import { RegisterTextField } from "./register-text-field";

function FormWrapper({
  children,
  defaultValues = {},
}: {
  children: ReactNode;
  defaultValues?: FieldValues;
}) {
  const methods = useForm({ defaultValues });
  return (
    <FormProvider {...methods}>
      <form>{children}</form>
    </FormProvider>
  );
}

describe("RegisterTextField", () => {
  it("should render with label, left icon and id derived from name", () => {
    render(
      <FormWrapper>
        <RegisterTextField name="email" label="E-mail" icon={Mail} placeholder="seu@email.com" />
      </FormWrapper>,
    );

    const input = screen.getByLabelText("E-mail");
    expect(input).toHaveAttribute("placeholder", "seu@email.com");
    expect(input.className).toContain("pl-12");
  });

  it("should let the user type and update the input value", async () => {
    const user = userEvent.setup();
    render(
      <FormWrapper>
        <RegisterTextField name="fullName" label="Nome" icon={User} />
      </FormWrapper>,
    );

    const input = screen.getByLabelText("Nome") as HTMLInputElement;
    await user.type(input, "João");
    expect(input.value).toBe("João");
  });

  it("should apply the mask when 'mask' is provided", async () => {
    const user = userEvent.setup();
    render(
      <FormWrapper>
        <RegisterTextField name="phone" label="Telefone" mask="(__) _____-____" inputMode="tel" />
      </FormWrapper>,
    );

    const input = screen.getByLabelText("Telefone") as HTMLInputElement;
    await user.type(input, "11999991234");
    expect(input.value).toBe("(11) 99999-1234");
  });

  it("should accept a custom node in 'image' rendered on the right slot", () => {
    render(
      <FormWrapper>
        <RegisterTextField name="cnpj" label="CNPJ" image={<span data-testid="loading-icon" />} />
      </FormWrapper>,
    );

    expect(screen.getByTestId("loading-icon")).toBeInTheDocument();
  });
});
