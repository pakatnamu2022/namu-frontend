"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import {
  TypeClientSchema,
  typeClientSchemaCreate,
  typeClientSchemaUpdate,
} from "../lib/typeClient.schema";
import { FormInput } from "@/shared/components/FormInput";

interface TypeClientFormProps {
  defaultValues: Partial<TypeClientSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
}

export const TypeClientForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
}: TypeClientFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? typeClientSchemaCreate : typeClientSchemaUpdate,
    ),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            control={form.control}
            name="code"
            label="Cód. Dynamic"
            placeholder="Ej: 01"
          />

          <FormInput
            control={form.control}
            name="description"
            label="Descripción"
            placeholder="Ej: Persona Natural"
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
            {isSubmitting ? "Guardando" : "Guardar Tipo Cliente"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
