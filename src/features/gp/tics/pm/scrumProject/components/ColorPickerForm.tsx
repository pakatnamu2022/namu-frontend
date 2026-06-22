"use client";

import { useState } from "react";
import React from "react";
import { Control } from "react-hook-form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  TailwindColorPicker,
  getTailwindHex,
  TAILWIND_COLORS,
} from "@/components/ui/tailwind-color-picker";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import RequiredField from "@/shared/components/RequiredField";
import { useIsMobile } from "@/hooks/use-mobile";

type ColorMode = "tailwind" | "hex";

const isHex = (v: string) => /^#[0-9a-fA-F]{3,6}$/.test(v);

const getSwatchColor = (value: string | undefined): string => {
  if (!value) return getTailwindHex("slate");
  if (isHex(value)) return value;
  return getTailwindHex(value);
};

const getLabel = (value: string | undefined, placeholder?: string): string => {
  if (!value) return placeholder ?? "slate";
  return value;
};

interface ColorPickerFormProps {
  name: string;
  control: Control<any>;
  label?: string | (() => React.ReactNode);
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  tooltip?: string | React.ReactNode;
  className?: string;
  size?: "sm" | "default" | "lg";
  defaultMode?: ColorMode;
  children?: React.ReactNode;
}

export const ColorPickerForm = ({
  name,
  control,
  label,
  placeholder,
  description,
  disabled,
  readOnly,
  required,
  tooltip,
  className,
  size,
  defaultMode = "tailwind",
  children,
}: ColorPickerFormProps) => {
  const [mode, setMode] = useState<ColorMode>(defaultMode);
  const isMobile = useIsMobile();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col justify-between">
          {label && typeof label === "function"
            ? label()
            : label && (
                <FormLabel className="flex justify-start items-center text-xs md:text-sm mb-1 leading-none dark:text-muted-foreground">
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

          <div className="flex gap-2 items-center">
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    disabled={disabled}
                    size={size ? size : isMobile ? "sm" : "default"}
                    onClick={readOnly ? (e) => e.preventDefault() : undefined}
                    className={cn(
                      "w-full justify-between flex",
                      !field.value && "text-muted-foreground",
                      field.value && "bg-muted",
                      readOnly && "cursor-default pointer-events-none",
                      className,
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="size-4 shrink-0 rounded"
                        style={{ backgroundColor: getSwatchColor(field.value) }}
                      />
                      <span className="capitalize">
                        {getLabel(field.value, placeholder)}
                      </span>
                    </span>
                    {!readOnly && (
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    )}
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-3 space-y-3" align="start">
                {/* Mode toggle */}
                <div className="flex rounded-md border border-input overflow-hidden text-xs">
                  <button
                    type="button"
                    onClick={() => setMode("tailwind")}
                    className={cn(
                      "flex-1 py-1 transition-colors",
                      mode === "tailwind"
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted",
                    )}
                  >
                    Tailwind
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("hex")}
                    className={cn(
                      "flex-1 py-1 transition-colors",
                      mode === "hex"
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted",
                    )}
                  >
                    Hex
                  </button>
                </div>

                {mode === "tailwind" ? (
                  <TailwindColorPicker
                    value={
                      TAILWIND_COLORS.find((c) => c.name === field.value)
                        ? field.value
                        : undefined
                    }
                    onChange={(name) => field.onChange(name)}
                  />
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="size-7 shrink-0 rounded border border-input"
                        style={{ backgroundColor: getSwatchColor(field.value) }}
                      />
                      <span className="text-xs font-mono text-muted-foreground">
                        {isHex(field.value ?? "") ? field.value : getSwatchColor(field.value)}
                      </span>
                    </div>
                    <input
                      type="color"
                      value={isHex(field.value ?? "") ? field.value : getSwatchColor(field.value)}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="w-full h-10 rounded border border-input cursor-pointer p-0.5 bg-transparent"
                    />
                  </div>
                )}
              </PopoverContent>
            </Popover>
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
};
