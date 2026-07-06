function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" && value !== null && !Array.isArray(value) && !(value instanceof Date)
  );
}

function normalizeComparableFormValue(value: unknown): unknown {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value.trim();
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? "" : value.getTime();
  }

  if (Array.isArray(value)) {
    return value.map(normalizeComparableFormValue);
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, entryValue]) => [
        key,
        normalizeComparableFormValue(entryValue),
      ]),
    );
  }

  return value;
}

function areComparableFormValuesEqual(current: unknown, defaultValue: unknown): boolean {
  const normalizedCurrent = normalizeComparableFormValue(current);
  const normalizedDefaultValue = normalizeComparableFormValue(defaultValue);

  if (Array.isArray(normalizedCurrent) && Array.isArray(normalizedDefaultValue)) {
    return (
      normalizedCurrent.length === normalizedDefaultValue.length &&
      normalizedCurrent.every((value, index) =>
        areComparableFormValuesEqual(value, normalizedDefaultValue[index]),
      )
    );
  }

  if (isPlainObject(normalizedCurrent) && isPlainObject(normalizedDefaultValue)) {
    const keys = new Set([
      ...Object.keys(normalizedCurrent),
      ...Object.keys(normalizedDefaultValue),
    ]);

    return Array.from(keys).every((key) =>
      areComparableFormValuesEqual(normalizedCurrent[key], normalizedDefaultValue[key]),
    );
  }

  return Object.is(normalizedCurrent, normalizedDefaultValue);
}

export function hasFormStepChanges(current: unknown, defaultValue: unknown): boolean {
  return !areComparableFormValuesEqual(current, defaultValue);
}
