import { ComponentProps, ReactNode } from "react";
import { Input } from "../input";
import { InputMask, type Modify } from "@react-input/mask";
import { FormControl } from "./form-primitives";
import { FormField } from "./field";
import { cn } from "@/shared/utils/cn";

type InputFieldProps = Omit<ComponentProps<typeof FormField>, "children" | "className"> &
  Omit<ComponentProps<typeof Input>, "className" | "name"> & {
    mask?: string;
    modify?: Modify;
    icon?: ReactNode;
    image?: ReactNode;
    className?: string;
    fieldClassName?: string;
    wrapperClassName?: string;
    imageClassName?: string;
  };

export const InputField = ({
  name,
  label,
  required,
  control,
  className,
  fieldClassName,
  wrapperClassName,
  imageClassName,
  mask,
  modify,
  icon,
  image,
  ...props
}: InputFieldProps) => {
  const inputClassName = cn(className, image && "pr-12");
  const inputId = props.id ?? name;
  const { onChange: onChangeProp, ...inputProps } = props;

  return (
    <FormField
      name={name}
      label={label}
      required={required}
      control={control}
      className={fieldClassName}
      id={inputId}
      renderControl={false}
    >
      {({ field }) =>
        mask ? (
          <div className={cn((icon || image) && "relative", wrapperClassName)}>
            <FormControl>
              <InputMask
                mask={mask}
                modify={modify}
                component={Input}
                replacement={{ _: /\d/ }}
                {...field}
                {...inputProps}
                value={field.value ?? ""}
                onChange={(event) => {
                  field.onChange(event);
                  onChangeProp?.(event);
                }}
                id={inputId}
                required={required}
                className={inputClassName}
              />
            </FormControl>
            {icon}
            {image && (
              <span
                className={cn(
                  "pointer-events-none absolute right-4 top-1/2 flex -translate-y-1/2 items-center",
                  imageClassName,
                )}
              >
                {image}
              </span>
            )}
          </div>
        ) : (
          <div className={cn((icon || image) && "relative", wrapperClassName)}>
            <FormControl>
              <Input
                {...field}
                {...inputProps}
                value={field.value ?? ""}
                onChange={(event) => {
                  field.onChange(event);
                  onChangeProp?.(event);
                }}
                id={inputId}
                required={required}
                className={inputClassName}
              />
            </FormControl>
            {icon}
            {image && (
              <span
                className={cn(
                  "pointer-events-none absolute right-4 top-1/2 flex -translate-y-1/2 items-center",
                  imageClassName,
                )}
              >
                {image}
              </span>
            )}
          </div>
        )
      }
    </FormField>
  );
};
