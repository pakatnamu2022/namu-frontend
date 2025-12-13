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
  label?: string | React.ReactNode;
  control: Control<any>;
  tooltip?: string | React.ReactNode;
  children?: React.ReactNode;
  required?: boolean;
  addonStart?: React.ReactNode;
  addonEnd?: React.ReactNode;
}

export function FormInput({
  name,
  description,
  label,
  control,
  tooltip,
  children,
  required,
  className,
  addonStart,
  addonEnd,
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
              <div className="relative w-full">
                {addonStart && (
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-muted-foreground pointer-events-none z-10">
                    {addonStart}
                  </div>
                )}
                <Input
                  className={cn(
                    "h-8 md:h-10 text-xs md:text-sm",
                    addonStart && "pl-10",
                    addonEnd && "pr-10",
                    className
                  )}
                  {...field}
                  {...inputProps}
                />
                {addonEnd && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-muted-foreground pointer-events-none z-10">
                    {addonEnd}
                  </div>
                )}
              </div>
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
