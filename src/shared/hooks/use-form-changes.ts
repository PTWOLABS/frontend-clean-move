import { useCallback } from "react";

import { getChangedFields, type FieldComparators } from "@/shared/utils/get-changed-fields";

type UseFormChangesOptions<T extends Record<string, unknown>> = {
  comparators?: FieldComparators<T>;
};

/** Compara payloads normalizados contra um snapshot inicial (ex.: modo edição com PATCH parcial). */
export function useFormChanges<T extends Record<string, unknown>>(
  initial: T | null,
  options?: UseFormChangesOptions<T>,
) {
  const comparators = options?.comparators;

  const getChangedPayload = useCallback(
    (current: T) => getChangedFields(current, initial, { comparators }),
    [initial, comparators],
  );

  const hasChanges = useCallback(
    (current: T) => Object.keys(getChangedFields(current, initial, { comparators })).length > 0,
    [initial, comparators],
  );

  return { getChangedPayload, hasChanges };
}
