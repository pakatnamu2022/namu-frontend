import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import RequiredField from "./RequiredField";
import { cn } from "@/lib/utils";

interface FormInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "name"
> {
  name: string;
  description?: string;
  label?: string | React.ReactNode;
  labelClassName?: string;
  control?: Control<any>;
  tooltip?: string | React.ReactNode;
  children?: React.ReactNode;
  required?: boolean;
  addonStart?: React.ReactNode;
  addonEnd?: React.ReactNode;
  error?: string;
  uppercase?: boolean;
  optional?: boolean;
}

export function FormInput({
  name,
  description,
  label,
  labelClassName,
  control,
  tooltip,
  children,
  required,
  className,
  addonStart,
  addonEnd,
  error,
  value,
  onChange,
  uppercase,
  optional,
  ...inputProps
}: FormInputProps) {
  const isNumberType = inputProps.type === "number";

  // Si no hay control, funcionar como input controlado estándar
  if (!control) {
    const handleStandaloneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        if (isNumberType) {
          const val = e.target.value;
          let numValue = val === "" ? "" : Number(val);

          // Aplicar límites min/max si están definidos
          if (typeof numValue === "number" && !isNaN(numValue)) {
            if (
              inputProps.max !== undefined &&
              numValue > Number(inputProps.max)
            ) {
              numValue = Number(inputProps.max);
            }
            if (
              inputProps.min !== undefined &&
              numValue < Number(inputProps.min)
            ) {
              numValue = Number(inputProps.min);
            }
          }

          // Crear un evento sintético con el valor numérico
          const syntheticEvent = {
            ...e,
            target: {
              ...e.target,
              value: numValue,
            },
          } as React.ChangeEvent<HTMLInputElement>;
          onChange(syntheticEvent);
        } else {
          const val = uppercase ? e.target.value.toUpperCase() : e.target.value;
          const syntheticEvent = {
            ...e,
            target: {
              ...e.target,
              value: val,
            },
          } as React.ChangeEvent<HTMLInputElement>;
          onChange(syntheticEvent);
        }
      }
    };

    return (
      <div className="flex flex-col justify-between">
        {label && (
          <label
            className={cn(
              "flex justify-start items-center text-xs md:text-sm mb-1 leading-none h-fit font-medium text-muted-foreground",
              labelClassName,
            )}
          >
            {label}
            {required && <RequiredField />}
            {tooltip && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    color="tertiary"
                    className="ml-2 p-0 aspect-square w-4 h-4 text-center justify-center"
                  >
                    ?
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>{tooltip}</TooltipContent>
              </Tooltip>
            )}
          </label>
        )}
        <div className="flex flex-col gap-2 items-center">
          <div className="relative w-full">
            {addonStart && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-muted-foreground pointer-events-none z-10">
                {addonStart}
              </div>
            )}
            <Input
              name={name}
              className={cn(
                "h-7 md:h-8 text-xs md:text-sm",
                addonStart && "pl-10",
                addonEnd && "pr-10",
                (optional || !required) && "border-dashed",
                value && "bg-muted",
                className,
              )}
              {...inputProps}
              onChange={handleStandaloneChange}
              value={value ?? ""}
            />
            {addonEnd && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center text-muted-foreground z-10">
                {addonEnd}
              </div>
            )}
          </div>
          {children}
        </div>

        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {error && (
          <p className="text-xs font-medium text-destructive mt-1">{error}</p>
        )}
      </div>
    );
  }

  // Si hay control, funcionar como FormField (comportamiento original)
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          // If an external onChange is provided for text inputs, let it fully control the value
          if (onChange && !isNumberType) {
            onChange(e);
            return;
          }

          if (isNumberType) {
            const val = e.target.value;
            let numValue = val === "" ? "" : Number(val);

            // Aplicar límites min/max si están definidos
            if (typeof numValue === "number" && !isNaN(numValue)) {
              if (
                inputProps.max !== undefined &&
                numValue > Number(inputProps.max)
              ) {
                numValue = Number(inputProps.max);
              }
              if (
                inputProps.min !== undefined &&
                numValue < Number(inputProps.min)
              ) {
                numValue = Number(inputProps.min);
              }
            }

            field.onChange(numValue);
          } else {
            const val = uppercase
              ? e.target.value.toUpperCase()
              : e.target.value;
            field.onChange(val);
          }

          if (onChange) onChange(e);
        };

        return (
          <FormItem className="flex flex-col justify-between">
            {(label || required || tooltip) && (
              <FormLabel
                className={cn(
                  "flex justify-start items-center text-xs md:text-sm mb-1 leading-none h-fit dark:text-muted-foreground",
                  labelClassName,
                )}
              >
                {label}
                {required && <RequiredField />}
                {tooltip && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        color="tertiary"
                        className="ml-2 p-0 aspect-square w-4 h-4 text-center justify-center"
                      >
                        ?
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>{tooltip}</TooltipContent>
                  </Tooltip>
                )}
              </FormLabel>
            )}
            <div className="flex flex-col gap-2 items-center">
              <div className="relative w-full">
                {addonStart && (
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-muted-foreground pointer-events-none z-10">
                    {addonStart}
                  </div>
                )}
                <FormControl>
                  <Input
                    className={cn(
                      "h-7 md:h-8 text-xs md:text-sm",
                      addonStart && "pl-10",
                      addonEnd && "pr-10",
                      (optional || !required) && "border-dashed",
                      field.value && "bg-muted",
                      className,
                    )}
                    {...field}
                    {...inputProps}
                    onChange={handleChange}
                    value={value !== undefined ? value : (field.value ?? "")}
                  />
                </FormControl>
                {addonEnd && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center text-muted-foreground z-10">
                    {addonEnd}
                  </div>
                )}
              </div>
              {children}
            </div>

            {description && (
              <FormDescription className="text-xs text-muted-foreground mb-0!">
                {description}
              </FormDescription>
            )}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
