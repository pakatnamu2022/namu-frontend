"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  ReceptionChecklistSchema,
  receptionChecklistSchemaUpdate,
} from "../lib/shipmentsReceptions.schema";
import { useAllDeliveryChecklist } from "@/features/ap/configuraciones/vehiculos/checklist-entrega/lib/deliveryChecklist.hook";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { ChecklistField } from "@/shared/components/ChecklistField";
import {
  useReceptionChecklistById,
  useVehicleByShippingGuide,
} from "../lib/shipmentsReceptions.hook";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { FormSubmitConfirmation } from "@/shared/components/FormSubmitConfirmation";
import { useNavigate } from "react-router-dom";
import { SHIPMENTS_RECEPTIONS } from "../lib/shipmentsReceptions.constants";
import {
  FileText,
  Car,
  Camera,
  ClipboardList,
  AlertTriangle,
  Gauge,
} from "lucide-react";
import { CONTROL_UNITS } from "../../control-unidades/lib/controlUnits.constants";
import { FormInput } from "@/shared/components/FormInput";
import { FileUploadWithCamera } from "@/shared/components/FileUploadWithCamera";
import VehicleDamageMarker from "@/features/ap/post-venta/taller/inspeccion-vehiculo/components/VehicleDamageMarker";
import { GroupFormSection } from "@/shared/components/GroupFormSection";

interface ReceptionChecklistFormProps {
  shippingGuideId: number;
  onSubmit: (data: ReceptionChecklistSchema) => void;
  isSubmitting?: boolean;
  onCancel?: () => void;
  unitControl?: boolean;
}

export const ReceptionChecklistForm = ({
  shippingGuideId,
  onSubmit,
  isSubmitting = false,
  onCancel,
  unitControl = false,
}: ReceptionChecklistFormProps) => {
  const { ABSOLUTE_ROUTE } = unitControl ? CONTROL_UNITS : SHIPMENTS_RECEPTIONS;
  const router = useNavigate();
  const [hasDamages, setHasDamages] = useState(false);

  const form = useForm<ReceptionChecklistSchema>({
    resolver: zodResolver<
      ReceptionChecklistSchema,
      any,
      ReceptionChecklistSchema
    >(receptionChecklistSchemaUpdate as any),
    defaultValues: {
      shipping_guide_id: String(shippingGuideId),
      items_receiving: {},
      kilometers: "",
      damages: [],
    },
    mode: "onChange",
  });

  const handleDamagesChange = (damages: any[]) => {
    form.setValue("damages", damages);
  };

  const handleHasDamagesChange = (checked: boolean) => {
    setHasDamages(checked);
    if (!checked) form.setValue("damages", []);
  };

  const {
    data: deliveryChecklist = [],
    isLoading: isLoadingDeliveryChecklist,
  } = useAllDeliveryChecklist({ type: "RECEPCION" });

  const { data: receptionChecklist, isLoading: isLoadingReceptionChecklist } =
    useReceptionChecklistById(shippingGuideId);

  const { data: vehicle, isLoading: isLoadingVehicle } =
    useVehicleByShippingGuide(shippingGuideId);

  useEffect(() => {
    if (receptionChecklist?.data && receptionChecklist.data.length > 0) {
      const itemsReceiving: Record<string, string> = {};
      receptionChecklist.data.forEach((item) => {
        itemsReceiving[String(item.receiving_id)] = String(
          (item as any).quantity || 0,
        );
      });
      form.setValue("items_receiving", itemsReceiving);

      if (receptionChecklist.note_received) {
        form.setValue("note", receptionChecklist.note_received);
        form.setValue("general_observations", receptionChecklist.note_received);
      }

      if ((receptionChecklist as any).kilometers != null) {
        form.setValue(
          "kilometers",
          String((receptionChecklist as any).kilometers),
        );
      }
    }
  }, [receptionChecklist, form]);

  if (
    isLoadingDeliveryChecklist ||
    isLoadingReceptionChecklist ||
    isLoadingVehicle
  ) {
    return <FormSkeleton />;
  }

  const hasAccessories =
    receptionChecklist?.accessories &&
    receptionChecklist.accessories.length > 0;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        {/* Layout principal: 4 columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* ── Columna izquierda (1/4): info vehículo + accesorios + kilometraje ── */}
          <div className="flex flex-col gap-4 lg:col-span-1">
            {/* Información del Vehículo */}
            {vehicle && (
              <GroupFormSection
                title="Información del Vehículo"
                icon={Car}
                iconColor="text-primary"
                bgColor="bg-blue-50"
                cols={{ sm: 1 }}
              >
                <div className="grid grid-cols-1 gap-1.5">
                  {vehicle.model?.version && (
                    <div className="flex flex-col gap-0.5 p-1.5 bg-muted rounded border border-muted">
                      <span className="text-muted-foreground text-[10px]">
                        Modelo
                      </span>
                      <span className="font-medium text-xs wrap-break-word">
                        {vehicle.model.version}
                      </span>
                    </div>
                  )}
                  {vehicle.year && (
                    <div className="flex flex-col gap-0.5 p-1.5 bg-muted rounded border border-muted">
                      <span className="text-muted-foreground text-[10px]">
                        Año
                      </span>
                      <span className="font-medium text-xs">
                        {vehicle.year}
                      </span>
                    </div>
                  )}
                  {vehicle.vehicle_color && (
                    <div className="flex flex-col gap-0.5 p-1.5 bg-muted rounded border border-muted">
                      <span className="text-muted-foreground text-[10px]">
                        Color
                      </span>
                      <span className="font-medium text-xs">
                        {vehicle.vehicle_color}
                      </span>
                    </div>
                  )}
                  {vehicle.model?.transmission && (
                    <div className="flex flex-col gap-0.5 p-1.5 bg-muted rounded border border-muted">
                      <span className="text-muted-foreground text-[10px]">
                        Transmisión
                      </span>
                      <span className="font-medium text-xs">
                        {vehicle.model.transmission}
                      </span>
                    </div>
                  )}
                  {vehicle.engine_type && (
                    <div className="flex flex-col gap-0.5 p-1.5 bg-muted rounded border border-muted">
                      <span className="text-muted-foreground text-[10px]">
                        Tipo de Motor
                      </span>
                      <span className="font-medium text-xs">
                        {vehicle.engine_type}
                      </span>
                    </div>
                  )}
                  {vehicle.vin && (
                    <div className="flex flex-col gap-0.5 p-1.5 bg-muted rounded border border-muted">
                      <span className="text-muted-foreground text-[10px]">
                        VIN
                      </span>
                      <span className="font-medium font-mono text-xs break-all">
                        {vehicle.vin}
                      </span>
                    </div>
                  )}
                  {vehicle.engine_number && (
                    <div className="flex flex-col gap-0.5 p-1.5 bg-muted rounded border border-muted">
                      <span className="text-muted-foreground text-[10px]">
                        Motor
                      </span>
                      <span className="font-medium font-mono text-xs break-all">
                        {vehicle.engine_number}
                      </span>
                    </div>
                  )}
                </div>
              </GroupFormSection>
            )}

            {/* Accesorios de la Compra */}
            {hasAccessories && (
              <GroupFormSection
                title="Accesorios de la Compra"
                icon={FileText}
                iconColor="text-amber-600"
                bgColor="bg-amber-50"
                cols={{ sm: 1 }}
              >
                <div className="space-y-1.5">
                  {receptionChecklist!.accessories!.map((accessory) => (
                    <div
                      key={accessory.id}
                      className="flex items-center justify-between gap-1.5 p-1.5 bg-muted rounded border border-muted"
                    >
                      <p className="font-medium text-foreground text-xs wrap-break-word">
                        {accessory.description}
                      </p>
                      <span className="text-muted-foreground text-[10px] shrink-0">
                        {accessory.quantity} {accessory.unit_measurement}
                      </span>
                    </div>
                  ))}
                </div>
              </GroupFormSection>
            )}

            {/* Kilometraje — al final de la columna izquierda */}
            <GroupFormSection
              title="Kilometraje"
              icon={Gauge}
              iconColor="text-gray-700"
              bgColor="bg-gray-50"
              cols={{ sm: 1 }}
            >
              <FormInput
                control={form.control}
                name="kilometers"
                label="Kilometraje actual del vehículo"
                placeholder="Ingresa el kilometraje"
                type="number"
                required
              />
            </GroupFormSection>
          </div>

          {/* ── Columna derecha (3/4): checklist + fotos + daños + observaciones ── */}
          <div className="flex flex-col gap-6 lg:col-span-3">
            {/* Equipamiento del Vehículo */}
            <GroupFormSection
              title="Equipamiento del Vehículo"
              icon={ClipboardList}
              iconColor="text-primary"
              bgColor="bg-blue-50"
              cols={{ sm: 1 }}
              gap="gap-0"
            >
              <ChecklistField
                form={form}
                name="items_receiving"
                label=""
                compact
                items={deliveryChecklist.map((item) => ({
                  id: item.id,
                  description: item.description,
                  category: (item as any).category || "EQUIPAMIENTO",
                  has_quantity: (item as any).has_quantity || false,
                }))}
              />
            </GroupFormSection>

            {/* Fotos del Vehículo — 4 en una sola fila */}
            <GroupFormSection
              title="Fotos del estado del vehículo (Opcional)"
              icon={Camera}
              iconColor="text-orange-600"
              bgColor="bg-orange-50"
              cols={{ sm: 4 }}
            >
              <FormField
                control={form.control}
                name="photo_front"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FileUploadWithCamera
                        label="Frontal"
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
                        label="Trasera"
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
                        label="Lateral Izq."
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
                        label="Lateral Der."
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
            <GroupFormSection
              title="Marcador de Daños"
              icon={AlertTriangle}
              iconColor="text-red-600"
              bgColor="bg-red-50"
              cols={{ sm: 1 }}
              gap="gap-0"
              headerExtra={
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="has-damages-switch"
                    className="text-xs font-semibold cursor-pointer uppercase tracking-wide font-mono"
                  >
                    ¿El vehículo presenta daños?
                  </Label>
                  <Switch
                    id="has-damages-switch"
                    checked={hasDamages}
                    onCheckedChange={handleHasDamagesChange}
                    disabled={isSubmitting}
                  />
                </div>
              }
            >
              {hasDamages ? (
                <VehicleDamageMarker
                  damages={(form.watch("damages") as any) || []}
                  onChange={handleDamagesChange}
                  disabled={isSubmitting}
                />
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Activa el interruptor si el vehículo presenta daños visibles.
                </p>
              )}
            </GroupFormSection>

            {/* Observaciones */}
            <GroupFormSection
              title="Observaciones"
              icon={FileText}
              iconColor="text-gray-700"
              bgColor="bg-gray-50"
              cols={{ sm: 1 }}
            >
              <FormField
                control={form.control}
                name="general_observations"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Anota cualquier detalle relevante sobre el estado del vehículo..."
                        className="resize-none"
                        rows={4}
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          field.onChange(e);
                          form.setValue("note", e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </GroupFormSection>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 w-full sm:justify-end">
          {onCancel && (
            <ConfirmationDialog
              trigger={
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>
              }
              title="¿Cancelar registro?"
              variant="destructive"
              icon="warning"
              onConfirm={() => router(ABSOLUTE_ROUTE)}
            />
          )}

          <FormSubmitConfirmation
            title="¿Confirmar recepción?"
            description="Una vez recepcionado, no podrá modificar este apartado. ¿Está seguro de que desea continuar?"
            confirmText="Sí, recepcionar"
            cancelText="No, revisar"
            triggerText="Guardar Recepción"
            variant="default"
            icon="warning"
            isSubmitting={isSubmitting}
            submittingText="Guardando..."
            onConfirm={form.handleSubmit(onSubmit)}
            disabled={!form.formState.isValid}
          />
        </div>
      </form>
    </Form>
  );
};
