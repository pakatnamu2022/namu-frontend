"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  ObjectiveSchema,
  objectiveSchemaCreate,
  objectiveSchemaUpdate,
} from "../lib/objective.schema";
import { Loader } from "lucide-react";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormSwitch } from "@/shared/components/FormSwitch";
import { useAllMetrics } from "../../metricas/lib/metric.hook";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { FormTextArea } from "@/shared/components/FormTextArea";

interface ObjectiveFormProps {
  defaultValues: Partial<ObjectiveSchema>;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

export const ObjectiveForm = ({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  mode = "create",
}: ObjectiveFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? objectiveSchemaCreate : objectiveSchemaUpdate,
    ),
    defaultValues: {
      isAscending: true,
      ...defaultValues,
    },
    mode: "onChange",
  });

  const { data, isLoading } = useAllMetrics();

  if (isLoading || !data) {
    return <FormSkeleton />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <FormTextArea
          control={form.control}
          name="name"
          label="Nombre"
          placeholder="Ej: Productividad"
        />

        <FormTextArea
          control={form.control}
          name="description"
          label="Descripción"
          placeholder="Ej: Productividad del equipo"
        />

        <FormSelect
          control={form.control}
          name="metric_id"
          label="Métrica"
          placeholder="Selecciona una métrica"
          options={data.map((metric) => ({
            value: metric.id.toString(),
            label: metric.name,
          }))}
        />
        <FormSwitch
          control={form.control}
          name="isAscending"
          label="Lógica de evaluación"
          text={form.watch("isAscending") ? "Ascendente" : "Descendente"}
          textDescription={
            form.watch("isAscending")
              ? "A mayor valor, mejor desempeño"
              : "A menor valor, mejor desempeño"
          }
          autoHeight
        />

        <div className="flex gap-4 w-full justify-end">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}

          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting ? "Guardando" : "Guardar Objetivo"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
