"use client";

import { useForm } from "react-hook-form";
import {
  UnitMeasurementSchema,
  unitMeasurementSchemaCreate,
  unitMeasurementSchemaUpdate,
} from "../lib/unitMeasurement.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { FormInput } from "@/shared/components/FormInput";

interface UnitMeasurementFormProps {
  defaultValues: Partial<UnitMeasurementSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
}

export const UnitMeasurementForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
}: UnitMeasurementFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create"
        ? unitMeasurementSchemaCreate
        : unitMeasurementSchemaUpdate,
    ),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            control={form.control}
            name="dyn_code"
            label="Cod. Dynamic"
            placeholder="Ej: UNS"
          />

          <FormInput
            control={form.control}
            name="nubefac_code"
            label="Cod. Nubefac"
            placeholder="Ej: 999"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            control={form.control}
            name="description"
            label="Descripción"
            placeholder="Ej: Servicio"
          />

          <FormInput
            control={form.control}
            name="number_decimals"
            label="Número de decimales"
            placeholder="Ej: 2"
            type="number"
          />
        </div>
        <div className="flex gap-4 w-full justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting ? "Guardando" : "Guardar Unidad de Medida"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
