"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SHIPMENTS_RECEPTIONS } from "../lib/shipmentsReceptions.constants";
import { FileText, Car } from "lucide-react";

interface ReceptionChecklistFormProps {
  shippingGuideId: number; // ID de la guía (requerido)
  onSubmit: (data: ReceptionChecklistSchema) => void;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

export const ReceptionChecklistForm = ({
  shippingGuideId,
  onSubmit,
  isSubmitting = false,
  onCancel,
}: ReceptionChecklistFormProps) => {
  const { ABSOLUTE_ROUTE } = SHIPMENTS_RECEPTIONS;
  const router = useNavigate();
  const form = useForm<ReceptionChecklistSchema>({
    resolver: zodResolver<
      ReceptionChecklistSchema,
      any,
      ReceptionChecklistSchema
    >(receptionChecklistSchemaUpdate),
    defaultValues: {
      shipping_guide_id: String(shippingGuideId),
      items_receiving: {},
    },
    mode: "onChange",
  });

  const {
    data: deliveryChecklist = [],
    isLoading: isLoadingDeliveryChecklist,
  } = useAllDeliveryChecklist({
    type: "RECEPCION",
  });

  const { data: receptionChecklist, isLoading: isLoadingReceptionChecklist } =
    useReceptionChecklistById(shippingGuideId);

  const { data: vehicle, isLoading: isLoadingVehicle } =
    useVehicleByShippingGuide(shippingGuideId);

  // Inicializar los items seleccionados desde el backend
  useEffect(() => {
    if (receptionChecklist?.data && receptionChecklist.data.length > 0) {
      // Construir el objeto items_receiving con receiving_id como clave y quantity como valor (ambos como strings)
      const itemsReceiving: Record<string, string> = {};
      receptionChecklist.data.forEach((item) => {
        // Si tiene cantidad, usar esa cantidad, sino usar 0 (convertido a string)
        itemsReceiving[String(item.receiving_id)] = String(
          (item as any).quantity || 0,
        );
      });
      form.setValue("items_receiving", itemsReceiving);

      // Setear la nota si existe
      if (receptionChecklist.note_received) {
        form.setValue("note", receptionChecklist.note_received);
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        {/* Sección: Información del Vehículo y Accesorios */}
        <div className="flex flex-wrap gap-3">
          {/* Card: Información del Vehículo */}
          {vehicle && (
            <Card className="bg-muted gap-1 p-2 flex-1">
              <CardHeader className="pb-2 pt-3 px-3">
                <CardTitle className="font-semibold flex items-center gap-1.5">
                  <Car className="h-4 w-4 shrink-0" />
                  Información del Vehículo
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-3 pb-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                  {vehicle.model?.version && (
                    <div className="flex flex-col gap-0.5 p-1.5 bg-background rounded border border-muted">
                      <span className="text-muted-foreground text-[10px]">
                        Modelo
                      </span>
                      <span className="font-medium text-xs wrap-break-word">
                        {vehicle.model.version}
                      </span>
                    </div>
                  )}
                  {vehicle.year && (
                    <div className="flex flex-col gap-0.5 p-1.5 bg-background rounded border border-muted">
                      <span className="text-muted-foreground text-[10px]">
                        Año
                      </span>
                      <span className="font-medium text-xs">
                        {vehicle.year}
                      </span>
                    </div>
                  )}
                  {vehicle.vehicle_color && (
                    <div className="flex flex-col gap-0.5 p-1.5 bg-background rounded border border-muted">
                      <span className="text-muted-foreground text-[10px]">
                        Color
                      </span>
                      <span className="font-medium text-xs">
                        {vehicle.vehicle_color}
                      </span>
                    </div>
                  )}
                  {vehicle.model?.transmission && (
                    <div className="flex flex-col gap-0.5 p-1.5 bg-background rounded border border-muted">
                      <span className="text-muted-foreground text-[10px]">
                        Transmisión
                      </span>
                      <span className="font-medium text-xs">
                        {vehicle.model.transmission}
                      </span>
                    </div>
                  )}
                  {vehicle.engine_type && (
                    <div className="flex flex-col gap-0.5 p-1.5 bg-background rounded border border-muted">
                      <span className="text-muted-foreground text-[10px]">
                        Tipo de Motor
                      </span>
                      <span className="font-medium text-xs">
                        {vehicle.engine_type}
                      </span>
                    </div>
                  )}
                  {vehicle.vin && (
                    <div className="flex flex-col gap-0.5 p-1.5 bg-background rounded border border-muted md:col-span-2">
                      <span className="text-muted-foreground text-[10px]">
                        VIN
                      </span>
                      <span className="font-medium font-mono text-xs break-all">
                        {vehicle.vin}
                      </span>
                    </div>
                  )}
                  {vehicle.engine_number && (
                    <div className="flex flex-col gap-0.5 p-1.5 bg-background rounded border border-muted md:col-span-2">
                      <span className="text-muted-foreground text-[10px]">
                        Motor
                      </span>
                      <span className="font-medium font-mono text-xs break-all">
                        {vehicle.engine_number}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Card: Accesorios Adjuntados */}
          {receptionChecklist?.accessories &&
            receptionChecklist.accessories.length > 0 && (
              <Card className="bg-muted gap-1 p-2 flex-1">
                <CardHeader className="pb-2 pt-3 px-3">
                  <CardTitle className="font-semibold flex items-center gap-1.5">
                    <FileText className="h-4 w-4 shrink-0" />
                    Accesorios de la Compra
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-3 pb-3">
                  <div className="space-y-1.5">
                    {receptionChecklist.accessories.map((accessory) => (
                      <div
                        key={accessory.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 p-1.5 bg-background rounded border border-muted"
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
                </CardContent>
              </Card>
            )}
        </div>

        {/* Sección: Checklist de Equipamiento */}
        <ChecklistField
          form={form}
          name="items_receiving"
          label="Equipamiento del Vehículo"
          items={deliveryChecklist.map((item) => ({
            id: item.id,
            description: item.description,
            category: (item as any).category || "EQUIPAMIENTO",
            has_quantity: (item as any).has_quantity || false,
          }))}
        />

        {/* Sección: Observaciones */}
        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observaciones (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Anota cualquier detalle relevante sobre el equipamiento recibido..."
                  className="resize-none"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
              onConfirm={() => {
                router(ABSOLUTE_ROUTE);
              }}
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
