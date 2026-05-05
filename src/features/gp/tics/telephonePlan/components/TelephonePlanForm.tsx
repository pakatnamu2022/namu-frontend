"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  TelephonePlanSchema,
  telephonePlanSchemaCreate,
  telephonePlanSchemaUpdate,
} from "../lib/telephonePlan.schema";
import { FormInput } from "@/shared/components/FormInput";
import { FormTextArea } from "@/shared/components/FormTextArea";

interface TelephonePlanFormProps {
  defaultValues: Partial<TelephonePlanSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
}

export const TelephonePlanForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
}: TelephonePlanFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create"
        ? telephonePlanSchemaCreate
        : telephonePlanSchemaUpdate,
    ),
    defaultValues,
    mode: "onChange",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 gap-4">
          <FormInput
            control={form.control}
            name="name"
            label="Nombre del plan"
            placeholder="Ej: Plan Básico"
            type="text"
          />

          <FormInput
            control={form.control}
            name="price"
            label="Precio"
            placeholder="Ej: 29.90"
            type="number"
          />

          <FormTextArea
            control={form.control}
            name="description"
            label="Descripción"
            placeholder="Describe el plan telefónico..."
          />
        </div>

        <div className="flex gap-4 w-full justify-end">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            {isSubmitting ? "Guardando..." : "Guardar plan"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
