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
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  TaxClassTypesSchema,
  taxClassTypesSchemaCreate,
  taxClassTypesSchemaUpdate,
} from "../lib/taxClassTypes.schema";
import { FormSelect } from "@/src/shared/components/FormSelect";

interface TaxClassTypesFormProps {
  defaultValues: Partial<TaxClassTypesSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
}

const usoOptions = [
  {
    label: "Cliente",
    value: "CLIENTE",
  },
  {
    label: "Proveedor",
    value: "PROVEEDOR",
  },
];

export const TaxClassTypesForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
}: TaxClassTypesFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? taxClassTypesSchemaCreate : taxClassTypesSchemaUpdate
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
          <FormField
            control={form.control}
            name="dyn_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cod. Dynamics</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: EMP" {...field} />
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
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Empleado" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="tax_class"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Clase de Impuesto</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: R_4TA8%" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormSelect
            name="type"
            label="Tipo"
            placeholder="Selecciona un tipo"
            options={usoOptions}
            control={form.control}
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
            {isSubmitting ? "Guardando" : "Guardar Tipo Clase Impuesto"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
