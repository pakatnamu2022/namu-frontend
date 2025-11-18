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
  WorkerSchema,
  periodSchemaCreate,
  periodSchemaUpdate,
} from "../lib/worker.schema";
import { Loader } from "lucide-react";
import { Link } from "react-router-dom";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { WORKER } from "../lib/worker.constant";

interface PeriodFormProps {
  defaultValues: Partial<WorkerSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

export const WorkerForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: PeriodFormProps) => {
  const { ABSOLUTE_ROUTE, MODEL } = WORKER;
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? periodSchemaCreate : periodSchemaUpdate
    ),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DatePickerFormField
            control={form.control}
            name="start_date"
            label="Fecha de Inicio"
            placeholder="Elige una fecha"
            captionLayout="dropdown"
          />

          <DatePickerFormField
            control={form.control}
            name="end_date"
            label="Fecha de Fin"
            placeholder="Elige una fecha"
            captionLayout="dropdown"
          />
        </div>

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
            {isSubmitting ? "Guardando" : `Guardar ${MODEL}`}
          </Button>
        </div>
      </form>
    </Form>
  );
};
