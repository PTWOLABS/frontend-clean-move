import { ComponentProps, ReactNode } from "react";
import { Input } from "../input";
import { InputMask } from "@react-input/mask";
import { FormControl } from "./form-primitives";
import { FormField } from "./field";
import { cn } from "@/shared/utils/cn";

type InputFieldProps = Omit<ComponentProps<typeof FormField>, "children" | "className"> &
  Omit<ComponentProps<typeof Input>, "className" | "name"> & {
    mask?: string;
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
  icon,
  image,
  ...props
}: InputFieldProps) => {
  const inputClassName = cn(className, image && "pr-12");
  const inputId = props.id ?? name;

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
                component={Input}
                replacement={{ _: /\d/ }}
                {...field}
                {...props}
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
                {...props}
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
