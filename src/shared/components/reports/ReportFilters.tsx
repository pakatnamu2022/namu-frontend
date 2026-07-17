"use client";

import { useForm, useController } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/shared/components/FormSelect";
import { DateRangePickerFormField } from "@/shared/components/DateRangePickerFormField";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { FormInput } from "@/shared/components/FormInput";
import { MultiSelectTags } from "@/shared/components/MultiSelectTags";
import { Loader2, Download, FileSpreadsheet, FileText } from "lucide-react";
import { FormLabel } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import {
  ReportField,
  ReportFilterValues,
  ReportFormat,
} from "@/shared/lib/reports/reports.interface";
import { useSelectOptions } from "@/shared/lib/reports/reports.hook";
import { useState } from "react";

interface ReportFiltersProps {
  fields: ReportField[];
  onSubmit: (values: ReportFilterValues) => void;
  isLoading?: boolean;
  availableFormats?: ReportFormat[];
}

export function ReportFilters({
  fields,
  onSubmit,
  isLoading,
  availableFormats = ["excel", "pdf"],
}: ReportFiltersProps) {
  const [format, setFormat] = useState<ReportFormat>(availableFormats[0]);
  // Construir el schema dinámicamente basado en los campos
  const buildSchema = () => {
    const schemaFields: Record<string, z.ZodTypeAny> = {};

    fields.forEach((field) => {
      if (field.type === "daterange") {
        // Para daterange, agregamos dos campos
        if (field.nameFrom && field.nameTo) {
          const dateSchema = field.required
            ? z.coerce.date({ message: `${field.label} es requerido` })
            : z.coerce.date().optional();

          schemaFields[field.nameFrom] = dateSchema;
          schemaFields[field.nameTo] = dateSchema;
        }
      } else if (field.type === "date") {
        schemaFields[field.name] = field.required
          ? z.coerce.date({ message: `${field.label} es requerido` })
          : z.coerce.date().optional();
      } else if (field.type === "number") {
        schemaFields[field.name] = field.required
          ? z.coerce.number({ message: `${field.label} es requerido` })
          : z.coerce.number().optional();
      } else if (field.type === "multiselect") {
        schemaFields[field.name] = field.required
          ? z
              .array(z.number())
              .min(1, { message: `${field.label} es requerido` })
          : z.array(z.number()).optional();
      } else {
        schemaFields[field.name] = field.required
          ? z.string({ message: `${field.label} es requerido` })
          : z.string().optional();
      }
    });

    return z.object(schemaFields);
  };

  const formSchema = buildSchema();
  type FormSchema = z.infer<typeof formSchema>;

  // Construir valores por defecto
  const buildDefaultValues = () => {
    const defaults: Record<string, any> = {};

    fields.forEach((field) => {
      if (field.type === "daterange") {
        if (field.nameFrom && field.defaultValueFrom !== undefined) {
          defaults[field.nameFrom] = field.defaultValueFrom;
        }
        if (field.nameTo && field.defaultValueTo !== undefined) {
          defaults[field.nameTo] = field.defaultValueTo;
        }
      } else if (field.defaultValue !== undefined) {
        defaults[field.name] = field.defaultValue;
      }
    });

    return defaults;
  };

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: buildDefaultValues() as any,
  });

  const handleSubmit = (values: FormSchema) => {
    // Limpiar valores vacíos o undefined antes de enviar
    const cleanedValues = Object.entries(values).reduce(
      (acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          // Para fechas, convertir a string ISO
          if (value instanceof Date) {
            acc[key] = value.toISOString().split("T")[0];
          } else {
            acc[key] = value;
          }
        }
        return acc;
      },
      {} as Record<string, any>,
    );

    // Para daterange con rangeParamName, combinar from/to en un único array
    fields.forEach((field) => {
      if (
        field.type === "daterange" &&
        field.rangeParamName &&
        field.nameFrom &&
        field.nameTo
      ) {
        const from = cleanedValues[field.nameFrom];
        const to = cleanedValues[field.nameTo];

        delete cleanedValues[field.nameFrom];
        delete cleanedValues[field.nameTo];

        if (from !== undefined || to !== undefined) {
          cleanedValues[field.rangeParamName] = [from, to];
        }
      }
    });

    // Agregar el formato seleccionado del estado
    cleanedValues.format = format;

    onSubmit(cleanedValues as ReportFilterValues);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Campos dinámicos */}
        {fields.length > 0 && (
          <div className="grid grid-cols-1 gap-4">
            {fields.map((field) => (
              <DynamicField
                key={field.name}
                field={field}
                control={form.control}
              />
            ))}
          </div>
        )}

        {/* Selector de formato y botón de descarga */}
        <div className="flex items-center justify-between">
          {availableFormats.length > 1 ? (
            <div className="inline-flex rounded-md shadow-sm" role="group">
              {availableFormats.includes("excel") && (
                <Button
                  type="button"
                  variant={format === "excel" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFormat("excel")}
                  className="rounded-r-none"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  <span className="ml-2">Excel</span>
                </Button>
              )}
              {availableFormats.includes("pdf") && (
                <Button
                  type="button"
                  variant={format === "pdf" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFormat("pdf")}
                  className="rounded-l-none border-l-0"
                >
                  <FileText className="h-4 w-4" />
                  <span className="ml-2">PDF</span>
                </Button>
              )}
            </div>
          ) : (
            <div />
          )}

          <Button size={"sm"} type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Descargando...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Descargar
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

interface DynamicFieldProps {
  field: ReportField;
  control: any;
}

function DynamicField({ field, control }: DynamicFieldProps) {
  switch (field.type) {
    case "select":
      return <SelectField field={field} control={control} />;

    case "toggle":
      return <ToggleField field={field} control={control} />;

    case "multiselect":
      return <MultiSelectField field={field} control={control} />;

    case "daterange":
      return (
        <DateRangePickerFormField
          control={control}
          nameFrom={field.nameFrom || `${field.name}_from`}
          nameTo={field.nameTo || `${field.name}_to`}
          label={field.label}
          placeholder={field.placeholder}
          required={field.required}
        />
      );

    case "date":
      return (
        <DatePickerFormField
          control={control}
          name={field.name}
          label={field.label}
          placeholder={field.placeholder}
        />
      );

    case "number":
      return (
        <FormInput
          name={field.name}
          label={field.label}
          placeholder={field.placeholder}
          type="number"
          control={control}
          required={field.required}
        />
      );

    case "text":
    default:
      return (
        <FormInput
          name={field.name}
          label={field.label}
          placeholder={field.placeholder}
          type="text"
          control={control}
          required={field.required}
        />
      );
  }
}

function SelectField({ field, control }: DynamicFieldProps) {
  // Si el campo tiene un endpoint, cargar las opciones dinámicamente
  const { data, isLoading } = useSelectOptions(field.endpoint);

  const options = field.endpoint
    ? field.optionsMapper
      ? field.optionsMapper(data)
      : []
    : field.options || [];

  return (
    <FormSelect
      name={field.name}
      label={field.label}
      placeholder={
        field.placeholder || `Seleccionar ${field.label.toLowerCase()}`
      }
      options={options}
      control={control}
      required={field.required}
      disabled={isLoading}
    />
  );
}

function ToggleField({ field, control }: DynamicFieldProps) {
  const {
    field: { value, onChange },
  } = useController({
    name: field.name,
    control,
    defaultValue: field.defaultValue,
  });

  const options = field.options || [];

  return (
    <div className="flex flex-col gap-1">
      {field.label && (
        <FormLabel className="flex justify-start items-center text-xs md:text-sm mb-1 leading-none dark:text-muted-foreground">
          {field.label}
        </FormLabel>
      )}
      <div className="inline-flex rounded-md shadow-sm w-fit" role="group">
        {options.map((option, index) => (
          <Button
            key={option.value}
            type="button"
            variant={value === option.value ? "default" : "outline"}
            size="sm"
            onClick={() => onChange(option.value)}
            className={cn(
              index === 0 && "rounded-r-none",
              index === options.length - 1 && "rounded-l-none border-l-0",
              index > 0 &&
                index < options.length - 1 &&
                "rounded-none border-l-0",
            )}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

function MultiSelectField({ field, control }: DynamicFieldProps) {
  // Si el campo tiene un endpoint, cargar las opciones dinámicamente
  const { data, isLoading } = useSelectOptions(field.endpoint);

  const options = field.endpoint
    ? field.multiSelectMapper
      ? field.multiSelectMapper(data)
      : []
    : field.multiSelectOptions || [];

  return (
    <MultiSelectTags
      name={field.name}
      label={field.label}
      placeholder={
        field.placeholder || `Seleccionar ${field.label.toLowerCase()}`
      }
      options={options}
      control={control}
      required={field.required}
      disabled={isLoading}
      getDisplayValue={
        field.getDisplayValue || ((item) => item.name || String(item.id))
      }
      getSecondaryText={field.getSecondaryText}
    />
  );
}
