import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { Form } from "@/shared/forms/form";
import { renderWithProviders } from "@/test/test-utils";

const fetchAddressByZipCodeMock = vi.fn();

vi.mock("../api/viacep", () => ({
  fetchAddressByZipCode: (...args: unknown[]) => fetchAddressByZipCodeMock(...args),
}));

import { AddressStep } from "./address-step";
import { addressStepSchema, type AddressStepValues } from "../schemas/register-schema";

const defaultValues: AddressStepValues = {
  zipCode: "",
  street: "",
  number: "",
  city: "",
  state: "",
  complement: "",
};

function renderAddressStep({
  onSubmit = vi.fn() as (data: AddressStepValues) => void,
  onBack = vi.fn() as (values: AddressStepValues) => void,
  initialValues = defaultValues,
}: {
  onSubmit?: (data: AddressStepValues) => void;
  onBack?: (values: AddressStepValues) => void;
  initialValues?: AddressStepValues;
} = {}) {
  renderWithProviders(
    <Form<AddressStepValues>
      onSubmit={onSubmit}
      schema={addressStepSchema}
      options={{ mode: "onBlur", reValidateMode: "onChange", defaultValues: initialValues }}
    >
      <AddressStep onBack={onBack} />
    </Form>,
  );
  return { onSubmit, onBack };
}

describe("AddressStep", () => {
  beforeEach(() => {
    fetchAddressByZipCodeMock.mockReset();
  });

  it("should render all the address step fields", () => {
    renderAddressStep();

    expect(screen.getByLabelText("CEP")).toBeInTheDocument();
    expect(screen.getByLabelText("Rua")).toBeInTheDocument();
    expect(screen.getByLabelText("Número")).toBeInTheDocument();
    expect(screen.getByLabelText("Cidade")).toBeInTheDocument();
    expect(screen.getByLabelText("Estado")).toBeInTheDocument();
    expect(screen.getByLabelText("Complemento")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /voltar/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /finalizar cadastro/i })).toBeDisabled();
  });

  it("should fill street, city and state when the zipcode returns data", async () => {
    const user = userEvent.setup();
    fetchAddressByZipCodeMock.mockResolvedValue({
      street: "Av. Paulista",
      city: "São Paulo",
      state: "SP",
      complement: "Sala 1",
    });

    renderAddressStep();

    await user.type(screen.getByLabelText("CEP"), "01310100");

    await waitFor(() => {
      expect((screen.getByLabelText("Rua") as HTMLInputElement).value).toBe("Av. Paulista");
      expect((screen.getByLabelText("Cidade") as HTMLInputElement).value).toBe("São Paulo");
      expect((screen.getByLabelText("Estado") as HTMLInputElement).value).toBe("SP");
      expect((screen.getByLabelText("Complemento") as HTMLInputElement).value).toBe("Sala 1");
    });
  });

  it("should display an error message when the zipcode lookup fails", async () => {
    const user = userEvent.setup();
    fetchAddressByZipCodeMock.mockRejectedValue(new Error("erro"));

    renderAddressStep();

    await user.type(screen.getByLabelText("CEP"), "01310100");

    expect(await screen.findByText(/não foi possível consultar o cep/i)).toBeInTheDocument();
  });
});
