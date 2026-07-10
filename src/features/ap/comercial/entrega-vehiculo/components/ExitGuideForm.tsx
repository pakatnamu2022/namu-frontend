"use client";

import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { ScheduledDeliveryPicker } from "./ScheduledDeliveryPicker";
import { FormTextArea } from "@/shared/components/FormTextArea";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { EMPRESA_AP } from "@/core/core.constants";
import { CM_COMERCIAL_ID } from "@/features/ap/ap-master/lib/apMaster.constants";
import { useWarehousesByCompany } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.hook";
import { useAllClassArticle } from "@/features/ap/configuraciones/maestros-general/clase-articulo/lib/classArticle.hook";
import { useWorkers } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import { useStockInicialAvailableVehicles } from "../lib/exitGuide.hook";
import { ExitGuideSchema, exitGuideSchema } from "../lib/exitGuide.schema";
import { useCustomers } from "@/features/ap/comercial/clientes/lib/customers.hook";
import { CustomersResource } from "@/features/ap/comercial/clientes/lib/customers.interface";

interface ExitGuideFormProps {
  defaultValues: Partial<ExitGuideSchema>;
  onSubmit: (data: ExitGuideSchema) => void;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

export const ExitGuideForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  onCancel,
}: ExitGuideFormProps) => {
  const form = useForm<ExitGuideSchema>({
    resolver: zodResolver(exitGuideSchema),
    defaultValues,
    mode: "onChange",
  });

  const watchArticleClassId = form.watch("ap_class_article_id");
  const watchSedeId = form.watch("sede_id");

  const { data: articleClass = [], isLoading: isLoadingArticleClass } =
    useAllClassArticle({
      type: "VEHICULO",
      type_operation_id: CM_COMERCIAL_ID,
      class_article_id: watchArticleClassId,
    });

  const { data: mySedes = [], isLoading: isLoadingMySedes } =
    useWarehousesByCompany({
      my: 1,
      is_received: 1,
      ap_class_article_id: watchArticleClassId,
      empresa_id: EMPRESA_AP.id,
      type_operation_id: CM_COMERCIAL_ID,
    });

  const { data: vehicles = [], isLoading: isLoadingVehicles } =
    useStockInicialAvailableVehicles(
      watchSedeId ? Number(watchSedeId) : undefined,
    );

  useEffect(() => {
    const currentVehicleId = form.getValues("vehicle_id");
    if (currentVehicleId && !isLoadingVehicles) {
      const vehicleExists = vehicles.some(
        (v) => v.id.toString() === currentVehicleId,
      );
      if (!vehicleExists)
        form.setValue("vehicle_id", "", { shouldValidate: false });
    }
  }, [watchSedeId, vehicles, isLoadingVehicles]);

  useEffect(() => {
    const sede = form.getValues("sede_id");
    if (sede) form.setValue("sede_id", "", { shouldValidate: false });
  }, [watchArticleClassId]);

  if (isLoadingArticleClass) return <FormSkeleton />;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormSelect
            name="ap_class_article_id"
            label="Clase de Artículo"
            placeholder="Selecciona una Clase"
            options={articleClass.map((item) => ({
              label: item.description,
              value: item.id.toString(),
            }))}
            control={form.control}
            strictFilter={true}
          />
          <FormSelect
            name="sede_id"
            label="Sede"
            placeholder="Selecciona sede"
            options={mySedes.map((item) => ({
              label: item.sede,
              description: item.description,
              value: item.sede_id.toString(),
            }))}
            control={form.control}
            strictFilter={true}
            disabled={!watchArticleClassId || isLoadingMySedes}
          />
          <FormSelect
            name="vehicle_id"
            label="Vehículo (Stock Inicial)"
            placeholder={
              watchSedeId ? "Selecciona un vehículo" : "Primero selecciona una sede"
            }
            options={vehicles.map((item) => ({
              label: item.vin,
              value: item.id.toString(),
              description: `${item.model.brand} ${item.model.version} · ${item.year}`,
            }))}
            control={form.control}
            strictFilter={true}
            disabled={!watchSedeId || isLoadingVehicles}
          />
          <FormSelectAsync
            name="advisor_id"
            label="Asesor"
            placeholder="Selecciona un asesor"
            control={form.control}
            useQueryHook={useWorkers}
            mapOptionFn={(item) => ({
              label: item.name,
              value: item.id.toString(),
            })}
          />
          <FormSelectAsync
            name="client_id"
            label="Cliente"
            placeholder="Selecciona un cliente"
            control={form.control}
            useQueryHook={useCustomers}
            mapOptionFn={(item: CustomersResource) => ({
              label: `${item.full_name} - ${item.num_doc}`,
              value: item.id.toString(),
            })}
            perPage={10}
            debounceMs={500}
          />
          <ScheduledDeliveryPicker
            control={form.control}
            name="scheduled_delivery_date"
            label="Fecha y Hora de Entrega Programada"
            placeholder="Selecciona la fecha y hora de entrega"
            description="Lun-Vie: 9, 10, 11, 12, 15, 16 y 17h · Sáb: 10, 11 y 12h"
            minDate={(() => {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              tomorrow.setHours(0, 0, 0, 0);
              return tomorrow;
            })()}
            autoSelectFirstAvailable
          />
        </div>

        <FormTextArea
          name="observations"
          label="Observaciones"
          placeholder="Ingrese observaciones sobre la entrega"
          control={form.control}
          uppercase
        />

        <div className="flex gap-3 w-full justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            <Loader
              className={`mr-2 h-4 w-4 animate-spin ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting ? "Guardando…" : "Guardar Guía de Salida"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
