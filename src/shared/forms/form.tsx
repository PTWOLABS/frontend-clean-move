"use client";

import {
  FormProvider,
  useForm,
  type FieldValues,
  type Resolver,
  type SubmitHandler,
  type UseFormProps,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ZodTypeAny } from "zod";
import type { ReactNode } from "react";

type BaseFormProps<TValues extends FieldValues> = {
  children: ReactNode;
  onSubmit: SubmitHandler<TValues>;
  className?: string;
};

type WithSchema<TValues extends FieldValues> = BaseFormProps<TValues> & {
  schema: ZodTypeAny;
  options?: Omit<UseFormProps<TValues>, "resolver">;
};

type WithoutSchema<TValues extends FieldValues> = BaseFormProps<TValues> & {
  schema?: undefined;
  options?: UseFormProps<TValues>;
};

type FormProps<TValues extends FieldValues> = WithSchema<TValues> | WithoutSchema<TValues>;

export function Form<TValues extends FieldValues>({
  children,
  onSubmit,
  schema,
  options,
  className,
}: FormProps<TValues>) {
  const resolveSchema = zodResolver as unknown as (schema: ZodTypeAny) => Resolver<TValues>;

  const methods = useForm<TValues>({
    ...(schema ? { resolver: resolveSchema(schema) } : {}),
    ...(options ?? ({} as UseFormProps<TValues>)),
  });

  return (
    <FormProvider {...methods}>
      <form className={className} onSubmit={methods.handleSubmit(onSubmit)}>
        {children}
      </form>
    </FormProvider>
  );
}
