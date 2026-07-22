import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { QuoteApprovalVerificationStep } from "./quote-approval-verification-step";
import { QuoteListItemDto } from "../../types/quotes";
import { QuoteApprovalAnalysisDto } from "../../types/analyze-quote-approval";

const quote: QuoteListItemDto = {
  id: "quote-id",
  customerName: "Marina Oliveira",
  customerKind: "CUSTOMER",
  vehicleLabel: "Honda Civic",
  vehiclePlate: "ABC1D23",
  totalInCents: 125000,
  status: "VALID",
  expiresAt: "2026-07-30T12:00:00.000Z",
  createdAt: "2026-07-17T12:00:00.000Z",
  approvedAt: null,
  servicesCount: 2,
};

const readyAnalysis: QuoteApprovalAnalysisDto = {
  status: "READY",
  automaticResolutions: [
    {
      resource: "CUSTOMER",
      action: "LINK_EXISTING",
      resourceId: "customer-id",
      matchedBy: "CPF_CNPJ",
    },
  ],
  customer: {
    status: "AUTO_LINK",
    requiresResolution: false,
    automaticCustomerId: "customer-id",
    candidates: [],
  },
  vehicle: {
    status: "NONE",
    requiresResolution: false,
    candidateVehicleId: null,
    candidateCustomerId: null,
    allowedActions: [],
  },
  services: [
    {
      quoteServiceId: "quote-service-id",
      status: "RESOLVED",
      requiresResolution: false,
      serviceId: "service-id",
      candidateServiceId: "service-id",
      snapshot: {
        name: "Polimento tecnico",
        priceInCents: 5000,
        durationInMinutes: 60,
        categoryId: null,
        categoryName: null,
        isCourtesy: false,
      },
      candidate: {
        serviceId: "service-id",
        name: "Polimento tecnico",
        isActive: true,
        priceSpecification: {
          type: "FIXED",
          fixedPriceInCents: 5000,
        },
        durationInMinutes: 60,
        categoryId: null,
        categoryName: null,
      },
      differences: [],
      allowedActions: [],
    },
  ],
};

const requiresResolutionAnalysis: QuoteApprovalAnalysisDto = {
  status: "REQUIRES_RESOLUTION",
  automaticResolutions: [],
  customer: {
    status: "CANDIDATES_FOUND",
    requiresResolution: true,
    automaticCustomerId: null,
    candidates: [
      {
        customerId: "candidate-customer-id",
        matchedBy: ["PHONE", "EMAIL"],
        conflictingFields: ["NAME"],
        advisoryOnly: false,
      },
    ],
  },
  vehicle: {
    status: "SNAPSHOT_ONLY",
    requiresResolution: true,
    candidateVehicleId: null,
    candidateCustomerId: null,
    allowedActions: ["CREATE_FROM_SNAPSHOT", "KEEP_SNAPSHOT_ONLY"],
  },
  services: [
    {
      quoteServiceId: "quote-service-id",
      status: "CANDIDATE_FOUND",
      requiresResolution: true,
      serviceId: null,
      candidateServiceId: "candidate-service-id",
      snapshot: {
        name: "Polimento tecnico",
        priceInCents: 6000,
        durationInMinutes: null,
        categoryId: null,
        categoryName: null,
        isCourtesy: false,
      },
      candidate: {
        serviceId: "candidate-service-id",
        name: "Polimento tecnico",
        isActive: true,
        priceSpecification: {
          type: "FIXED",
          fixedPriceInCents: 5000,
        },
        durationInMinutes: null,
        categoryId: null,
        categoryName: null,
      },
      differences: ["PRICE"],
      allowedActions: ["ASSOCIATE_EXISTING", "RENAME_DETACHED"],
    },
  ],
};

function renderStep(ui: React.ReactNode) {
  return render(
    <Dialog open>
      <DialogContent showCloseButton={false}>{ui}</DialogContent>
    </Dialog>,
  );
}

describe("QuoteApprovalVerificationStep", () => {
  it("presents the loading state while analysis is pending", () => {
    renderStep(
      <QuoteApprovalVerificationStep
        quote={quote}
        analysis={null}
        isAnalyzing
        isApproving={false}
        onApprove={vi.fn()}
        onResolveRequired={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: "Verificando orçamento" })).toBeInTheDocument();
    expect(screen.getByText("Analisando cliente")).toBeInTheDocument();
    expect(screen.getByText("Aguarde enquanto concluímos a análise")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Fechar" })).not.toBeInTheDocument();
  });

  it("presents the ready state from the analysis response", () => {
    const onApprove = vi.fn();

    renderStep(
      <QuoteApprovalVerificationStep
        quote={quote}
        analysis={readyAnalysis}
        isAnalyzing={false}
        isApproving={false}
        onApprove={onApprove}
        onResolveRequired={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Orçamento pronto para aprovação" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Nenhuma pendência encontrada")).toBeInTheDocument();
    expect(
      screen.getByText("1 resolução automática foi aplicada durante a análise."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("progressbar", { name: "Progresso da análise de aprovação do orçamento" }),
    ).toHaveAttribute("aria-valuenow", "100");

    fireEvent.click(screen.getByRole("button", { name: "Confirmar aprovação" }));
    expect(onApprove).toHaveBeenCalled();
  });

  it("disables the approval action while approval is pending", () => {
    renderStep(
      <QuoteApprovalVerificationStep
        quote={quote}
        analysis={readyAnalysis}
        isAnalyzing={false}
        isApproving
        onApprove={vi.fn()}
        onResolveRequired={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Aprovando" })).toBeDisabled();
  });

  it("lists customer, vehicle and service issues when resolution is required", () => {
    const onResolveRequired = vi.fn();

    renderStep(
      <QuoteApprovalVerificationStep
        quote={quote}
        analysis={requiresResolutionAnalysis}
        isAnalyzing={false}
        isApproving={false}
        onApprove={vi.fn()}
        onResolveRequired={onResolveRequired}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Pendências antes da aprovação" }),
    ).toBeInTheDocument();
    expect(screen.getByText("3 pendências encontradas")).toBeInTheDocument();
    expect(screen.getAllByText("Cliente com correspondências")).toHaveLength(2);
    expect(screen.getByText(/Correspondências por telefone e e-mail/i)).toBeInTheDocument();
    expect(screen.getAllByText("Veículo precisa ser definido")).toHaveLength(2);
    expect(
      screen.getByText(
        /criar veículo pelos dados do orçamento e manter apenas os dados do orçamento/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Serviço com correspondência: Polimento tecnico")).toBeInTheDocument();
    expect(screen.getByText(/Diferenças: preço/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Resolver pendências/i }));
    expect(onResolveRequired).toHaveBeenCalled();
  });
});
