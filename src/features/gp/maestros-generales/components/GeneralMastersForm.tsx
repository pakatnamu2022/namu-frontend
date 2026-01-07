import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import {
  generalMastersSchemaCreate,
  GeneralMastersSchema,
} from "../lib/generalMasters.schema";
import { GeneralMastersResource } from "../lib/generalMasters.interface";
import { FormInput } from "@/shared/components/FormInput";
import { FormSwitch } from "@/shared/components/FormSwitch";
import { FormSelect } from "@/shared/components/FormSelect";
import { useGeneralMastersTypes } from "../lib/generalMasters.hook";
import { useMemo } from "react";

interface GeneralMastersFormProps {
  onSubmit: (data: GeneralMastersSchema) => void;
  isSubmitting: boolean;
  defaultValues?: GeneralMastersResource;
  mode: "create" | "update";
  onCancel?: () => void;
}

export default function GeneralMastersForm({
  onSubmit,
  isSubmitting,
  defaultValues,
  mode,
  onCancel,
}: GeneralMastersFormProps) {
  const { data: typesData, isLoading: isLoadingTypes } =
    useGeneralMastersTypes();

  const typeOptions = useMemo(() => {
    if (!typesData?.data) return [];
    return typesData.data.map((type) => ({
      value: type,
      label: type.replace(/_/g, " "),
    }));
  }, [typesData]);

  const form = useForm<GeneralMastersSchema>({
    resolver: zodResolver(generalMastersSchemaCreate) as any,
    defaultValues: defaultValues || {
      code: "",
      description: "",
      type: "",
      value: "",
      status: true,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          control={form.control}
          name="code"
          label="Código"
          placeholder="Ingrese el código"
        />

        <FormInput
          control={form.control}
          name="description"
          label="Descripción"
          placeholder="Ingrese la descripción"
        />

        <FormSelect
          control={form.control}
          name="type"
          label="Tipo"
          placeholder="Seleccione el tipo"
          options={typeOptions}
          isLoadingOptions={isLoadingTypes}
          required
        />

        <FormInput
          control={form.control}
          name="value"
          label="Valor"
          placeholder="Ingrese el valor (opcional)"
        />

        {mode === "update" && (
          <FormSwitch
            label="Estado"
            control={form.control}
            text={form.watch("status") ? "Activo" : "Inactivo"}
            name="status"
          />
        )}

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>

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
