import { formatCentsToBrlInput } from "@/shared/money/format-brl-money";

export type ServicePriceType = "FIXED" | "STARTING_AT" | "RANGE";

export type ServicePriceSpecification =
  | {
      type: "FIXED";
      fixedPriceInCents: number;
    }
  | {
      type: "STARTING_AT";
      minPriceInCents: number;
    }
  | {
      type: "RANGE";
      minPriceInCents: number;
      maxPriceInCents: number;
    };

export type ServicePriceMetadata = {
  priceType: ServicePriceType;
  minPriceInCents: number;
  maxPriceInCents?: number;
};

type ServicePriceMetadataSource = {
  priceInCents?: number;
  priceSpecification?: ServicePriceSpecification | null;
};

export type ServicePriceValidationIssue = "BELOW_MIN" | "ABOVE_MAX";

export function resolveServicePriceMetadata<T extends ServicePriceMetadataSource>(
  option: T,
): ServicePriceMetadata {
  if (option.priceSpecification?.type === "FIXED") {
    return {
      priceType: "FIXED",
      minPriceInCents: option.priceSpecification.fixedPriceInCents,
    };
  }

  if (option.priceSpecification?.type === "STARTING_AT") {
    return {
      priceType: "STARTING_AT",
      minPriceInCents: option.priceSpecification.minPriceInCents,
    };
  }

  if (option.priceSpecification?.type === "RANGE") {
    return {
      priceType: "RANGE",
      minPriceInCents: option.priceSpecification.minPriceInCents,
      maxPriceInCents: option.priceSpecification.maxPriceInCents,
    };
  }

  return {
    priceType: "FIXED",
    minPriceInCents: Math.max(0, option.priceInCents ?? 0),
  };
}

export function isFixedServicePrice(metadata?: ServicePriceMetadata | null) {
  return metadata?.priceType === "FIXED";
}

export function getServicePriceValidationIssue(
  priceInCents: number,
  metadata?: ServicePriceMetadata | null,
): ServicePriceValidationIssue | null {
  if (!metadata) return null;

  if (priceInCents < metadata.minPriceInCents) {
    return "BELOW_MIN";
  }

  if (
    metadata.priceType === "RANGE" &&
    typeof metadata.maxPriceInCents === "number" &&
    priceInCents > metadata.maxPriceInCents
  ) {
    return "ABOVE_MAX";
  }

  return null;
}

export function formatServicePriceMetadataDescription(metadata: ServicePriceMetadata) {
  if (metadata.priceType === "FIXED") {
    return `Valor fixo: ${formatCentsToBrlInput(metadata.minPriceInCents)}`;
  }

  if (metadata.priceType === "RANGE" && typeof metadata.maxPriceInCents === "number") {
    return `Permitido: ${formatCentsToBrlInput(
      metadata.minPriceInCents,
    )} a ${formatCentsToBrlInput(metadata.maxPriceInCents)}`;
  }

  return `Mínimo permitido: ${formatCentsToBrlInput(metadata.minPriceInCents)}`;
}
