"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandList,
  CommandItem,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Control } from "react-hook-form";
import { useState } from "react";
import React from "react";
import { Option } from "@/core/core.interface";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import RequiredField from "./RequiredField";
import { useIsMobile } from "@/hooks/use-mobile";

interface FormSelectProps {
  name: string;
  description?: string;
  label?: string | (() => React.ReactNode);
  placeholder?: string;
  options: Option[];
  control: Control<any>;
  disabled?: boolean;
  tooltip?: string | React.ReactNode;
  strictFilter?: boolean;
  startsWith?: boolean;
  sortByLength?: boolean;
  classNameOption?: string;
  withValue?: boolean;
  children?: React.ReactNode;
  isSearchable?: boolean;
  setSearchQuery?: (value: string) => void;
  isLoadingOptions?: boolean;
  className?: string;
  required?: boolean;
  popoverWidth?: string;
  portalContainer?: HTMLElement | null;
  size?: "sm" | "default" | "lg";
}

export function FormSelect({
  name,
  description,
  label,
  placeholder,
  options,
  control,
  disabled,
  tooltip,
  strictFilter = false,
  startsWith = false,
  sortByLength = false,
  classNameOption,
  withValue = true,
  children,
  isSearchable = false,
  setSearchQuery,
  isLoadingOptions = false,
  className,
  required = false,
  popoverWidth = "w-(--radix-popover-trigger-width)!",
  size,
  portalContainer,
}: FormSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const isMobile = useIsMobile();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const selected = options.find((opt) => opt.value === field.value);

        const handleSelect = (optionValue: string) => {
          const newValue =
            optionValue === field.value && !required ? "" : optionValue;
          field.onChange(newValue);
          setOpen(false);
        };

        const CommandContent = () => (
          <Command
            className="md:max-h-72 overflow-hidden"
            shouldFilter={!isSearchable && !strictFilter}
          >
            <CommandInput
              className="border-none focus:ring-0"
              placeholder="Buscar..."
              value={strictFilter ? search : undefined}
              onValueChange={(value) => {
                if (strictFilter) {
                  setSearch(value);
                }
                if (isSearchable && setSearchQuery) {
                  setSearchQuery(value);
                }
              }}
            />
            <CommandList className="md:max-h-60 overflow-y-auto">
              {isLoadingOptions ? (
                <div className="py-6 text-center text-sm flex flex-col items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-muted-foreground">Buscando...</span>
                </div>
              ) : (
                <>
                  <CommandEmpty className="py-4 text-center text-sm">
                    No hay resultados.
                  </CommandEmpty>
                  {(strictFilter
                    ? options.filter((option) => {
                        if (!search) return true;
                        const label =
                          typeof option.label === "function"
                            ? option.label()
                            : option.label;
                        const labelStr = (label || "").toString().toLowerCase();
                        const searchStr = search.toLowerCase();

                        return startsWith
                          ? labelStr.startsWith(searchStr)
                          : labelStr.includes(searchStr);
                      })
                    : options
                  )
                    .sort((a, b) => {
                      if (!sortByLength) return 0;

                      const labelA =
                        typeof a.label === "function" ? a.label() : a.label;
                      const labelB =
                        typeof b.label === "function" ? b.label() : b.label;

                      const lengthA = (labelA || "").toString().length;
                      const lengthB = (labelB || "").toString().length;

                      return lengthA - lengthB;
                    })
                    .map((option) => (
                      <CommandItem
                        key={option.value}
                        className="cursor-pointer"
                        onSelect={() => handleSelect(option.value)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4 shrink-0",
                            option.value === field.value
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className={cn("truncate", classNameOption)}>
                            {typeof option.label === "function"
                              ? option.label()
                              : option.label}
                          </span>
                          {option.description && (
                            <span className="text-[10px] text-muted-foreground truncate">
                              {withValue && `${option.value} - `}{" "}
                              {option.description}
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                </>
              )}
            </CommandList>
          </Command>
        );

        const triggerButton = (
          <Button
            size={size ? size : isMobile ? "sm" : "lg"}
            variant="outline"
            role="combobox"
            disabled={disabled}
            className={cn(
              "w-full justify-between flex",
              !field.value && "text-muted-foreground",
              className
            )}
          >
            <span className="text-nowrap! line-clamp-1">
              {selected
                ? typeof selected.label === "function"
                  ? selected.label()
                  : selected.label
                : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        );

        return (
          <FormItem className="flex flex-col justify-between">
            {label && typeof label === "function"
              ? label()
              : label && (
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
                )}

            <div className="flex gap-2 items-center">
              {isMobile ? (
                <Drawer
                  open={open}
                  onOpenChange={(newOpen) => {
                    setOpen(newOpen);
                    if (!newOpen && strictFilter) setSearch("");
                  }}
                >
                  <DrawerTrigger asChild>
                    <FormControl>{triggerButton}</FormControl>
                  </DrawerTrigger>
                  <DrawerContent className="px-4 pb-4 max-h-[80vh]">
                    <DrawerHeader>
                      <DrawerTitle>
                        {typeof label === "function"
                          ? "Seleccionar opción"
                          : label || "Seleccionar opción"}
                      </DrawerTitle>
                      <DrawerDescription className="hidden" />
                    </DrawerHeader>
                    <div className="overflow-hidden">
                      <CommandContent />
                    </div>
                  </DrawerContent>
                </Drawer>
              ) : (
                <Popover
                  open={open}
                  onOpenChange={(newOpen) => {
                    setOpen(newOpen);
                    if (!newOpen && strictFilter) setSearch("");
                  }}
                >
                  <PopoverTrigger asChild>
                    <FormControl>{triggerButton}</FormControl>
                  </PopoverTrigger>

                  <PopoverContent
                    container={portalContainer}
                    className={cn("p-0", popoverWidth)}
                    onWheel={(e) => e.stopPropagation()}
                    onWheelCapture={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                  >
                    <CommandContent />
                  </PopoverContent>
                </Popover>
              )}
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
