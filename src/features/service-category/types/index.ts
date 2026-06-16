import type { OptionsQuery } from "@/shared/types/options-query";

export type ServiceCategoryRef = {
  id: string;
  name: string;
};

export type ServiceCategoryDto = {
  id: string;
  establishmentId: string;
  name: string;
  deletedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type ServiceCategoryOption = {
  id: string;
  label: string;
};

export type ListServiceCategoriesQuery = {
  includeDeleted?: boolean;
};

export type ListServiceCategoriesResponse = {
  categories: ServiceCategoryDto[];
};

export type ServiceCategoryResponse = {
  category: ServiceCategoryDto;
};

export type ServiceCategoryOptionsResponse = {
  categories: ServiceCategoryOption[];
};

export type ServiceCategoryOptionsQuery = OptionsQuery;

export type CreateServiceCategoryPayload = {
  name: string;
};

export type UpdateServiceCategoryPayload = {
  name: string;
};
