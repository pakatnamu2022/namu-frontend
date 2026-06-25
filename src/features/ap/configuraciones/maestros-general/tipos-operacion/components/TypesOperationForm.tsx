"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import {
  TypesOperationSchema,
  typesOperationSchemaCreate,
  typesOperationSchemaUpdate,
} from "../lib/typesOperation.schema";
import { FormInput } from "@/shared/components/FormInput";

interface TypesOperationFormProps {
  defaultValues: Partial<TypesOperationSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
}

export const TypesOperationForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
}: TypesOperationFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create"
        ? typesOperationSchemaCreate
        : typesOperationSchemaUpdate,
    ),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 gap-4">
          <FormInput
            control={form.control}
            name="description"
            label="Nombre"
            placeholder="Ej: Venta de Bienes"
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
            {isSubmitting ? "Guardando" : "Guardar Tipo de Operación"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
