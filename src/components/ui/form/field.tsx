'use client';

import { ReactNode } from 'react';
import {
  Control,
  ControllerFieldState,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
} from 'react-hook-form';

import {
  FormControl,
  FormField as FormFieldPrimitive,
  FormItem,
  FormLabel,
  FormMessage,
} from './form-primitives';
import { Input } from '../input';

export type FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
  id?: string;
  label?: string;
  required?: boolean;
  className?: string;
  control?: Control<TFieldValues>;
  renderControl?: boolean;
  children?: (params: {
    field: ControllerRenderProps<TFieldValues, TName>;
    fieldState: ControllerFieldState;
  }) => ReactNode;
};

export const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  id,
  label,
  className,
  control,
  renderControl = true,
  children,
  ...props
}: FormFieldProps<TFieldValues, TName>) => {
  const fieldId = id ?? name;

  return (
    <FormFieldPrimitive
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={className}>
          {label && <FormLabel htmlFor={fieldId}>{label}</FormLabel>}
          {children ? (
            renderControl ? (
              <FormControl>{children({ field, fieldState })}</FormControl>
            ) : (
              children({ field, fieldState })
            )
          ) : (
            <FormControl>
              <Input {...field} {...props} id={fieldId} />
            </FormControl>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
