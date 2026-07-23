import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { QuoteCustomerCandidateDto } from "../../types/analyze-quote-approval";
import { QuoteApprovalCustomerCandidateStep } from "./quote-approval-customer-candidate-step";

const candidates: QuoteCustomerCandidateDto[] = [
  {
    customerId: "first-candidate-customer-id",
    name: "Marina Oliveira",
    phone: "(11) 99999-0000",
    email: "marina@example.com",
    cpfCnpj: "123.456.789-00",
    matchedBy: ["PHONE", "EMAIL"],
    conflictingFields: ["NAME"],
    advisoryOnly: false,
  },
  {
    customerId: "second-candidate-customer-id",
    name: "Marina O.",
    phone: null,
    email: null,
    cpfCnpj: "123.456.789-00",
    matchedBy: ["CPF_CNPJ"],
    conflictingFields: [],
    advisoryOnly: true,
  },
];

function renderStep({
  selectedCustomerId,
  onSelect = vi.fn(),
  onBack = vi.fn(),
}: {
  selectedCustomerId?: string;
  onSelect?: (customerId: string) => void;
  onBack?: () => void;
} = {}) {
  render(
    <Dialog open>
      <DialogContent showCloseButton={false}>
        <QuoteApprovalCustomerCandidateStep
          candidates={candidates}
          selectedCustomerId={selectedCustomerId}
          onSelect={onSelect}
          onBack={onBack}
        />
      </DialogContent>
    </Dialog>,
  );
}

describe("QuoteApprovalCustomerCandidateStep", () => {
  it("lists customer candidates with identity, contact and divergence details", () => {
    renderStep();

    expect(screen.getByRole("heading", { name: "Escolher cliente" })).toBeInTheDocument();
    expect(screen.getByText("2 clientes candidatos encontrados")).toBeInTheDocument();
    expect(screen.getByText("Marina Oliveira")).toBeInTheDocument();
    expect(screen.getByText("(11) 99999-0000")).toBeInTheDocument();
    expect(screen.getByText("marina@example.com")).toBeInTheDocument();
    expect(screen.getAllByText("123.456.789-00")).toHaveLength(2);
    expect(screen.getAllByText("Correspondências")).toHaveLength(2);
    expect(screen.getByText("Dados divergentes")).toBeInTheDocument();
    expect(screen.getByText("nome")).toBeInTheDocument();
    expect(screen.getByText("Marina O.")).toBeInTheDocument();
    expect(screen.getByText("Apenas alerta")).toBeInTheDocument();
    expect(screen.queryByText("ID first-candidate-customer-id")).not.toBeInTheDocument();
  });

  it("marks the selected customer candidate", () => {
    renderStep({ selectedCustomerId: "first-candidate-customer-id" });

    expect(screen.getByText("Selecionado")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Selecionar cliente Marina Oliveira" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Selecionar cliente Marina O." })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("emits the selected customer id", () => {
    const onSelect = vi.fn();

    renderStep({ onSelect });

    fireEvent.click(screen.getByRole("button", { name: "Selecionar cliente Marina O." }));

    expect(onSelect).toHaveBeenCalledWith("second-candidate-customer-id");
  });

  it("returns to the resolution step", () => {
    const onBack = vi.fn();

    renderStep({ onBack });

    fireEvent.click(screen.getByRole("button", { name: "Voltar às pendências" }));

    expect(onBack).toHaveBeenCalled();
  });
});
