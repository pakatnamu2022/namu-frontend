import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader, ClipboardCheck, ClipboardList, Gift } from "lucide-react";
import {
  ReceptionEditSchema,
  receptionEditSchema,
} from "../lib/vehicleInspection.schema";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import VehicleInspectionChecklist from "./VehicleInspectionChecklist";
import {
  CHECKLIST_ITEMS,
  fuelLevels,
  oilLevels,
  resultExplanationFields,
  workDetailFields,
} from "../lib/vehicleInspection.constants";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormInput } from "@/shared/components/FormInput";
import { FormTextArea } from "@/shared/components/FormTextArea";
import { FormSwitch } from "@/shared/components/FormSwitch";
import { FormCheckbox } from "@/shared/components/FormCheckbox";

interface ReceptionEditFormProps {
  defaultValues: Partial<ReceptionEditSchema>;
  onSubmit: (data: ReceptionEditSchema) => void;
  isSubmitting?: boolean;
  onCancel?: () => void;
  dateOrderWork?: Date;
}

const courtesyFields = ["courtesy_seat_cover", "paper_floor"] as const;

export const ReceptionEditForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  onCancel,
}: ReceptionEditFormProps) => {
  const form = useForm<any>({
    resolver: zodResolver(receptionEditSchema),
    defaultValues,
    mode: "onChange",
  });

  const handleChecklistChange = (key: string, value: boolean) => {
    form.setValue(key as any, value);
  };

  const setCheckboxGroupValues = (
    fields: readonly string[],
    checked: boolean,
  ) => {
    fields.forEach((field) => {
      form.setValue(field as any, checked, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    });
  };

  const areAllChecked = (fields: readonly string[]) => {
    return fields.every((field) => !!form.getValues(field as any));
  };

  const watchedValues = useWatch({ control: form.control });

  const checklistValues = CHECKLIST_ITEMS.reduce(
    (acc, item) => {
      acc[item.key] = !!(watchedValues as Record<string, unknown>)?.[item.key];
      return acc;
    },
    {} as Record<string, boolean>,
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        {/* Información de Recepción */}
        <GroupFormSection
          title="Información de Recepción"
          icon={ClipboardCheck}
          color="primary"
          cols={{ sm: 2 }}
        >
          <FormInput
            name="mileage"
            label="Kilometraje"
            placeholder="Ingrese el kilometraje"
            type="number"
            control={form.control}
          />

          <FormSelect
            name="fuel_level"
            label="Nivel de Combustible"
            placeholder="Seleccione nivel"
            options={fuelLevels}
            control={form.control}
            strictFilter={true}
          />

          <FormSelect
            name="oil_level"
            label="Nivel de Aceite"
            placeholder="Seleccione nivel"
            options={oilLevels}
            control={form.control}
            strictFilter={true}
          />

          <FormSwitch
            name="washed"
            label="¿Se realizará lavado?"
            text={
              (watchedValues as Record<string, unknown>)?.washed
                ? "Sí, se realizará lavado"
                : "No, no se realizará lavado"
            }
            control={form.control}
          />
        </GroupFormSection>

        {/* Detalles de Trabajo */}
        <GroupFormSection
          title="Detalles de Trabajo"
          icon={ClipboardCheck}
          color="primary"
          cols={{ sm: 2 }}
        >
          <div className="col-span-full flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const shouldSelectAll = !areAllChecked(workDetailFields);
                setCheckboxGroupValues(workDetailFields, shouldSelectAll);
              }}
              disabled={isSubmitting}
            >
              {areAllChecked(workDetailFields)
                ? "Quitar selección"
                : "Seleccionar todo"}
            </Button>
          </div>

          <FormCheckbox
            name="oil_change"
            label="Cambio de aceite y filtro"
            control={form.control}
          />
          <FormCheckbox
            name="check_level_lights"
            label="Revisión de niveles y luces"
            control={form.control}
          />
          <FormCheckbox
            name="general_lubrication"
            label="Engrase general"
            control={form.control}
          />
          <FormCheckbox
            name="rotation_inspection_cleaning"
            label="Rotación de llantas, revisión y limpieza de frenos"
            control={form.control}
          />
          <FormCheckbox
            name="insp_filter_basic_checks"
            label="Inspección de filtro de aire, batería, neumáticos, suspensión y freno de mano"
            control={form.control}
          />
          <FormCheckbox
            name="tire_pressure_inflation_check"
            label="Revisión de presión e inflado de llantas"
            control={form.control}
          />
          <FormCheckbox
            name="alignment_balancing"
            label="Alineación y balanceo"
            control={form.control}
          />
          <FormCheckbox
            name="pad_replace_disc_resurface"
            label="Cambio de pastillas de freno y rectificado de discos"
            control={form.control}
          />
          <FormCheckbox
            name="tire_rotation"
            label="Rotación de llantas"
            control={form.control}
          />
          <div className="col-span-full">
            <FormTextArea
              name="other_work_details"
              label="Otros Trabajos"
              placeholder="Detalles de otros trabajos realizados..."
              control={form.control}
            />
          </div>
        </GroupFormSection>

        {/* Requerimiento del Cliente */}
        <GroupFormSection
          title="Requerimiento del Cliente"
          icon={ClipboardCheck}
          color="gray"
          cols={{ sm: 1 }}
        >
          <FormTextArea
            name="customer_requirement"
            label="Requerimiento del Cliente"
            placeholder="Ingrese el requerimiento del cliente..."
            control={form.control}
          />
        </GroupFormSection>

        {/* Checklist de Verificación */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">
                Checklist de Verificación
              </h3>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const checklistFields = CHECKLIST_ITEMS.map((item) => item.key);
                const shouldSelectAll = !areAllChecked(checklistFields);
                setCheckboxGroupValues(checklistFields, shouldSelectAll);
              }}
              disabled={isSubmitting}
            >
              {areAllChecked(CHECKLIST_ITEMS.map((item) => item.key))
                ? "Quitar selección"
                : "Seleccionar todo"}
            </Button>
          </div>
          <VehicleInspectionChecklist
            values={checklistValues}
            onChange={handleChecklistChange}
            disabled={isSubmitting}
          />
        </div>

        {/* Explicación de Resultados */}
        <GroupFormSection
          title="Explicación de Resultados"
          icon={ClipboardList}
          color="gray"
          cols={{ sm: 2 }}
        >
          <div className="col-span-full flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const shouldSelectAll = !areAllChecked(resultExplanationFields);
                setCheckboxGroupValues(
                  resultExplanationFields,
                  shouldSelectAll,
                );
              }}
              disabled={isSubmitting}
            >
              {areAllChecked(resultExplanationFields)
                ? "Quitar selección"
                : "Seleccionar todo"}
            </Button>
          </div>

          <FormCheckbox
            name="explanation_work_performed"
            label="Explicación de trabajos realizados"
            control={form.control}
            disabled={isSubmitting}
          />
          <FormCheckbox
            name="price_explanation"
            label="Explicación de precios"
            control={form.control}
            disabled={isSubmitting}
          />
          <FormCheckbox
            name="confirm_additional_work"
            label="Confirmación de realización de trabajos adicionales"
            control={form.control}
            disabled={isSubmitting}
          />
          <FormCheckbox
            name="clarification_customer_concerns"
            label="Aclaración de inquietudes del cliente"
            control={form.control}
            disabled={isSubmitting}
          />
          <FormCheckbox
            name="exterior_cleaning"
            label="Limpieza exterior"
            control={form.control}
            disabled={isSubmitting}
          />
          <FormCheckbox
            name="interior_cleaning"
            label="Limpieza interior"
            control={form.control}
            disabled={isSubmitting}
          />
          <FormCheckbox
            name="keeps_spare_parts"
            label="Se queda con repuestos"
            control={form.control}
            disabled={isSubmitting}
          />
          <FormCheckbox
            name="valuable_objects"
            label="Objetos de valor"
            control={form.control}
            disabled={isSubmitting}
          />
        </GroupFormSection>

        {/* Items de Cortesía */}
        <GroupFormSection
          title="Items de Cortesía"
          icon={Gift}
          color="gray"
          cols={{ sm: 2 }}
        >
          <div className="col-span-full flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const shouldSelectAll = !areAllChecked(courtesyFields);
                setCheckboxGroupValues(courtesyFields, shouldSelectAll);
              }}
              disabled={isSubmitting}
            >
              {areAllChecked(courtesyFields)
                ? "Quitar selección"
                : "Seleccionar todo"}
            </Button>
          </div>

          <FormCheckbox
            name="courtesy_seat_cover"
            label="Cobertor de asiento"
            control={form.control}
            disabled={isSubmitting}
          />
          <FormCheckbox
            name="paper_floor"
            label="Piso de papel"
            control={form.control}
            disabled={isSubmitting}
          />
        </GroupFormSection>

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
            {isSubmitting ? "Guardando" : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
