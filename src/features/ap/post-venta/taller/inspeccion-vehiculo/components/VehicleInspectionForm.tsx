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
import { Loader, ClipboardCheck, PenLine, Camera } from "lucide-react";
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
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { FormInput } from "@/shared/components/FormInput";
import { FormInputText } from "@/shared/components/FormInputText";
import { FileUploadWithCamera } from "@/shared/components/FileUploadWithCamera";

interface VehicleInspectionFormProps {
  defaultValues: Partial<VehicleInspectionSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
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
          title="Información de Inspección"
          icon={ClipboardCheck}
          color="blue"
          cols={{ sm: 2 }}
        >
          <DatePickerFormField
            control={form.control}
            name="inspection_date"
            label="Fecha de Inspección"
            placeholder="Selecciona una fecha"
            dateFormat="dd/MM/yyyy"
            captionLayout="dropdown"
            disabled={true}
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

        {/* Fotos del Vehículo - Solo visible cuando dirty_unit está marcado */}
        <GroupFormSection
          title="Fotos del estado de ingreso del vehículo (Opcional)"
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
            placeholder="Ingrese observaciones generales de la inspección..."
            control={form.control}
          />
        </GroupFormSection>

        {/* Sección de Firmas */}
        <GroupFormSection
          title="Firmas de Conformidad"
          icon={PenLine}
          color="blue"
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
            {isSubmitting ? "Guardando" : "Guardar Inspección"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
