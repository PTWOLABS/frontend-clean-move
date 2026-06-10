export type FieldComparators<T extends Record<string, unknown>> = {
  [K in keyof T]?: (current: T[K], initial: T[K]) => boolean;
};

type GetChangedFieldsOptions<T extends Record<string, unknown>> = {
  comparators?: FieldComparators<T>;
};

function areArraysEqual(left: unknown[], right: unknown[]) {
  return (
    left.length === right.length && left.every((value, index) => Object.is(value, right[index]))
  );
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" && value !== null && !Array.isArray(value) && !(value instanceof Date)
  );
}

function arePlainObjectsShallowEqual(
  left: Record<string, unknown>,
  right: Record<string, unknown>,
) {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);

  if (leftKeys.length !== rightKeys.length) {
    return false;
  }

  return leftKeys.every((key) => Object.is(left[key], right[key]));
}

function areFieldValuesEqual(current: unknown, initial: unknown) {
  if (Array.isArray(current) && Array.isArray(initial)) {
    return areArraysEqual(current, initial);
  }

  if (isPlainObject(current) && isPlainObject(initial)) {
    return arePlainObjectsShallowEqual(current, initial);
  }

  return Object.is(current, initial);
}

/** Devolve apenas as chaves de `current` que diferem de `initial`. Com `initial === null`, devolve `current` inteiro. */
export function getChangedFields<T extends Record<string, unknown>>(
  current: T,
  initial: T | null,
  options?: GetChangedFieldsOptions<T>,
): Partial<T> {
  if (!initial) {
    return current;
  }

  const changedFields: Partial<T> = {};
  const comparators = options?.comparators;

  for (const key of Object.keys(initial) as Array<keyof T>) {
    const currentValue = current[key];
    const initialValue = initial[key];
    const customComparator = comparators?.[key];

    const isEqual = customComparator
      ? customComparator(currentValue, initialValue)
      : areFieldValuesEqual(currentValue, initialValue);

    if (!isEqual) {
      changedFields[key] = currentValue;
    }
  }

  return changedFields;
}
