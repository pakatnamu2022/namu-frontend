"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { gpMastersSchemaCreate, ApMastersSchema } from "../lib/gpMaster.schema";
import { FormInput } from "@/shared/components/FormInput";
import { FormCombobox } from "@/shared/components/FormCombobox";

interface GpMasterFormProps {
  onSubmit: (data: ApMastersSchema) => void;
  isSubmitting: boolean;
  defaultValues?: Partial<ApMastersSchema>;
  mode: "create" | "update";
  onCancel?: () => void;
  allowedTypes: string[];
  typeLabels?: Record<string, string>;
}

export default function GpMasterForm({
  onSubmit,
  isSubmitting,
  defaultValues,
  mode,
  onCancel,
  allowedTypes,
  typeLabels,
}: GpMasterFormProps) {
  const showTypeSelect = allowedTypes.length > 1;

  const typeOptions = allowedTypes.map((type) => ({
    value: type,
    label: typeLabels?.[type] ?? type.replace(/_/g, " "),
  }));

  const form = useForm<ApMastersSchema>({
    resolver: zodResolver(gpMastersSchemaCreate) as any,
    defaultValues: {
      code: "",
      description: "",
      type: allowedTypes.length === 1 ? allowedTypes[0] : "",
      status: true,
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          control={form.control}
          name="code"
          label="Código"
          placeholder="Ingrese el código"
        />

        <FormInput
          control={form.control}
          name="description"
          label="Descripción"
          placeholder="Ingrese la descripción"
        />

        {showTypeSelect && (
          <FormCombobox
            control={form.control}
            name="type"
            label="Tipo"
            placeholder="Seleccione un tipo"
            options={typeOptions}
            required
            allowCreate={false}
          />
        )}

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            <Loader
              className={`mr-2 h-4 w-4 animate-spin ${
                !isSubmitting ? "hidden" : ""
              }`}
            />
            {mode === "create" ? "Crear" : "Actualizar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
