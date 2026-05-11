import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { Form } from "@/shared/forms/form";
import { renderWithProviders } from "@/test/test-utils";

const fetchCompanyByCnpjMock = vi.fn();

vi.mock("../api/brasilapi", () => ({
  fetchCompanyByCnpj: (...args: unknown[]) => fetchCompanyByCnpjMock(...args),
}));

import { CompanyStep } from "./company-step";
import { companyStepSchema, type CompanyStepValues } from "../schemas/register-schema";

const defaultValues: CompanyStepValues = {
  cnpj: "",
  legalName: "",
  tradeName: "",
};

function renderCompanyStep({
  onSubmit = vi.fn() as (data: CompanyStepValues) => void,
  onBack = vi.fn() as (values: CompanyStepValues) => void,
  initialValues = defaultValues,
}: {
  onSubmit?: (data: CompanyStepValues) => void;
  onBack?: (values: CompanyStepValues) => void;
  initialValues?: CompanyStepValues;
} = {}) {
  renderWithProviders(
    <Form<CompanyStepValues>
      onSubmit={onSubmit}
      schema={companyStepSchema}
      options={{ mode: "onBlur", reValidateMode: "onChange", defaultValues: initialValues }}
    >
      <CompanyStep onBack={onBack} />
    </Form>,
  );
  return { onSubmit, onBack };
}

describe("CompanyStep", () => {
  beforeEach(() => {
    fetchCompanyByCnpjMock.mockReset();
  });

  it("should render the company step fields and buttons", () => {
    renderCompanyStep();

    expect(screen.getByLabelText("CNPJ")).toBeInTheDocument();
    expect(screen.getByLabelText("Razão social")).toBeInTheDocument();
    expect(screen.getByLabelText("Nome fantasia")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /voltar/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^continuar$/i })).toBeDisabled();
  });

  it("should fill legalname and tradename when the cnpj lookup returns data", async () => {
    const user = userEvent.setup();
    fetchCompanyByCnpjMock.mockResolvedValue({
      legalName: "Empresa LTDA",
      tradeName: "Empresa",
    });

    renderCompanyStep();

    await user.type(screen.getByLabelText("CNPJ"), "12345678000190");

    await waitFor(() => {
      expect((screen.getByLabelText("Razão social") as HTMLInputElement).value).toBe(
        "Empresa LTDA",
      );
      expect((screen.getByLabelText("Nome fantasia") as HTMLInputElement).value).toBe("Empresa");
    });

    expect(fetchCompanyByCnpjMock).toHaveBeenCalled();
  });

  it("should display an error message when the cnpj lookup fails", async () => {
    const user = userEvent.setup();
    fetchCompanyByCnpjMock.mockRejectedValue(new Error("erro"));

    renderCompanyStep();

    await user.type(screen.getByLabelText("CNPJ"), "12345678000190");

    expect(await screen.findByText(/não foi possível consultar o cnpj/i)).toBeInTheDocument();
  });

  it("should call onback with the current values when 'voltar' is clicked", async () => {
    const user = userEvent.setup();
    const { onBack } = renderCompanyStep({
      initialValues: {
        cnpj: "12.345.678/0001-90",
        legalName: "Empresa LTDA",
        tradeName: "Empresa",
      },
    });

    await user.click(screen.getByRole("button", { name: /voltar/i }));
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onBack).toHaveBeenCalledWith(
      expect.objectContaining({
        cnpj: "12.345.678/0001-90",
        legalName: "Empresa LTDA",
        tradeName: "Empresa",
      }),
    );
  });
});
