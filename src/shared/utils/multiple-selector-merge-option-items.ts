import { Option } from "@/components/ui/multiple-selector";

type MergeOptionItemsOptions = {
  preferFetchedOptions?: boolean;
};

export function mergeOptionItems(
  options: Option[],
  selectedOptions: Option[],
  { preferFetchedOptions = false }: MergeOptionItemsOptions = {},
) {
  const optionValues = new Set(options.map((option) => option.value));
  const selectedValues = new Set(selectedOptions.map((option) => option.value));

  if (preferFetchedOptions) {
    return [...options, ...selectedOptions.filter((option) => !optionValues.has(option.value))];
  }

  return [...selectedOptions, ...options.filter((option) => !selectedValues.has(option.value))];
}
