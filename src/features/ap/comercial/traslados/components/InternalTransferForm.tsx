"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapPin, Loader, Truck } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { useWarehousesByCompany } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.hook";
import { useAllClassArticle } from "@/features/ap/configuraciones/maestros-general/clase-articulo/lib/classArticle.hook";
import { useVehicles } from "../../vehiculos/lib/vehicles.hook";
import { VehicleResource } from "../../vehiculos/lib/vehicles.interface";
import { createInternalShippingGuide } from "../../envios-recepciones/lib/shipmentsReceptions.actions";
import { TRANSFERS } from "../lib/transfers.constants";
import { CM_COMERCIAL_ID } from "@/features/ap/ap-master/lib/apMaster.constants";
import { EMPRESA_AP } from "@/core/core.constants";

const schema = z.object({
  ap_class_article_id: z.string().min(1, "Requerido"),
  ap_vehicle_id: z.string().min(1, "Requerido"),
  sede_receiver_id: z.string().min(1, "Requerido"),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  vehicleId?: number;
  vehicleVin?: string;
  apClassArticleId?: number;
  currentWarehouseId?: number;
  currentWarehouseName?: string;
}

export default function InternalTransferForm({
  vehicleId,
  vehicleVin,
  apClassArticleId,
  currentWarehouseId,
  currentWarehouseName,
}: Props) {
  const router = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleResource | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      ap_class_article_id: apClassArticleId?.toString() ?? "",
      ap_vehicle_id: vehicleId?.toString() ?? "",
      sede_receiver_id: "",
    },
    mode: "onChange",
  });

  const watchClassArticleId = form.watch("ap_class_article_id");

  const { data: articleClass = [], isLoading: isLoadingArticleClass } = useAllClassArticle({
    type: "VEHICULO",
    type_operation_id: CM_COMERCIAL_ID,
  });

  const resolvedWarehouseId = currentWarehouseId ?? selectedVehicle?.warehouse_id;
  const resolvedWarehouseName = currentWarehouseName ?? (
    selectedVehicle
      ? [selectedVehicle.sede_name_warehouse, selectedVehicle.warehouse_name]
          .filter(Boolean)
          .join(" — ")
      : undefined
  );

  const { data: destSedes = [], isLoading: isLoadingDestSedes } = useWarehousesByCompany({
    my: 0,
    is_received: 0,
    empresa_id: EMPRESA_AP.id,
    type_operation_id: CM_COMERCIAL_ID,
    ap_class_article_id: watchClassArticleId || apClassArticleId?.toString(),
  });

  const handleVehicleChange = (_value: string, item?: VehicleResource) => {
    if (item) {
      setSelectedVehicle(item);
      if (!apClassArticleId) {
        form.setValue("ap_class_article_id", item.model.class_id?.toString() ?? "", {
          shouldValidate: true,
        });
      }
    } else {
      setSelectedVehicle(null);
    }
    form.setValue("sede_receiver_id", "", { shouldValidate: false });
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      await createInternalShippingGuide({
        ap_vehicle_id: Number(values.ap_vehicle_id),
        sede_receiver_id: Number(values.sede_receiver_id),
        ap_class_article_id: Number(values.ap_class_article_id),
      });
      toast.success("Guía interna de traslado creada exitosamente");
      queryClient.invalidateQueries({ queryKey: [TRANSFERS.QUERY_KEY] });
      router(TRANSFERS.ABSOLUTE_ROUTE);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Error al crear la guía interna de traslado"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasVehiclePreloaded = !!vehicleId;
  const effectiveClassId = watchClassArticleId || apClassArticleId?.toString();

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-3"
      >
        <GroupFormSection
          icon={Truck}
          title="Datos del Traslado Interno"
          color="gray"
          cols={{ sm: 1, md: 2 }}
          className="lg:col-span-2"
        >
          {/* Clase de artículo — solo si no viene preseleccionada */}
          {!hasVehiclePreloaded && (
            <FormSelect
              control={form.control}
              name="ap_class_article_id"
              label="Clase de Artículo"
              placeholder="Selecciona una clase"
              options={articleClass.map((item) => ({
                label: item.description,
                value: item.id.toString(),
              }))}
              disabled={isLoadingArticleClass}
              strictFilter
            />
          )}

          {/* Selector de vehículo — solo si no viene preseleccionado */}
          {!hasVehiclePreloaded ? (
            <FormSelectAsync
              key={`vehicle-${effectiveClassId}`}
              name="ap_vehicle_id"
              label="Vehículo"
              placeholder="Busca por VIN"
              control={form.control}
              useQueryHook={useVehicles}
              mapOptionFn={(item: VehicleResource) => ({
                value: item.id.toString(),
                label: item.vin ?? "",
                description: [item.sede_name_warehouse, item.warehouse_name]
                  .filter(Boolean)
                  .join(" — "),
              })}
              additionalParams={{
                model$class_id: effectiveClassId || undefined,
                is_received: 1,
              }}
              disabled={!effectiveClassId}
              onValueChange={handleVehicleChange}
              withValue={false}
              perPage={20}
              debounceMs={400}
            />
          ) : (
            <div className="space-y-1">
              <p className="text-sm font-medium">Vehículo</p>
              <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm font-semibold">
                {vehicleVin ?? `#${vehicleId}`}
              </div>
            </div>
          )}

          {/* Ubicación actual (origen) */}
          {resolvedWarehouseName && (
            <div className="space-y-1 md:col-span-2">
              <p className="text-sm font-medium text-muted-foreground">Ubicación Actual (Origen)</p>
              <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
                <MapPin className="size-4 shrink-0 text-muted-foreground" />
                <span>{resolvedWarehouseName}</span>
              </div>
            </div>
          )}

          {/* Sede destino */}
          <FormSelect
            control={form.control}
            name="sede_receiver_id"
            label="Sede Destino"
            placeholder="Selecciona sede destino"
            options={destSedes
              .filter((item) => item.id !== resolvedWarehouseId)
              .map((item) => ({
                label: item.sede,
                description: item.description,
                value: item.sede_id.toString(),
              }))}
            disabled={isLoadingDestSedes || !effectiveClassId}
            strictFilter
          />
        </GroupFormSection>

        <div className="flex gap-4 justify-end lg:col-span-2">
          <ConfirmationDialog
            trigger={
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            }
            title="¿Cancelar traslado?"
            variant="destructive"
            icon="warning"
            onConfirm={() => router(TRANSFERS.ABSOLUTE_ROUTE)}
          />
          <Button type="submit" disabled={isSubmitting || !form.formState.isValid}>
            {isSubmitting && <Loader className="mr-2 size-4 animate-spin" />}
            {isSubmitting ? "Guardando..." : "Crear Traslado Interno"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
