"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import {
  BankSchema,
  bankSchemaCreate,
  bankSchemaUpdate,
} from "../lib/bank.schema";
import { FormInput } from "@/shared/components/FormInput";

interface BankFormProps {
  defaultValues: Partial<BankSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
}

export const BankForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
}: BankFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? bankSchemaCreate : bankSchemaUpdate,
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
          <FormInput
            control={form.control}
            name="code"
            label="Abreviatura"
            placeholder="Ej: BN"
          />
          <FormInput
            control={form.control}
            name="description"
            label="Nombre"
            placeholder="Ej: Banco de la Nación"
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
            {isSubmitting ? "Guardando" : "Guardar Banco"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
