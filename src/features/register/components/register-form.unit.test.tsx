import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { renderWithProviders } from "@/test/test-utils";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
}));

const fetchCompanyByCnpjMock = vi.fn();
const fetchAddressByZipCodeMock = vi.fn();
const registerEstablishmentMock = vi.fn();

vi.mock("../api/brasilapi", () => ({
  fetchCompanyByCnpj: (...args: unknown[]) => fetchCompanyByCnpjMock(...args),
}));
vi.mock("../api/viacep", () => ({
  fetchAddressByZipCode: (...args: unknown[]) => fetchAddressByZipCodeMock(...args),
}));
vi.mock("../api/establishment", () => ({
  registerEstablishment: (...args: unknown[]) => registerEstablishmentMock(...args),
}));

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...(props as React.ImgHTMLAttributes<HTMLImageElement>)} />;
  },
}));

import { RegisterForm } from "./register-form";

describe("RegisterForm", () => {
  beforeEach(() => {
    fetchCompanyByCnpjMock.mockReset();
    fetchAddressByZipCodeMock.mockReset();
    registerEstablishmentMock.mockReset();
    pushMock.mockReset();
  });

  it("should start at the account step and show the login link", () => {
    renderWithProviders(<RegisterForm />);

    expect(screen.getByRole("heading", { name: /crie sua conta/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByLabelText("Nome completo")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /fazer login/i })).toHaveAttribute("href", "/login");
  });

  it("should advance to the company step after filling valid account data", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterForm />);

    await user.type(screen.getByLabelText("Nome completo"), "João da Silva");
    await user.type(screen.getByLabelText("Telefone"), "11999991234");
    await user.type(screen.getByLabelText("E-mail"), "joao@email.com");
    await user.type(screen.getByLabelText("Senha"), "supersenha");

    const continuar = screen.getByRole("button", { name: /^continuar$/i });
    await waitFor(() => expect(continuar).toBeEnabled());
    await user.click(continuar);

    expect(
      await screen.findByRole("heading", { name: /dados da empresa/i, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("CNPJ")).toBeInTheDocument();
  });

  it("should go back from company to account preserving the entered data", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterForm />);

    await user.type(screen.getByLabelText("Nome completo"), "João da Silva");
    await user.type(screen.getByLabelText("Telefone"), "11999991234");
    await user.type(screen.getByLabelText("E-mail"), "joao@email.com");
    await user.type(screen.getByLabelText("Senha"), "supersenha");

    const continuar = screen.getByRole("button", { name: /^continuar$/i });
    await waitFor(() => expect(continuar).toBeEnabled());
    await user.click(continuar);

    await screen.findByRole("heading", { name: /dados da empresa/i, level: 1 });
    await user.click(screen.getByRole("button", { name: /voltar/i }));

    expect(
      await screen.findByRole("heading", { name: /crie sua conta/i, level: 1 }),
    ).toBeInTheDocument();
    expect((screen.getByLabelText("Nome completo") as HTMLInputElement).value).toBe(
      "João da Silva",
    );
    expect((screen.getByLabelText("E-mail") as HTMLInputElement).value).toBe("joao@email.com");
  });

  it("should walk through all the steps until finishing the registration", async () => {
    const user = userEvent.setup();
    fetchCompanyByCnpjMock.mockResolvedValue({
      legalName: "Empresa LTDA",
      tradeName: "Empresa",
    });
    fetchAddressByZipCodeMock.mockResolvedValue({
      street: "Av. Paulista",
      city: "São Paulo",
      state: "SP",
      complement: "Sala 1",
    });
    registerEstablishmentMock.mockResolvedValue({
      establishmentId: "b2955e61-179f-40a4-8852-ef185e4ab671",
    });

    renderWithProviders(<RegisterForm />);

    await user.type(screen.getByLabelText("Nome completo"), "João da Silva");
    await user.type(screen.getByLabelText("Telefone"), "11999991234");
    await user.type(screen.getByLabelText("E-mail"), "joao@email.com");
    await user.type(screen.getByLabelText("Senha"), "supersenha");

    let continuar = screen.getByRole("button", { name: /^continuar$/i });
    await waitFor(() => expect(continuar).toBeEnabled());
    await user.click(continuar);

    await screen.findByLabelText("CNPJ");
    await user.type(screen.getByLabelText("CNPJ"), "12345678000190");

    await waitFor(() => {
      expect((screen.getByLabelText("Razão social") as HTMLInputElement).value).toBe(
        "Empresa LTDA",
      );
    });

    continuar = screen.getByRole("button", { name: /^continuar$/i });
    await waitFor(() => expect(continuar).toBeEnabled());
    await user.click(continuar);

    expect(
      await screen.findByRole("heading", { name: /endereço da empresa/i, level: 1 }),
    ).toBeInTheDocument();
    await user.type(screen.getByLabelText("CEP"), "01310100");

    await waitFor(() => {
      expect((screen.getByLabelText("Rua") as HTMLInputElement).value).toBe("Av. Paulista");
    });

    await user.type(screen.getByLabelText("Número"), "1000");

    const finalizar = screen.getByRole("button", { name: /finalizar cadastro/i });
    await waitFor(() => expect(finalizar).toBeEnabled());
    await user.click(finalizar);

    await waitFor(() => expect(registerEstablishmentMock).toHaveBeenCalledTimes(1));

    expect(registerEstablishmentMock).toHaveBeenCalledWith({
      name: "João da Silva",
      tradeName: "Empresa",
      legalBusinessName: "Empresa LTDA",
      email: "joao@email.com",
      password: "supersenha",
      cnpj: "12345678000190",
      phone: "11999991234",
      address: {
        street: "Av. Paulista, 1000",
        complement: "Sala 1",
        country: "Brasil",
        state: "SP",
        zipCode: "01310-100",
        city: "São Paulo",
      },
      slug: "empresa",
    });

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/login"));
  });
});
