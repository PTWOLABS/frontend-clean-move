import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Form } from "@/shared/forms/form";
import { renderWithProviders } from "@/test/test-utils";

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...(props as React.ImgHTMLAttributes<HTMLImageElement>)} />;
  },
}));

vi.mock("@/features/auth/hooks/use-google-login", () => ({
  useGoogleLogin: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

import { AccountStep } from "./account-step";
import { accountStepSchema, type AccountStepValues } from "../schemas/register-schema";

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
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_CLIENT_ID", "test-google-client-id");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("should render all the account step fields", () => {
    renderAccountStep();

    expect(screen.getByLabelText("Nome completo")).toBeInTheDocument();
    expect(screen.getByLabelText("Telefone")).toBeInTheDocument();
    expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
    expect(screen.getByLabelText("Senha")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /continuar com google/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^continuar$/i })).toBeDisabled();
  });

  it("should toggle the password visibility", async () => {
    const user = userEvent.setup();
    renderAccountStep();

    const password = screen.getByLabelText("Senha") as HTMLInputElement;
    expect(password.type).toBe("password");

    await user.click(screen.getByRole("button", { name: /exibir senha/i }));
    expect(password.type).toBe("text");

    await user.click(screen.getByRole("button", { name: /ocultar senha/i }));
    expect(password.type).toBe("password");
  });

  it("should enable continue and submit the data when the step is valid", async () => {
    const user = userEvent.setup();
    const onSubmit = renderAccountStep();

    await user.type(screen.getByLabelText("Nome completo"), "João da Silva");
    await user.type(screen.getByLabelText("Telefone"), "11999991234");
    await user.type(screen.getByLabelText("E-mail"), "joao@email.com");
    await user.type(screen.getByLabelText("Senha"), "supersenha");

    const submit = screen.getByRole("button", { name: /^continuar$/i });
    await waitFor(() => expect(submit).toBeEnabled());
    await user.click(submit);

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
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
