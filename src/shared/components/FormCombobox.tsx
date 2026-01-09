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
  CommandGroup,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react";
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

/**
 * Normaliza un texto removiendo tildes y convirtiéndolo a mayúsculas
 */
const normalizeText = (text: string): string => {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remover tildes
    .toUpperCase()
    .replace(/[^A-Z0-9_\s]/g, ""); // Solo letras mayúsculas, números, guiones bajos y espacios
};

// Componente separado para el contenido del Command
const ComboboxCommandContent = React.memo(({
  options,
  selectedValue,
  onSelect,
  onCreateNew,
  isLoadingOptions,
  searchValue,
  setSearchValue,
  allowCreate = true,
}: {
  options: Option[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onCreateNew: (value: string) => void;
  isLoadingOptions: boolean;
  searchValue: string;
  setSearchValue: (value: string) => void;
  allowCreate?: boolean;
}) => {
  const normalizedSearch = normalizeText(searchValue);

  const filteredOptions = React.useMemo(() => {
    if (!searchValue) return options;

    return options.filter((option) => {
      const label = typeof option.label === "function" ? option.label() : option.label;
      const normalizedLabel = normalizeText(label?.toString() || "");
      return normalizedLabel.includes(normalizedSearch);
    });
  }, [options, searchValue, normalizedSearch]);

  const exactMatch = filteredOptions.find(
    (option) => normalizeText(option.value) === normalizedSearch
  );

  const showCreateOption = allowCreate && searchValue && !exactMatch;

  return (
    <Command className="md:max-h-72 overflow-hidden" shouldFilter={false}>
      <CommandInput
        className="border-none focus:ring-0"
        placeholder="Buscar o escribir nuevo..."
        value={searchValue}
        onValueChange={setSearchValue}
      />
      <CommandList className="md:max-h-60 overflow-y-auto">
        {isLoadingOptions ? (
          <div className="py-6 text-center text-sm flex flex-col items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-muted-foreground">Cargando...</span>
          </div>
        ) : (
          <>
            {filteredOptions.length === 0 && !showCreateOption && (
              <CommandEmpty className="py-4 text-center text-sm">
                No hay resultados.
              </CommandEmpty>
            )}

            {filteredOptions.length > 0 && (
              <CommandGroup heading="Opciones disponibles">
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    className="cursor-pointer"
                    onSelect={() => onSelect(option.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 shrink-0",
                        option.value === selectedValue
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="truncate">
                        {typeof option.label === "function"
                          ? option.label()
                          : option.label}
                      </span>
                      {option.description && (
                        <span className="text-[10px] text-muted-foreground truncate">
                          {option.description}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {showCreateOption && (
              <CommandGroup heading="Crear nuevo">
                <CommandItem
                  className="cursor-pointer text-primary"
                  onSelect={() => onCreateNew(normalizedSearch)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  <span>
                    Crear "{normalizedSearch}"
                  </span>
                </CommandItem>
              </CommandGroup>
            )}
          </>
        )}
      </CommandList>
    </Command>
  );
});

ComboboxCommandContent.displayName = "ComboboxCommandContent";

interface FormComboboxProps {
  name: string;
  description?: string;
  label?: string | (() => React.ReactNode);
  placeholder?: string;
  options: Option[];
  control: Control<any>;
  disabled?: boolean;
  tooltip?: string | React.ReactNode;
  children?: React.ReactNode;
  isLoadingOptions?: boolean;
  className?: string;
  required?: boolean;
  popoverWidth?: string;
  portalContainer?: HTMLElement | null;
  size?: "sm" | "default" | "lg";
  allowCreate?: boolean;
}

export function FormCombobox({
  name,
  description,
  label,
  placeholder,
  options,
  control,
  disabled,
  tooltip,
  children,
  isLoadingOptions = false,
  className,
  required = false,
  popoverWidth = "w-(--radix-popover-trigger-width)!",
  size,
  portalContainer,
  allowCreate = true,
}: FormComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const isMobile = useIsMobile();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const selected = options.find((opt) => opt.value === field.value);

        const handleSelect = (optionValue: string) => {
          const newValue = optionValue === field.value && !required ? "" : optionValue;
          field.onChange(newValue);
          setSearchValue("");
          setOpen(false);
        };

        const handleCreateNew = (newValue: string) => {
          field.onChange(newValue);
          setSearchValue("");
          setOpen(false);
        };

        const commandContent = (
          <ComboboxCommandContent
            options={options}
            selectedValue={field.value}
            onSelect={handleSelect}
            onCreateNew={handleCreateNew}
            isLoadingOptions={isLoadingOptions}
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            allowCreate={allowCreate}
          />
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
                : field.value
                ? field.value
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
                <Drawer open={open} onOpenChange={setOpen}>
                  <DrawerTrigger asChild>
                    <FormControl>{triggerButton}</FormControl>
                  </DrawerTrigger>
                  <DrawerContent className="px-4 pb-4 max-h-[80vh]">
                    <DrawerHeader>
                      <DrawerTitle>
                        {typeof label === "function"
                          ? "Seleccionar o crear opción"
                          : label || "Seleccionar o crear opción"}
                      </DrawerTitle>
                      <DrawerDescription className="hidden" />
                    </DrawerHeader>
                    <div className="overflow-hidden">{commandContent}</div>
                  </DrawerContent>
                </Drawer>
              ) : (
                <Popover open={open} onOpenChange={setOpen}>
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
                    {commandContent}
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
