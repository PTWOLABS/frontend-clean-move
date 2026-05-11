import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { renderWithProviders } from "@/test/test-utils";

const loginMock = vi.fn();

vi.mock("../hooks/use-login", () => ({
  useLogin: () => ({
    mutate: loginMock,
    isPending: false,
  }),
}));

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...(props as React.ImgHTMLAttributes<HTMLImageElement>)} />;
  },
}));

import { LoginForm } from "./login-form";

describe("LoginForm", () => {
  beforeEach(() => {
    loginMock.mockReset();
  });

  it("should render the main fields and buttons", () => {
    renderWithProviders(<LoginForm />);

    expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
    expect(screen.getByLabelText("Senha")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^entrar$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /entrar com google/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /esqueci minha senha/i })).toHaveAttribute(
      "href",
      "/recuperar-senha",
    );
    expect(screen.getByRole("link", { name: /cadastrar-se/i })).toHaveAttribute(
      "href",
      "/register",
    );
  });

  it("should start with remember-me checked and toggle on click", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);

    const checkbox = screen.getByRole("checkbox", { name: /lembrar-me/i });
    expect(checkbox).toBeChecked();

    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it("should toggle the password visibility between password and text", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);

    const passwordInput = screen.getByLabelText("Senha") as HTMLInputElement;
    expect(passwordInput.type).toBe("password");

    const showButton = screen.getByRole("button", { name: /exibir senha/i });
    await user.click(showButton);
    expect(passwordInput.type).toBe("text");

    const hideButton = screen.getByRole("button", { name: /ocultar senha/i });
    await user.click(hideButton);
    expect(passwordInput.type).toBe("password");
  });

  it("should display a validation error when submitting with an invalid email", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);

    await user.click(screen.getByRole("button", { name: /^entrar$/i }));

    expect(await screen.findByText(/informe um e-mail válido/i)).toBeInTheDocument();
    expect(loginMock).not.toHaveBeenCalled();
  });

  it("should call the login mutation with the form data when valid", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);

    await user.type(screen.getByLabelText("E-mail"), "user@email.com");
    await user.type(screen.getByLabelText("Senha"), "senhaForte");
    await user.click(screen.getByRole("button", { name: /^entrar$/i }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledTimes(1);
    });
    expect(loginMock).toHaveBeenCalledWith({
      email: "user@email.com",
      password: "senhaForte",
    });
  });
});
