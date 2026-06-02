export function resolveCatalogSelection<T>(
  items: readonly T[],
  selected: T | null,
  isSameItem: (a: T, b: T) => boolean,
): T | null {
  if (items.length === 0) return null;

  if (selected) {
    const match = items.find((item) => isSameItem(item, selected));
    if (match) return match;
  }

  return items[0] ?? null;
}
