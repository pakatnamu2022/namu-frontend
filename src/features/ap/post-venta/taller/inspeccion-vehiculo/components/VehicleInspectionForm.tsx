import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader, ClipboardCheck, PenLine } from "lucide-react";
import { SignaturePad } from "./SignaturePad";
import {
  VehicleInspectionSchema,
  vehicleInspectionSchemaCreate,
  vehicleInspectionSchemaUpdate,
} from "../lib/vehicleInspection.schema";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { Textarea } from "@/components/ui/textarea";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { EMPRESA_AP } from "@/core/core.constants";
import {
  POSITION_TYPE,
  STATUS_WORKER,
} from "@/features/gp/gestionhumana/personal/posiciones/lib/position.constant";
import { useAllWorkers } from "@/features/gp/gestionhumana/personal/trabajadores/lib/worker.hook";
import VehicleInspectionChecklist from "./VehicleInspectionChecklist";
import VehicleDamageMarker from "./VehicleDamageMarker";
import { CHECKLIST_ITEMS } from "../lib/vehicleInspection.constants";
import { FormSelect } from "@/shared/components/FormSelect";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { Input } from "@/components/ui/input";

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
        : vehicleInspectionSchemaUpdate
    ),
    defaultValues,
    mode: "onChange",
  });

  const { data: inspectors = [], isLoading: isLoadingInspectors } =
    useAllWorkers({
      cargo_id: POSITION_TYPE.CONSULTANT,
      status_id: STATUS_WORKER.ACTIVE,
      sede$empresa_id: EMPRESA_AP.id,
    });

  const isLoading = isLoadingInspectors;

  const handleChecklistChange = (key: string, value: boolean) => {
    form.setValue(key as any, value);
  };

  const handleDamagesChange = (damages: any[]) => {
    form.setValue("damages", damages);
  };

  if (isLoading) return <FormSkeleton />;

  const checklistValues = CHECKLIST_ITEMS.reduce((acc, item) => {
    acc[item.key] = form.watch(item.key as any) || false;
    return acc;
  }, {} as Record<string, boolean>);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        {/* Información General */}
        <GroupFormSection
          title="Información de Inspección"
          icon={ClipboardCheck}
          iconColor="text-primary"
          bgColor="bg-blue-50"
          cols={{ sm: 2, md: 3 }}
        >
          <FormSelect
            name="inspected_by"
            label="Inspector"
            placeholder="Seleccione inspector"
            options={inspectors.map((item) => ({
              label: item.name,
              value: item.id.toString(),
            }))}
            control={form.control}
            strictFilter={true}
          />

          <DatePickerFormField
            control={form.control}
            name="inspection_date"
            label="Fecha de Inspección"
            placeholder="Selecciona una fecha"
            dateFormat="dd/MM/yyyy"
            captionLayout="dropdown"
            disabled={true}
          />

          <FormField
            control={form.control}
            name="mileage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kilometraje</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Ej: 50000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
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
          iconColor="text-gray-800"
          bgColor="bg-gray-50"
          cols={{ sm: 1 }}
        >
          <FormField
            control={form.control}
            name="general_observations"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observaciones</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Ingrese observaciones generales de la inspección..."
                    rows={4}
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </GroupFormSection>

        {/* Sección de Firmas */}
        <GroupFormSection
          title="Firmas de Conformidad"
          icon={PenLine}
          iconColor="text-primary"
          bgColor="bg-blue-50"
          cols={{ sm: 1, md: 2 }}
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

          <FormField
            control={form.control}
            name="advisor_signature"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <SignaturePad
                    label="Firma del Asesor"
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
