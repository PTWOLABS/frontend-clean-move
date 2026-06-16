import type { UpdateServicePayload } from "../types";

function hasPayloadField(payload: UpdateServicePayload, key: keyof UpdateServicePayload): boolean {
  return Object.prototype.hasOwnProperty.call(payload, key);
}

/**
 * Valida e devolve o corpo de `PATCH /services/:serviceId`.
 * Exige pelo menos um campo (evita 400 de body vazio).
 */
export function buildUpdateServicePayload(changes: UpdateServicePayload): UpdateServicePayload {
  const keys = Object.keys(changes) as Array<keyof UpdateServicePayload>;

  if (keys.length === 0) {
    throw new Error("O corpo do PATCH deve incluir pelo menos um campo.");
  }

  const hasPrice = hasPayloadField(changes, "price") && changes.price !== undefined;
  const hasPriceSpecification =
    hasPayloadField(changes, "priceSpecification") && changes.priceSpecification !== undefined;

  if (hasPrice && hasPriceSpecification) {
    throw new Error("Não é possível enviar `price` e `priceSpecification` no mesmo PATCH.");
  }

  return changes;
}
