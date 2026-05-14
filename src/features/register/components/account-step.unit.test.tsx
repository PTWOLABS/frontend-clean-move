import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Form } from "@/shared/forms/form";
import { renderWithProviders } from "@/test/test-utils";

import { accountStepSchema, type AccountStepValues } from "../schemas/register-schema";

type MockGoogleSignInButtonProps = {
  label: string;
  isLoading?: boolean;
  onCredential: (credential: string) => void;
};

const googleLoginMock = vi.hoisted(() => vi.fn());

vi.mock("@/features/auth/hooks/use-google-login", () => ({
  useGoogleLogin: () => ({
    mutate: googleLoginMock,
    isPending: false,
  }),
}));

vi.mock("@/components/google-signin-button", () => ({
  GoogleSignInButton: ({ label, isLoading, onCredential }: MockGoogleSignInButtonProps) => (
    <button
      type="button"
      disabled={isLoading}
      onClick={() => onCredential("test-google-credential")}
    >
      {label}
    </button>
  ),
}));

import { AccountStep } from "./account-step";

const defaultValues: AccountStepValues = {
  fullName: "",
  phone: "",
  email: "",
  password: "",
};

function renderAccountStep(onSubmit = vi.fn()) {
  renderWithProviders(
    <Form<AccountStepValues>
      onSubmit={onSubmit}
      schema={accountStepSchema}
      options={{ mode: "onBlur", reValidateMode: "onChange", defaultValues }}
    >
      <AccountStep />
    </Form>,
  );

  return onSubmit;
}

describe("AccountStep", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_CLIENT_ID", "test-google-client-id");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("should render all the account step fields", async () => {
    renderAccountStep();

    expect(screen.getByLabelText("Nome completo")).toBeInTheDocument();
    expect(screen.getByLabelText("Telefone")).toBeInTheDocument();
    expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
    expect(screen.getByLabelText("Senha")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /continuar com google/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^continuar$/i })).toBeDisabled();
    });
  });

  it("should trigger google login when google button receives a credential", async () => {
    const user = userEvent.setup();

    renderAccountStep();

    await user.click(screen.getByRole("button", { name: /continuar com google/i }));

    expect(googleLoginMock).toHaveBeenCalledTimes(1);
    expect(googleLoginMock).toHaveBeenCalledWith({
      idToken: "test-google-credential",
    });
  });

  it("should toggle the password visibility", async () => {
    const user = userEvent.setup();

    renderAccountStep();

    const password = screen.getByLabelText("Senha") as HTMLInputElement;

    expect(password).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: /exibir senha/i }));

    expect(password).toHaveAttribute("type", "text");

    await user.click(screen.getByRole("button", { name: /ocultar senha/i }));

    expect(password).toHaveAttribute("type", "password");
  });

  it("should enable continue and submit the data when the step is valid", async () => {
    const user = userEvent.setup();
    const onSubmit = renderAccountStep();

    await user.type(screen.getByLabelText("Nome completo"), "João da Silva");
    await user.type(screen.getByLabelText("Telefone"), "11999991234");
    await user.type(screen.getByLabelText("E-mail"), "joao@email.com");
    await user.type(screen.getByLabelText("Senha"), "supersenha");

    const submit = screen.getByRole("button", { name: /^continuar$/i });

    await waitFor(() => {
      expect(submit).toBeEnabled();
    });

    await user.click(submit);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        fullName: "João da Silva",
        phone: "(11) 99999-1234",
        email: "joao@email.com",
        password: "supersenha",
      }),
      expect.anything(),
    );
  });
});
