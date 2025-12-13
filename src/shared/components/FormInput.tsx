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

interface FormInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "name"> {
  name: string;
  description?: string;
  label?: string;
  control: Control<any>;
  tooltip?: string | React.ReactNode;
  children?: React.ReactNode;
  required?: boolean;
}

export function FormInput({
  name,
  description,
  label,
  control,
  tooltip,
  children,
  required,
  ...inputProps
}: FormInputProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col justify-between">
          <FormLabel className="flex justify-start items-center text-xs md:text-sm mb-1">
            {label}
            {required && <RequiredField />}
            {tooltip && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="tertiary"
                    className="ml-2 p-0 aspect-square w-4 h-4 text-center justify-center"
                  >
                    ?
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>{tooltip}</TooltipContent>
              </Tooltip>
            )}
          </FormLabel>
          <div className="flex flex-col gap-2 items-center">
            <FormControl>
              <Input
                className={cn(
                  inputProps.className,
                  "h-8 md:h-10 text-xs md:text-sm"
                )}
                {...field}
                {...inputProps}
              />
            </FormControl>
            {children}
          </div>

          {description && (
            <FormDescription className="text-xs text-muted-foreground mb-0!">
              {description}
            </FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
