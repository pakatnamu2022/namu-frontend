import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Loader,
  ClipboardCheck,
  PenLine,
  Camera,
  ClipboardList,
  Gift,
} from "lucide-react";
import { SignaturePad } from "./SignaturePad";
import {
  VehicleInspectionSchema,
  vehicleInspectionSchemaCreate,
  vehicleInspectionSchemaUpdate,
} from "../lib/vehicleInspection.schema";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import VehicleInspectionChecklist from "./VehicleInspectionChecklist";
import VehicleDamageMarker from "./VehicleDamageMarker";
import { CHECKLIST_ITEMS } from "../lib/vehicleInspection.constants";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormInput } from "@/shared/components/FormInput";
import { FormInputText } from "@/shared/components/FormInputText";
import { FileUploadWithCamera } from "@/shared/components/FileUploadWithCamera";
import { FormSwitch } from "@/shared/components/FormSwitch";
import { FormCheckbox } from "@/shared/components/FormCheckbox";
import { DateTimePickerForm } from "@/shared/components/DateTimePickerForm";

interface VehicleInspectionFormProps {
  defaultValues: Partial<VehicleInspectionSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
  dateOrderWork?: Date;
}

// Niveles de combustible
const fuelLevels = [
  { label: "0 (0%)", value: "0" },
  { label: "1/4 (25%)", value: "1/4" },
  { label: "2/4 (50%)", value: "2/4" },
  { label: "3/4 (75%)", value: "3/4" },
  { label: "4/4 (100%)", value: "4/4" },
];

//Niveles de Aceite
const oilLevels = [
  { label: "0 (0%)", value: "0" },
  { label: "1/4 (25%)", value: "1/4" },
  { label: "2/4 (50%)", value: "2/4" },
  { label: "3/4 (75%)", value: "3/4" },
  { label: "4/4 (100%)", value: "4/4" },
];

export const VehicleInspectionForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
  dateOrderWork = undefined,
}: VehicleInspectionFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create"
        ? vehicleInspectionSchemaCreate
        : vehicleInspectionSchemaUpdate,
    ),
    defaultValues,
    mode: "onChange",
  });

  const handleChecklistChange = (key: string, value: boolean) => {
    form.setValue(key as any, value);
  };

  const handleDamagesChange = (damages: any[]) => {
    form.setValue("damages", damages);
  };

  const checklistValues = CHECKLIST_ITEMS.reduce(
    (acc, item) => {
      // eslint-disable-next-line react-hooks/incompatible-library
      acc[item.key] = form.watch(item.key as any) || false;
      return acc;
    },
    {} as Record<string, boolean>,
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        {/* Información General */}
        <GroupFormSection
          title="Información de Recepción"
          icon={ClipboardCheck}
          color="primary"
          cols={{ sm: 2 }}
        >
          <DateTimePickerForm
            name="inspection_date"
            label="Fecha y Hora Estimada de Recepción"
            control={form.control}
            placeholder="Seleccione fecha y hora"
            disabledRange={{ before: dateOrderWork || new Date() }}
          />

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
              form.watch("washed")
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
          <div className="col-span-full">
            <FormInputText
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
          <FormInputText
            name="customer_requirement"
            label="Requerimiento del Cliente"
            placeholder="Ingrese el requerimiento del cliente..."
            control={form.control}
          />
        </GroupFormSection>

        {/* Checklist de Verificación */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Checklist de Verificación</h3>
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

        {/* Fotos del Vehículo - Solo visible cuando dirty_unit está marcado */}
        <GroupFormSection
          title="Fotos del estado de ingreso del vehículo"
          icon={Camera}
          color="orange"
          cols={{ sm: 2 }}
        >
          <FormField
            control={form.control}
            name="photo_front"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FileUploadWithCamera
                    label="Foto Frontal"
                    accept="image/*"
                    value={field.value}
                    onChange={(file) => field.onChange(file)}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="photo_back"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FileUploadWithCamera
                    label="Foto Trasera"
                    accept="image/*"
                    value={field.value}
                    onChange={(file) => field.onChange(file)}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="photo_left"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FileUploadWithCamera
                    label="Foto Lateral Izquierda"
                    accept="image/*"
                    value={field.value}
                    onChange={(file) => field.onChange(file)}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="photo_right"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FileUploadWithCamera
                    label="Foto Lateral Derecha"
                    accept="image/*"
                    value={field.value}
                    onChange={(file) => field.onChange(file)}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </GroupFormSection>

        {/* Marcador de Daños */}
        <div className="space-y-4">
          <VehicleDamageMarker
            damages={form.watch("damages") || []}
            onChange={handleDamagesChange}
            disabled={isSubmitting}
          />
        </div>

        {/* Observaciones Generales */}
        <GroupFormSection
          title="Observaciones Generales"
          icon={ClipboardCheck}
          color="gray"
          cols={{ sm: 1 }}
        >
          <FormInputText
            name="general_observations"
            label="Observaciones"
            placeholder="Ingrese observaciones generales de la recepción..."
            control={form.control}
          />
        </GroupFormSection>

        {/* Sección de Firmas */}
        <GroupFormSection
          title="Firmas de Conformidad"
          icon={PenLine}
          color="primary"
          cols={{ sm: 1 }}
        >
          <FormField
            control={form.control}
            name="customer_signature"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <SignaturePad
                    label="Firma del Cliente"
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isSubmitting}
                    required
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
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
            {isSubmitting ? "Guardando" : "Guardar Recepción"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
