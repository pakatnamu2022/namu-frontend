import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Loader } from "lucide-react";
import {
  TypesPlanningSchema,
  typesPlanningSchemaCreate,
  typesPlanningSchemaUpdate,
} from "../lib/typesPlanning.schema.ts";
import { FormInput } from "@/shared/components/FormInput.tsx";
import { FormSwitch } from "@/shared/components/FormSwitch.tsx";
import { FormSelect } from "@/shared/components/FormSelect.tsx";

interface TypesPlanningFormProps {
  defaultValues: Partial<TypesPlanningSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
}

export const TypesPlanningForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
}: TypesPlanningFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? typesPlanningSchemaCreate : typesPlanningSchemaUpdate,
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
            label="Cod."
            placeholder="Ej: MT"
          />

          <FormInput
            control={form.control}
            name="description"
            label="Descripción"
            placeholder="Ej: Mantención"
          />

          <FormSwitch
            control={form.control}
            name="validate_receipt"
            label="Validar Recepción"
            text={form.watch("validate_receipt") ? "Si" : "No"}
          />

          <FormSwitch
            control={form.control}
            name="validate_labor"
            label="Validar Mano de Obra"
            text={form.watch("validate_labor") ? "Si" : "No"}
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <FormSelect
            control={form.control}
            name="type_document"
            label="Tipo de Documento"
            options={[
              { value: "INTERNA", label: "INTERNA" },
              { value: "PAYMENT_RECEIPTS", label: "COMPROBANTE DE PAGO" },
            ]}
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
            {isSubmitting ? "Guardando" : "Guardar Tipo de Planificación"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
