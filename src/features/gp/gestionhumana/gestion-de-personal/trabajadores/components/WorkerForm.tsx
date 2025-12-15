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
} from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  periodSchemaCreate,
  periodSchemaUpdate,
  workerSignatureSchemaUpdate,
} from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.schema.ts";
import { Loader, PenLine } from "lucide-react";
import { Link } from "react-router-dom";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField.tsx";
import { WORKER } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.constant.ts";
import { SignaturePad } from "@/features/ap/post-venta/taller/inspeccion-vehiculo/components/SignaturePad";
import { GroupFormSection } from "@/shared/components/GroupFormSection";

interface PeriodFormProps {
  defaultValues: any;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update" | "signature";
}

export const WorkerForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: PeriodFormProps) => {
  const { ABSOLUTE_ROUTE, MODEL } = WORKER;

  const getSchema = () => {
    if (mode === "signature") return workerSignatureSchemaUpdate;
    return mode === "create" ? periodSchemaCreate : periodSchemaUpdate;
  };

  const form = useForm<any>({
    resolver: zodResolver(getSchema()) as any,
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });

  // Renderizar formulario de firma
  if (mode === "signature") {
    return (
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 w-full"
        >
          <GroupFormSection
            title="Firma del Trabajador"
            icon={PenLine}
            iconColor="text-primary"
            bgColor="bg-blue-50"
            cols={{ sm: 1 }}
          >
            <FormField
              control={form.control}
              name="worker_signature"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <SignaturePad
                      label="Firma del Trabajador"
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isSubmitting}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </GroupFormSection>

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
              {isSubmitting ? "Guardando" : `Guardar ${MODEL.name}`}
            </Button>
          </div>
        </form>
      </Form>
    );
  }

  // Renderizar formulario normal
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
