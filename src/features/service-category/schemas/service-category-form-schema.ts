import { z } from "zod";

export const serviceCategoryFormSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome da categoria."),
});

export type ServiceCategoryFormValues = z.infer<typeof serviceCategoryFormSchema>;

export const serviceCategoryFormDefaultValues: ServiceCategoryFormValues = {
  name: "",
};
