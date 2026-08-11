import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Loader } from "lucide-react";
import {
  ObjectiveSedePeriodPvSchema,
  objectiveSedePeriodPvSchema,
} from "../lib/objectiveSedePeriodPv.schema.ts";
import { FormSelect } from "@/shared/components/FormSelect.tsx";
import { useMySedes } from "@/features/gp/maestro-general/sede/lib/sede.hook.ts";
import { EMPRESA_AP, MONTH_OPTIONS } from "@/core/core.constants.ts";
import { generateYear } from "@/core/core.function.ts";

interface ObjectiveSedePeriodPvFormProps {
  defaultValues: Partial<ObjectiveSedePeriodPvSchema>;
  onSubmit: (data: ObjectiveSedePeriodPvSchema) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
}

export const ObjectiveSedePeriodPvForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
}: ObjectiveSedePeriodPvFormProps) => {
  const form = useForm<ObjectiveSedePeriodPvSchema>({
    resolver: zodResolver(objectiveSedePeriodPvSchema),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });
  const YEAR_OPTIONS = generateYear().map((year) => ({
    value: year.toString(),
    label: year.toString(),
  }));

  const { data: sedes = [], isLoading: isLoadingSedes } = useMySedes({
    company: EMPRESA_AP.id,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormSelect
            control={form.control}
            name="sede_id"
            label="Sede"
            placeholder="Seleccione sede"
            options={sedes.map((item) => ({
              label: item.description,
              value: item.id.toString(),
            }))}
            isLoadingOptions={isLoadingSedes}
            disabled={mode === "update"}
            strictFilter
            required
          />

          <FormSelect
            control={form.control}
            name="year"
            label="Año"
            options={YEAR_OPTIONS}
            disabled={mode === "update"}
            required
          />

          <FormSelect
            control={form.control}
            name="month"
            label="Mes"
            options={MONTH_OPTIONS}
            disabled={mode === "update"}
            required
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
            {isSubmitting
              ? "Guardando"
              : mode === "update"
                ? "Actualizar Objetivo"
                : "Crear Objetivo"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
