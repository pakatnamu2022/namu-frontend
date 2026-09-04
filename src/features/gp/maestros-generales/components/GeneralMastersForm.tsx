import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import {
  generalMastersSchemaCreate,
  GeneralMastersSchema,
} from "../lib/generalMasters.schema";
import { FormInput } from "@/shared/components/FormInput";
import { FormCombobox } from "@/shared/components/FormCombobox";
import { useGeneralMastersTypes } from "../lib/generalMasters.hook";
import { useMemo } from "react";

interface GeneralMastersFormProps {
  onSubmit: (data: GeneralMastersSchema) => void;
  isSubmitting: boolean;
  defaultValues?: GeneralMastersSchema;
  mode: "create" | "update";
  onCancel?: () => void;
  lockedCode?: boolean;
  lockedDescription?: boolean;
  lockedType?: boolean;
  allowedTypes?: string[];
}

export default function GeneralMastersForm({
  onSubmit,
  isSubmitting,
  defaultValues,
  mode,
  onCancel,
  lockedCode,
  lockedDescription,
  lockedType,
  allowedTypes,
}: GeneralMastersFormProps) {
  const { data: typesData, isLoading: isLoadingTypes } =
    useGeneralMastersTypes();

  const typeOptions = useMemo(() => {
    if (allowedTypes) {
      return allowedTypes.map((type) => ({
        value: type,
        label: type.replace(/_/g, " "),
      }));
    }
    if (!typesData?.data) return [];
    return typesData.data.map((type) => ({
      value: type,
      label: type.replace(/_/g, " "),
    }));
  }, [typesData, allowedTypes]);

  const form = useForm<GeneralMastersSchema>({
    resolver: zodResolver(generalMastersSchemaCreate) as any,
    defaultValues: defaultValues || {
      code: "",
      description: "",
      type: "",
      value: "",
      effective_from: "",
      effective_to: "",
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
          disabled={lockedCode}
        />

        <FormInput
          control={form.control}
          name="description"
          label="Descripción"
          placeholder="Ingrese la descripción"
          disabled={lockedDescription}
        />

        {!lockedType && (
          <FormCombobox
            control={form.control}
            name="type"
            label="Tipo"
            placeholder={allowedTypes ? "Seleccione un tipo" : "Seleccione o escriba un tipo"}
            options={typeOptions}
            isLoadingOptions={allowedTypes ? false : isLoadingTypes}
            required
            allowCreate={!allowedTypes}
          />
        )}

        <FormInput
          control={form.control}
          name="value"
          label="Valor"
          placeholder="Ingrese el valor (opcional)"
        />

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            control={form.control}
            name="effective_from"
            type="date"
            label="Vigente desde"
            optional
            tooltip="Déjelo vacío si este valor no cambia por fecha. Para versionar un parámetro que ya existe (ej. RMV, UIT), cierre la vigencia de la fila actual (Vigente hasta) y cree una nueva fila con el mismo código y esta fecha."
          />
          <FormInput
            control={form.control}
            name="effective_to"
            type="date"
            label="Vigente hasta"
            optional
            tooltip="Déjelo vacío si sigue vigente indefinidamente."
          />
        </div>

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
