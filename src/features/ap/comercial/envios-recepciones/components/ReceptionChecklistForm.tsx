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
import { useReceptionChecklistById } from "../lib/shipmentsReceptions.hook";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { FormSubmitConfirmation } from "@/shared/components/FormSubmitConfirmation";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SHIPMENTS_RECEPTIONS } from "../lib/shipmentsReceptions.constants";
import { FileText } from "lucide-react";

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

  // Inicializar los items seleccionados desde el backend
  useEffect(() => {
    if (receptionChecklist?.data && receptionChecklist.data.length > 0) {
      // Construir el objeto items_receiving con receiving_id como clave y quantity como valor (ambos como strings)
      const itemsReceiving: Record<string, string> = {};
      receptionChecklist.data.forEach((item) => {
        // Si tiene cantidad, usar esa cantidad, sino usar 0 (convertido a string)
        itemsReceiving[String(item.receiving_id)] = String(
          (item as any).quantity || 0
        );
      });
      form.setValue("items_receiving", itemsReceiving);

      // Setear la nota si existe
      if (receptionChecklist.note_received) {
        form.setValue("note", receptionChecklist.note_received);
      }
    }
  }, [receptionChecklist, form]);

  if (isLoadingDeliveryChecklist || isLoadingReceptionChecklist) {
    return <FormSkeleton />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        {/* Sección: Accesorios Adjuntados */}
        {receptionChecklist?.accessories &&
          receptionChecklist.accessories.length > 0 && (
            <Card className="bg-muted">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Accesorios de la Compra
                </CardTitle>
                <CardDescription>
                  Estos son los accesorios con los que debe venir el vehículo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {receptionChecklist.accessories.map((accessory) => (
                    <div
                      key={accessory.id}
                      className="flex items-center justify-between p-3 bg-background rounded-lg border border-muted hover:border-primary transition-colors"
                    >
                      <p className="font-medium text-foreground">
                        {accessory.description}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {accessory.quantity} {accessory.unit_measurement}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

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
        <div className="flex gap-4 w-full justify-end">
          {onCancel && (
            <ConfirmationDialog
              trigger={
                <Button type="button" variant="outline">
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
