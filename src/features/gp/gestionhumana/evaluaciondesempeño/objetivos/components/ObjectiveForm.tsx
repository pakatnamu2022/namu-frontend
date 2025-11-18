"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ObjectiveSchema,
  objectiveSchemaCreate,
  objectiveSchemaUpdate,
} from "../lib/objective.schema";
import { Loader } from "lucide-react";
import { Link } from "react-router-dom";
import { FormSelect } from "@/shared/components/FormSelect";
import { useAllMetrics } from "../../metricas/lib/metric.hook";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { OBJECTIVE } from "../lib/objective.constants";

interface ObjectiveFormProps {
  defaultValues: Partial<ObjectiveSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

export const ObjectiveForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: ObjectiveFormProps) => {
  const { ABSOLUTE_ROUTE } = OBJECTIVE;
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? objectiveSchemaCreate : objectiveSchemaUpdate
    ),
    defaultValues: {
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
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 w-full formlayout"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Productividad" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Productividad del equipo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
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

        {/* <pre>
          <code className="text-xs text-muted-foreground">
            {JSON.stringify(form.getValues(), null, 2)}
          </code>
        </pre> */}

        <div className="flex gap-4 w-full justify-end">
          <Link to={ABSOLUTE_ROUTE}>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>

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
