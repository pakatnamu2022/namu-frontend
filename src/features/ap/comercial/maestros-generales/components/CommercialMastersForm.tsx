import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { InputFormField } from "@/shared/components/InputFormField";
import { SwitchFormField } from "@/shared/components/SwitchFormField";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import {
  commercialMastersSchemaCreate,
  CommercialMastersSchema,
} from "../lib/commercialMasters.schema";
import { CommercialMastersResource } from "../lib/commercialMasters.interface";

interface CommercialMastersFormProps {
  onSubmit: (data: CommercialMastersSchema) => void;
  isSubmitting: boolean;
  defaultValues?: CommercialMastersResource;
  mode: "create" | "update";
}

export default function CommercialMastersForm({
  onSubmit,
  isSubmitting,
  defaultValues,
  mode,
}: CommercialMastersFormProps) {
  const form = useForm<CommercialMastersSchema>({
    resolver: zodResolver(commercialMastersSchemaCreate),
    defaultValues: defaultValues || {
      code: "",
      description: "",
      type: "",
      status: true,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <InputFormField
          control={form.control}
          name="code"
          label="Código"
          placeholder="Ingrese el código"
        />

        <InputFormField
          control={form.control}
          name="description"
          label="Descripción"
          placeholder="Ingrese la descripción"
        />

        <InputFormField
          control={form.control}
          name="type"
          label="Tipo"
          placeholder="Ingrese el tipo"
        />

        <SwitchFormField
          control={form.control}
          name="status"
          label="Estado Activo"
        />

        <div className="flex justify-end gap-4">
          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            <Loader
              className={`mr-2 h-4 w-4 animate-spin ${
                !isSubmitting ? "hidden" : ""
              }`}
            />
            {mode === "create" ? "Crear" : "Actualizar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
