import { describe, expect, it } from "vitest";
import { CarFront, UserRoundCheck, Wrench } from "lucide-react";

import {
  QUOTE_SERVICE_RESOLUTION_ACTION_LABELS,
  QUOTE_VEHICLE_RESOLUTION_ACTION_LABELS,
} from "../constants/quote-approval-analysis-labels";
import type {
  QuoteApprovalAnalysisDto,
  QuoteCustomerAnalysisDto,
  QuoteVehicleAnalysisDto,
} from "../types/analyze-quote-approval";
import {
  CUSTOMER_RESOLUTION_ACTION_LABELS,
  getCustomerActions,
  getCustomerDescription,
  getResolutionCards,
  getVehicleDescription,
} from "./quote-approval-resolution-helpers";

const resolvedCustomer: QuoteCustomerAnalysisDto = {
  status: "RESOLVED",
  requiresResolution: false,
  automaticCustomerId: null,
  candidates: [],
};

const createRequiredCustomer: QuoteCustomerAnalysisDto = {
  status: "CREATE_REQUIRED",
  requiresResolution: true,
  automaticCustomerId: null,
  candidates: [],
};

const candidatesFoundCustomer: QuoteCustomerAnalysisDto = {
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
    {
      customerId: "second-candidate-customer-id",
      matchedBy: ["PHONE"],
      conflictingFields: ["EMAIL"],
      advisoryOnly: false,
    },
  ],
};

const vehicleWithCandidate: QuoteVehicleAnalysisDto = {
  status: "CANDIDATE_FOUND",
  requiresResolution: true,
  candidateVehicleId: "candidate-vehicle-id",
  candidateCustomerId: null,
  allowedActions: ["LINK_EXISTING"],
};

const vehicleWithOwnershipConflict: QuoteVehicleAnalysisDto = {
  status: "OWNERSHIP_CONFLICT",
  requiresResolution: true,
  candidateVehicleId: null,
  candidateCustomerId: "candidate-customer-id",
  allowedActions: ["KEEP_SNAPSHOT_ONLY"],
};

const requiresResolutionAnalysis: QuoteApprovalAnalysisDto = {
  status: "REQUIRES_RESOLUTION",
  automaticResolutions: [],
  customer: candidatesFoundCustomer,
  vehicle: {
    status: "SNAPSHOT_ONLY",
    requiresResolution: true,
    candidateVehicleId: null,
    candidateCustomerId: null,
    allowedActions: ["CREATE_FROM_SNAPSHOT", "KEEP_SNAPSHOT_ONLY"],
  },
  services: [
    {
      quoteServiceId: "resolved-service-id",
      status: "RESOLVED",
      requiresResolution: false,
      serviceId: "service-id",
      candidateServiceId: "service-id",
      snapshot: {
        name: "Lavagem simples",
        priceInCents: 3000,
        durationInMinutes: 30,
        categoryId: null,
        categoryName: null,
        isCourtesy: false,
      },
      candidate: null,
      differences: [],
      allowedActions: [],
    },
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
        name: "Polimento tecnico cadastrado",
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

describe("quote approval resolution helpers", () => {
  it("returns customer actions based on the customer analysis status", () => {
    expect(getCustomerActions(resolvedCustomer)).toEqual([]);
    expect(getCustomerActions(createRequiredCustomer)).toEqual([
      CUSTOMER_RESOLUTION_ACTION_LABELS.CREATE_NEW,
    ]);
    expect(getCustomerActions(candidatesFoundCustomer)).toEqual([
      CUSTOMER_RESOLUTION_ACTION_LABELS.LINK_EXISTING,
      CUSTOMER_RESOLUTION_ACTION_LABELS.CREATE_NEW,
    ]);
  });

  it("builds customer descriptions from candidates, matches and conflicts", () => {
    expect(getCustomerDescription(createRequiredCustomer)).toBe(
      "Defina como o cliente do orçamento deve ser tratado na aprovação.",
    );

    const description = getCustomerDescription(candidatesFoundCustomer);

    expect(description).toContain("2 clientes candidatos encontrados");
    expect(description).toContain("telefone e e-mail");
    expect(description).toContain("nome e e-mail");
  });

  it("builds vehicle descriptions for candidate and ownership conflict scenarios", () => {
    expect(getVehicleDescription(vehicleWithCandidate)).toBe(
      "Há um veículo candidato para associar ao agendamento.",
    );
    expect(getVehicleDescription(vehicleWithOwnershipConflict)).toBe(
      "O veículo encontrado está relacionado a outro cliente.",
    );
  });

  it("builds resolution cards only for items that require resolution", () => {
    expect(getResolutionCards(requiresResolutionAnalysis)).toEqual([
      expect.objectContaining({
        id: "customer",
        area: "Cliente",
        title: "Cliente com correspondências",
        actions: [
          CUSTOMER_RESOLUTION_ACTION_LABELS.LINK_EXISTING,
          CUSTOMER_RESOLUTION_ACTION_LABELS.CREATE_NEW,
        ],
        icon: UserRoundCheck,
      }),
      expect.objectContaining({
        id: "vehicle",
        area: "Veículo",
        title: "Veículo precisa ser definido",
        actions: [
          QUOTE_VEHICLE_RESOLUTION_ACTION_LABELS.CREATE_FROM_SNAPSHOT,
          QUOTE_VEHICLE_RESOLUTION_ACTION_LABELS.KEEP_SNAPSHOT_ONLY,
        ],
        icon: CarFront,
      }),
      expect.objectContaining({
        id: "service-quote-service-id",
        area: "Serviço",
        title: "Serviço com correspondência: Polimento tecnico",
        description: "Candidato encontrado: Polimento tecnico cadastrado. Diferenças: preço.",
        actions: [
          QUOTE_SERVICE_RESOLUTION_ACTION_LABELS.ASSOCIATE_EXISTING,
          QUOTE_SERVICE_RESOLUTION_ACTION_LABELS.RENAME_DETACHED,
        ],
        icon: Wrench,
      }),
    ]);
  });
});
