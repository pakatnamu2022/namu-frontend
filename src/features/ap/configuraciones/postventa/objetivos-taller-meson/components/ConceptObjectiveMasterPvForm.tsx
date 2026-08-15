import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Loader, X } from "lucide-react";
import {
  ConceptObjectivePvSchema,
  conceptObjectivePvSchemaCreate,
  conceptObjectivePvSchemaUpdate,
} from "../lib/conceptObjectiveMasterPv.schema.ts";
import { FormTextArea } from "@/shared/components/FormTextArea.tsx";
import { FormSwitch } from "@/shared/components/FormSwitch.tsx";
import { FormSelect } from "@/shared/components/FormSelect.tsx";
import { MultiSelectTags } from "@/shared/components/MultiSelectTags.tsx";
import {
  AREA_TALLER,
  CONCEPT_OBJECTIVE_PV_AREA_OPTIONS,
} from "../lib/conceptObjectiveMasterPv.constants.ts";
import { useAllTypesPlanning } from "@/features/ap/configuraciones/postventa/tipos-planificacion/lib/typesPlanning.hook.ts";

interface ConceptObjectivePvFormProps {
  defaultValues: Partial<ConceptObjectivePvSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancelEdit?: () => void;
}

export const ConceptObjectivePvForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancelEdit,
}: ConceptObjectivePvFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create"
        ? conceptObjectivePvSchemaCreate
        : conceptObjectivePvSchemaUpdate,
    ),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });

  const { data: typesPlanning = [], isLoading: loadingTypesPlanning } =
    useAllTypesPlanning();

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
    if (isVehicularCrossing) {
      form.setValue("description", "Paso Vehicular", {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    }
  }, [isVehicularCrossing]);

  useEffect(() => {
    if (hasTypePlanning && isVehicularCrossing) {
      form.setValue("is_vehicular_crossing", false);
    }
  }, [hasTypePlanning]);

  const handleSubmit = (data: any) => {
    const isTallerSubmit = data.area_id === AREA_TALLER.toString();
    onSubmit({
      ...data,
      is_vehicular_crossing: isTallerSubmit
        ? data.is_vehicular_crossing
        : false,
      type_planning_ids: isTallerSubmit ? data.type_planning_ids : [],
    });
    form.reset({
      area_id: data.area_id,
      description: "",
      is_vehicular_crossing: false,
      type_planning_ids: [],
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 w-full"
      >
        <div className="grid grid-cols-1 gap-4">
          <FormSelect
            control={form.control}
            name="area_id"
            label="Área"
            options={CONCEPT_OBJECTIVE_PV_AREA_OPTIONS}
            required
          />

          <FormTextArea
            control={form.control}
            name="description"
            label="Descripción"
            placeholder="Ej: Objetivo de venta de repuestos por orden de trabajo"
            rows={3}
          />

          {showTypePlanning && (
            <div className="space-y-2">
              <MultiSelectTags
                control={form.control}
                name="type_planning_ids"
                label="Tipos de Planificación"
                description="Selecciona los tipos de planificación que aplican a este concepto"
                placeholder="Selecciona tipos de planificación"
                searchPlaceholder="Buscar tipo de planificación..."
                options={typesPlanning}
                disabled={loadingTypesPlanning}
                getDisplayValue={(item) => item.description}
                getSecondaryText={(item) => item.code}
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={loadingTypesPlanning || typesPlanning.length === 0}
                  onClick={() =>
                    form.setValue(
                      "type_planning_ids",
                      typesPlanning.map((item) => item.id),
                      { shouldValidate: true },
                    )
                  }
                >
                  Seleccionar todos
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!hasTypePlanning}
                  onClick={() =>
                    form.setValue("type_planning_ids", [], {
                      shouldValidate: true,
                    })
                  }
                >
                  Limpiar
                </Button>
              </div>
            </div>
          )}

          {showVehicularCrossing && (
            <FormSwitch
              control={form.control}
              name="is_vehicular_crossing"
              label="Paso Vehicular"
              text={form.watch("is_vehicular_crossing") ? "Sí" : "No"}
            />
          )}
        </div>

        <div className="flex gap-4 w-full justify-end">
          {mode === "update" && (
            <Button type="button" variant="outline" onClick={onCancelEdit}>
              <X className="mr-2 h-4 w-4" />
              Cancelar edición
            </Button>
          )}

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
