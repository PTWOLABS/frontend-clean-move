import { Option } from "@/components/ui/multiple-selector";

export function mergeOptionItems(options: Option[], selectedOptions: Option[]) {
  const selectedValues = new Set(selectedOptions.map((option) => option.value));

  return [...selectedOptions, ...options.filter((option) => !selectedValues.has(option.value))];
}
