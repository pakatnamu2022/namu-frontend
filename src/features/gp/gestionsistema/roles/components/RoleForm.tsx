"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  RoleSchema,
  roleSchemaCreate,
  roleSchemaUpdate,
} from "../lib/role.schema";
import { Loader } from "lucide-react";
import { FormInput } from "@/shared/components/FormInput";
import { FormTextArea } from "@/shared/components/FormTextArea";

interface RoleFormProps {
  defaultValues: Partial<RoleSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
}

export const RoleForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
}: RoleFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? roleSchemaCreate : roleSchemaUpdate,
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
            name="nombre"
            label="Nombre"
            placeholder="Ej: Gerente Comercial"
            uppercase
          />

          <FormTextArea
            control={form.control}
            name="descripcion"
            label="Descripción"
            placeholder="Ej: Rol para el Gerente Comercial de DP"
            uppercase
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
            {isSubmitting ? "Guardando" : "Guardar Rol"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
