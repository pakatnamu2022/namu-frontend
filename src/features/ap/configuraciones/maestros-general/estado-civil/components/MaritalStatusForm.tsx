"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import {
  MaritalStatusSchema,
  maritalStatusSchemaCreate,
  maritalStatusSchemaUpdate,
} from "../lib/maritalStatus.schema";
import { FormInput } from "@/shared/components/FormInput";

interface MaritalStatusFormProps {
  defaultValues: Partial<MaritalStatusSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
}

export const MaritalStatusForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
}: MaritalStatusFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? maritalStatusSchemaCreate : maritalStatusSchemaUpdate,
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
            placeholder="Ej: Soltero"
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
            {isSubmitting ? "Guardando" : "Guardar Estado Civil"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
