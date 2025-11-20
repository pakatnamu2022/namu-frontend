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

interface FormInputProps {
  name: string;
  description?: string;
  label?: string;
  placeholder?: string;
  control: Control<any>;
  disabled?: boolean;
  tooltip?: string | React.ReactNode;
  className?: string;
  type?: string;
  children?: React.ReactNode;
  required?: boolean;
}

export function FormInput({
  name,
  description,
  label,
  placeholder,
  control,
  disabled,
  tooltip,
  className,
  type = "text",
  children,
  required,
}: FormInputProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col justify-between">
          <FormLabel className="flex justify-start items-center">
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
          <div className="flex gap-2 items-center">
            <FormControl>
              <Input
                {...field}
                type={type}
                placeholder={placeholder}
                disabled={disabled}
                className={className}
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
