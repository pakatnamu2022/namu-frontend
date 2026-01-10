import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Loader } from "lucide-react";
import {
  ReasonsAdjustmentSchema,
  reasonsAdjustmentSchemaCreate,
  reasonsAdjustmentSchemaUpdate,
} from "@/features/ap/configuraciones/postventa/motivos-ajuste/lib/reasonsAdjustment.schema.ts";
import { AP_MASTER_TYPE } from "@/features/ap/ap-master/lib/apMaster.constants";
import { FormSelect } from "@/shared/components/FormSelect.tsx";

interface ReasonsAdjustmentFormProps {
  defaultValues: Partial<ReasonsAdjustmentSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
}

const reasonsAjustmentSelectOptions = [
  {
    label: "Ajuste de Ingreso",
    value: AP_MASTER_TYPE.TYPE_ADJUSTMENT_IN,
  },
  {
    label: "Ajuste de Salida",
    value: AP_MASTER_TYPE.TYPE_ADJUSTMENT_OUT,
  },
];

export const ReasonsAdjustmentForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
}: ReasonsAdjustmentFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create"
        ? reasonsAdjustmentSchemaCreate
        : reasonsAdjustmentSchemaUpdate
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
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cod.</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: RB" {...field} />
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
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Robo / Regalo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 gap-4">
          <FormSelect
            label="Tipo de Motivo"
            name="type"
            control={form.control}
            options={reasonsAjustmentSelectOptions}
            placeholder="Seleccione un tipo de motivo"
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
            {isSubmitting ? "Guardando" : "Guardar Motivo"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
