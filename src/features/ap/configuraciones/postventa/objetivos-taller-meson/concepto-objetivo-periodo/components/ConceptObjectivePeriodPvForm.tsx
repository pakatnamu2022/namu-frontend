import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Loader } from "lucide-react";
import {
  ConceptObjectivePeriodPvSchema,
  conceptObjectivePeriodPvSchema,
} from "../lib/conceptObjectivePeriodPv.schema.ts";
import { FormInput } from "@/shared/components/FormInput.tsx";
import { FormSwitch } from "@/shared/components/FormSwitch.tsx";
import { FormSelect } from "@/shared/components/FormSelect.tsx";
import { FormTextArea } from "@/shared/components/FormTextArea.tsx";
import { MultiSelectTags } from "@/shared/components/MultiSelectTags.tsx";
import ConceptObjectiveAdvisorsField from "./ConceptObjectiveAdvisorsField.tsx";
import {
  AREA_TALLER,
  CONCEPT_OBJECTIVE_PERIOD_PV_AREA_OPTIONS,
} from "../lib/conceptObjectivePeriodPv.constants.ts";
import { useAllTypesPlanning } from "@/features/ap/configuraciones/postventa/tipos-planificacion/lib/typesPlanning.hook.ts";
import { useAllWorkers } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook.ts";

interface ConceptObjectivePeriodPvFormProps {
  defaultValues: Partial<ConceptObjectivePeriodPvSchema>;
  onSubmit: (data: ConceptObjectivePeriodPvSchema) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
  sedeId?: number;
}

export const ConceptObjectivePeriodPvForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
  sedeId,
}: ConceptObjectivePeriodPvFormProps) => {
  const form = useForm({
    resolver: zodResolver(conceptObjectivePeriodPvSchema),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });

  const { data: typesPlanning = [], isLoading: loadingTypesPlanning } =
    useAllTypesPlanning();
  const { data: workers = [], isLoading: loadingWorkers } = useAllWorkers(
    { sede_id: sedeId || undefined },
    !!sedeId,
  );

  const isTaller = form.watch("area_id") === AREA_TALLER.toString();
  const isVehicularCrossing = form.watch("is_vehicular_crossing");
  const typePlanningIds = form.watch("type_planning_ids") || [];
  const hasTypePlanning = typePlanningIds.length > 0;

  const showTypePlanning = isTaller && !isVehicularCrossing;
  const showVehicularCrossing = isTaller && !hasTypePlanning;

  useEffect(() => {
    if (isVehicularCrossing && hasTypePlanning) {
      form.setValue("type_planning_ids", []);
    }
  }, [isVehicularCrossing]);

  useEffect(() => {
    if (hasTypePlanning && isVehicularCrossing) {
      form.setValue("is_vehicular_crossing", false);
    }
  }, [hasTypePlanning]);

  useEffect(() => {
    if (isVehicularCrossing) {
      form.setValue("description", "PASO VEHICULAR", { shouldValidate: true });
      form.setValue("sub_amount", 0, { shouldValidate: true });
    }
  }, [isVehicularCrossing]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormSelect
              control={form.control}
              name="area_id"
              label="Área"
              options={CONCEPT_OBJECTIVE_PERIOD_PV_AREA_OPTIONS}
              required
            />

            {!isVehicularCrossing && (
              <FormInput
                control={form.control}
                name="sub_amount"
                label="Monto del Concepto"
                type="number"
                step="0.01"
                placeholder="0.00"
                required
              />
            )}
          </div>

          <FormTextArea
            control={form.control}
            name="description"
            label="Descripción"
            placeholder="Ej: Venta de vehículos"
            rows={2}
            disabled={isVehicularCrossing}
          />

          {showTypePlanning && (
            <MultiSelectTags
              control={form.control}
              name="type_planning_ids"
              label="Tipos de Planificación"
              placeholder="Selecciona tipos de planificación"
              searchPlaceholder="Buscar tipo de planificación..."
              options={typesPlanning}
              disabled={loadingTypesPlanning}
              getDisplayValue={(item) => item.description}
              getSecondaryText={(item) => item.code}
            />
          )}

          {showVehicularCrossing && (
            <FormSwitch
              control={form.control}
              name="is_vehicular_crossing"
              label="Paso Vehicular"
              text={form.watch("is_vehicular_crossing") ? "Sí" : "No"}
            />
          )}

          <ConceptObjectiveAdvisorsField
            control={form.control}
            workers={workers}
            isLoadingWorkers={loadingWorkers}
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
                ? "Actualizar Concepto"
                : "Agregar Concepto"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
