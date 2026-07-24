import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  createEmptyQuoteApprovalResolutionValues,
  type QuoteApprovalResolutionValues,
} from "../../lib/quote-approval-resolution-helpers";
import type { QuoteApprovalAnalysisDto } from "../../types/analyze-quote-approval";
import { QuoteApprovalResolutionStep } from "./quote-approval-resolution-step";

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
        name: "Marina Oliveira",
        phone: "(11) 99999-0000",
        email: "marina@example.com",
        cpfCnpj: null,
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

const multipleCustomerCandidatesAnalysis: QuoteApprovalAnalysisDto = {
  ...requiresResolutionAnalysis,
  customer: {
    ...requiresResolutionAnalysis.customer,
    candidates: [
      requiresResolutionAnalysis.customer.candidates[0],
      {
        customerId: "second-candidate-customer-id",
        name: "Marina O.",
        phone: "(11) 99999-0000",
        email: null,
        cpfCnpj: null,
        matchedBy: ["PHONE"],
        conflictingFields: ["EMAIL"],
        advisoryOnly: false,
      },
    ],
  },
  vehicle: {
    ...requiresResolutionAnalysis.vehicle,
    requiresResolution: false,
    allowedActions: [],
  },
  services: [],
};

function renderStep({
  analysis = requiresResolutionAnalysis,
  values = createEmptyQuoteApprovalResolutionValues(),
  onChange = vi.fn(),
  isApproving = false,
  onApprove = vi.fn(),
  onBack = vi.fn(),
}: {
  analysis?: QuoteApprovalAnalysisDto;
  values?: QuoteApprovalResolutionValues;
  onChange?: (values: QuoteApprovalResolutionValues) => void;
  isApproving?: boolean;
  onApprove?: () => void;
  onBack?: () => void;
} = {}) {
  return render(
    <Dialog open>
      <DialogContent showCloseButton={false}>
        <QuoteApprovalResolutionStep
          analysis={analysis}
          values={values}
          isApproving={isApproving}
          onChange={onChange}
          onApprove={onApprove}
          onBack={onBack}
        />
      </DialogContent>
    </Dialog>,
  );
}

describe("QuoteApprovalResolutionStep", () => {
  it("lists pending approval items with selectable actions", () => {
    renderStep();

    expect(screen.getByRole("heading", { name: "Resolver pendências" })).toBeInTheDocument();
    expect(screen.getByText("0 de 3 pendências com resolução selecionada")).toBeInTheDocument();
    expect(screen.getByText("Cliente com correspondências")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "vincular cliente existente" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "criar novo cliente" })).toBeEnabled();
    expect(screen.getByText("Veículo precisa ser definido")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "criar veículo pelos dados do orçamento" }),
    ).toBeEnabled();
    expect(
      screen.getByRole("button", { name: "manter apenas os dados do orçamento" }),
    ).toBeEnabled();
    expect(screen.getByText("Serviço com correspondência: Polimento tecnico")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "associar serviço existente" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "renomear serviço avulso" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Confirmar aprovação" })).toBeDisabled();
  });

  it("emits typed resolution values when selecting an action with complete data", () => {
    const onChange = vi.fn();

    renderStep({ onChange });

    fireEvent.click(screen.getByRole("button", { name: "criar novo cliente" }));

    expect(onChange).toHaveBeenCalledWith({
      pendingSelections: [],
      serviceResolutions: [],
      customerResolution: {
        action: "CREATE_NEW",
      },
    });
  });

  it("allows selecting an action that will need details in the next step", () => {
    const onChange = vi.fn();

    renderStep({ analysis: multipleCustomerCandidatesAnalysis, onChange });

    expect(screen.getByText("Escolher")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /vincular cliente existente/i }));

    expect(onChange).toHaveBeenCalledWith({
      pendingSelections: [
        {
          id: "customer-LINK_EXISTING",
          target: "customer",
        },
      ],
      serviceResolutions: [],
    });
  });

  it("marks already selected resolution actions", () => {
    renderStep({
      values: {
        pendingSelections: [],
        serviceResolutions: [],
        customerResolution: {
          action: "CREATE_NEW",
        },
      },
    });

    expect(screen.getByRole("button", { name: "criar novo cliente" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("marks pending detail selections", () => {
    renderStep({
      analysis: multipleCustomerCandidatesAnalysis,
      values: {
        pendingSelections: [
          {
            id: "customer-LINK_EXISTING",
            target: "customer",
          },
        ],
        serviceResolutions: [],
      },
    });

    expect(screen.getByRole("button", { name: /vincular cliente existente/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("enables final approval when all pending items have complete selected resolutions", () => {
    const onApprove = vi.fn();

    renderStep({
      values: {
        pendingSelections: [],
        customerResolution: {
          action: "CREATE_NEW",
        },
        vehicleResolution: {
          action: "CREATE_FROM_SNAPSHOT",
        },
        serviceResolutions: [
          {
            quoteServiceId: "quote-service-id",
            action: "ASSOCIATE_EXISTING",
            serviceId: "candidate-service-id",
          },
        ],
      },
      onApprove,
    });

    fireEvent.click(screen.getByRole("button", { name: "Confirmar aprovação" }));

    expect(onApprove).toHaveBeenCalled();
  });

  it("keeps final approval disabled while selected actions still need details", () => {
    renderStep({
      analysis: multipleCustomerCandidatesAnalysis,
      values: {
        pendingSelections: [
          {
            id: "customer-LINK_EXISTING",
            target: "customer",
          },
        ],
        serviceResolutions: [],
      },
    });

    expect(screen.getByRole("button", { name: "Confirmar aprovação" })).toBeDisabled();
  });

  it("disables final approval while approval is pending", () => {
    renderStep({
      values: {
        pendingSelections: [],
        customerResolution: {
          action: "CREATE_NEW",
        },
        vehicleResolution: {
          action: "CREATE_FROM_SNAPSHOT",
        },
        serviceResolutions: [
          {
            quoteServiceId: "quote-service-id",
            action: "ASSOCIATE_EXISTING",
            serviceId: "candidate-service-id",
          },
        ],
      },
      isApproving: true,
    });

    expect(screen.getByRole("button", { name: "Aprovando" })).toBeDisabled();
  });

  it("returns to the analysis step from the footer action", () => {
    const onBack = vi.fn();

    renderStep({ onBack });

    fireEvent.click(screen.getByRole("button", { name: "Voltar à análise" }));

    expect(onBack).toHaveBeenCalled();
  });
});
