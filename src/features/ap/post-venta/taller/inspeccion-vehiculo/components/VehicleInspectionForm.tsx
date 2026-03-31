import { useForm, useWatch } from "react-hook-form";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
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
import { BUSINESS_PARTNERS } from "@/core/core.constants";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import VehicleInspectionChecklist from "./VehicleInspectionChecklist";
import VehicleDamageMarker from "./VehicleDamageMarker";
import { CHECKLIST_ITEMS } from "../lib/vehicleInspection.constants";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormInput } from "@/shared/components/FormInput";
import { FormTextArea } from "@/shared/components/FormTextArea";
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
  ownerName?: string;
  contactName?: string;
  ownerDocumentTypeId?: string;
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
  ownerName,
  contactName,
  ownerDocumentTypeId,
}: VehicleInspectionFormProps) => {
  const isOwnerNatural =
    ownerDocumentTypeId === BUSINESS_PARTNERS.TYPE_DOCUMENT_DNI_ID;

  // Si el propietario no es persona natural, forzar signer_type a CONTACT
  useEffect(() => {
    if (!isOwnerNatural) {
      form.setValue("signer_type", "CONTACT");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOwnerNatural]);
  const workDetailFields = [
    "oil_change",
    "check_level_lights",
    "general_lubrication",
    "rotation_inspection_cleaning",
    "insp_filter_basic_checks",
    "tire_pressure_inflation_check",
    "alignment_balancing",
    "pad_replace_disc_resurface",
  ] as const;

  const resultExplanationFields = [
    "explanation_work_performed",
    "price_explanation",
    "confirm_additional_work",
    "clarification_customer_concerns",
    "exterior_cleaning",
    "interior_cleaning",
    "keeps_spare_parts",
    "valuable_objects",
  ] as const;

  const courtesyFields = ["courtesy_seat_cover", "paper_floor"] as const;

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
        {/* Información General */}
        <GroupFormSection
          title="Información de Recepción"
          icon={ClipboardCheck}
          color="primary"
          cols={{ sm: 2 }}
        >
          <DateTimePickerForm
            name="inspection_date"
            label="Fecha y Hora de Recepción"
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
          <FormField
            control={form.control}
            name="photo_optional_1"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FileUploadWithCamera
                    label="Foto Opcional 1"
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
            name="photo_optional_2"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FileUploadWithCamera
                    label="Foto Opcional 2"
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
            damages={
              ((watchedValues as Record<string, unknown>)?.damages as any[]) ||
              []
            }
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
          <FormTextArea
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
          {/* Switch de firmante */}
          <div className="flex flex-col gap-3">
            <FormField
              control={form.control}
              name="signer_type"
              render={({ field }) => {
                // Si el propietario no es persona natural (DNI), forzar contacto
                const forcedContact = !isOwnerNatural;
                const isContact = forcedContact || field.value === "CONTACT";
                const signerName = isContact
                  ? (contactName || "Sin contacto")
                  : (ownerName || "Sin propietario");
                return (
                  <FormItem>
                    <div className="flex flex-row items-center justify-between rounded-md border shadow-xs bg-background px-4 py-3 gap-4">
                      <div className="flex flex-col gap-0.5">
                        <p className="text-sm font-medium leading-tight">
                          ¿Quién firma?
                        </p>
                        <p className="text-xs text-muted-foreground leading-tight">
                          {isContact ? "Contacto" : "Propietario"}
                          {forcedContact && (
                            <span className="ml-1 text-amber-600">
                              (el propietario es empresa, solo puede firmar el contacto)
                            </span>
                          )}
                        </p>
                        <p className="text-base font-semibold text-foreground leading-snug mt-0.5">
                          {signerName}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-sm font-medium ${!isContact ? "text-primary" : "text-muted-foreground"}`}>
                          Propietario
                        </span>
                        <FormControl>
                          <Switch
                            checked={isContact}
                            onCheckedChange={(checked) =>
                              field.onChange(checked ? "CONTACT" : "OWNER")
                            }
                            disabled={isSubmitting || forcedContact}
                          />
                        </FormControl>
                        <span className={`text-sm font-medium ${isContact ? "text-primary" : "text-muted-foreground"}`}>
                          Contacto
                        </span>
                      </div>
                    </div>
                  </FormItem>
                );
              }}
            />
          </div>

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
