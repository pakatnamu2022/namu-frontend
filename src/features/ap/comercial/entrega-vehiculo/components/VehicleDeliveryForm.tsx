"use client";

import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import {
  VehicleDeliverySchema,
  vehicleDeliverySchemaCreate,
  vehicleDeliverySchemaUpdate,
} from "../lib/vehicleDelivery.schema";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Loader } from "lucide-react";
import { DateTimePickerForm } from "@/shared/components/DateTimePickerForm";
import { FormSelect } from "@/shared/components/FormSelect";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { EMPRESA_AP } from "@/core/core.constants";
import { Card } from "@/components/ui/card";
import { useWarehousesByCompany } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.hook";
import { useAllClassArticle } from "@/features/ap/configuraciones/maestros-general/clase-articulo/lib/classArticle.hook";
import {
  useAllVehicles,
  useVehicleClientDebtInfo,
} from "../../vehiculos/lib/vehicles.hook";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { CM_COMERCIAL_ID } from "@/features/ap/ap-master/lib/apMaster.constants";

interface VehicleDeliveryFormProps {
  defaultValues: Partial<VehicleDeliverySchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
}

export const VehicleDeliveryForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
}: VehicleDeliveryFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create"
        ? vehicleDeliverySchemaCreate
        : (vehicleDeliverySchemaUpdate as any),
    ),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });

  const [isFirstLoad, setIsFirstLoad] = useState(mode === "update");
  const watchArticleClassId = form.watch("ap_class_article_id");

  const { data: mySedes = [], isLoading: isLoadingMySedes } =
    useWarehousesByCompany({
      my: 1,
      is_received: 1,
      ap_class_article_id: watchArticleClassId,
      empresa_id: EMPRESA_AP.id,
      type_operation_id: CM_COMERCIAL_ID,
    });

  const { data: articleClass = [], isLoading: isLoadingArticleClass } =
    useAllClassArticle({
      type: "VEHICULO",
      type_operation_id: CM_COMERCIAL_ID,
    });

  // Observar la sede seleccionada
  const watchSedeId = form.watch("sede_id");

  const { data: vehiclesVn = [], isLoading: isLoadingVehicles } =
    useAllVehicles({
      warehouse$sede_id: watchSedeId ? Number(watchSedeId) : undefined,
      warehouse$is_received: 1,
      warehouse$article_class_id: watchArticleClassId,
    });

  // Obtener el vehículo seleccionado
  const selectedVehicleId = form.watch("vehicle_id");

  // Obtener información de deuda del cliente
  const { data: debtInfo, isLoading: isLoadingDebtInfo } =
    useVehicleClientDebtInfo(
      selectedVehicleId ? Number(selectedVehicleId) : null,
    );

  // Verificar si puede guardar (deuda pagada)
  const canSave = debtInfo?.debt_summary.debt_is_paid ?? false;

  // Limpiar el vehículo seleccionado cuando cambia la sede
  useEffect(() => {
    const currentVehicleId = form.getValues("vehicle_id");

    if (currentVehicleId && vehiclesVn.length > 0) {
      const vehicleExists = vehiclesVn.some(
        (v) => v.id.toString() === currentVehicleId,
      );

      if (!vehicleExists) {
        form.setValue("vehicle_id", "", {
          shouldValidate: false,
        });
      }
    } else if (
      currentVehicleId &&
      !isLoadingVehicles &&
      vehiclesVn.length === 0
    ) {
      // Si ya no hay vehículos disponibles, limpiar la selección
      form.setValue("vehicle_id", "", {
        shouldValidate: false,
      });
    }
  }, [watchSedeId, vehiclesVn, isLoadingVehicles]);

  // Limpiar sedes cuando cambia la clase de artículo (solo si es un cambio manual, no al cargar)
  useEffect(() => {
    if (mode === "update" && isFirstLoad) {
      setIsFirstLoad(false);
      return;
    }

    if (watchArticleClassId) {
      const sede = form.getValues("sede_id");
      if (sede) {
        form.setValue("sede_id", "", {
          shouldValidate: false,
        });
      }
    }
  }, [watchArticleClassId]);

  if (isLoadingArticleClass) return <FormSkeleton />;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {/* Vehicle Select */}
          <FormSelect
            name="vehicle_id"
            label="Vehículo"
            placeholder={
              watchSedeId
                ? "Selecciona un vehículo"
                : "Primero selecciona una sede"
            }
            options={
              vehiclesVn?.map((item) => ({
                label: item!.vin,
                value: item!.id.toString(),
                description:
                  item!.sede_name_warehouse + " - " + item!.warehouse_name ||
                  "",
              })) || []
            }
            control={form.control}
            disabled={!watchSedeId || isLoadingVehicles}
          />

          {/* Scheduled Delivery Date */}
          <DateTimePickerForm
            control={form.control}
            name="scheduled_delivery_date"
            label="Fecha y Hora de Entrega Programada"
            placeholder="Selecciona la fecha y hora de entrega"
            minDate={new Date()}
          />

          {/* Wash Date */}
          <DateTimePickerForm
            control={form.control}
            name="wash_date"
            label="Fecha y Hora de Lavado"
            placeholder="Selecciona la fecha y hora de lavado"
            minDate={new Date()}
          />
        </div>

        {/* Información del Vehículo, Cliente */}
        {selectedVehicleId && (
          <>
            {isLoadingDebtInfo ? (
              <Card className="p-4 bg-gray-50/50 border-gray-200">
                <p className="text-sm text-gray-500">
                  Cargando información del vehículo y cliente...
                </p>
              </Card>
            ) : debtInfo ? (
              <Card className="overflow-hidden border-gray-200">
                {/* Header con estado de deuda */}
                <div className="flex items-center justify-between px-5 py-3.5 bg-gray-50 border-b">
                  <h3 className="text-base font-semibold text-gray-800">
                    Información de Entrega
                  </h3>
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                      debtInfo.debt_summary.debt_is_paid
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {debtInfo.debt_summary.debt_is_paid ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Deuda Pagada</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4" />
                        <span>
                          Deuda: $
                          {debtInfo.debt_summary.pending_debt.toFixed(2)}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 p-5">
                  {/* Columna: Vehículo */}
                  <div className="space-y-3.5 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                    <h4 className="text-xs font-semibold text-blue-900 uppercase tracking-wide pb-2 border-b border-blue-200">
                      Vehículo
                    </h4>
                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500 font-medium">VIN</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {debtInfo.vehicle.vin}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500 font-medium">
                          Modelo
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {debtInfo.vehicle.model}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500 font-medium">Año</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {debtInfo.vehicle.year}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500 font-medium">
                          Motor
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {debtInfo.vehicle.engine_number}
                        </p>
                      </div>
                      <div className="col-span-2 space-y-1">
                        <p className="text-xs text-gray-500 font-medium">
                          Almacén
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {debtInfo.vehicle.warehouse_physical}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Columna: Cliente */}
                  <div className="space-y-3.5 bg-red-50/50 p-4 rounded-lg border border-red-100">
                    <h4 className="text-xs font-semibold text-red-900 uppercase tracking-wide pb-2 border-b border-red-200">
                      Cliente
                    </h4>
                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500 font-medium">
                          Documento
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {debtInfo.client.num_doc}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500 font-medium">
                          Nombre
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {debtInfo.client.full_name}
                        </p>
                      </div>
                      <div className="col-span-2 space-y-1">
                        <p className="text-xs text-gray-500 font-medium">
                          Dirección
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {debtInfo.client.direction}
                        </p>
                      </div>
                      <div className="col-span-2 space-y-1">
                        <p className="text-xs text-gray-500 font-medium">
                          Email
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {debtInfo.client.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ) : null}
          </>
        )}

        {/* Observations */}
        <FormField
          control={form.control}
          name="observations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observaciones</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ingrese observaciones sobre la entrega"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4 w-full justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid || !canSave}
          >
            <Loader
              className={`mr-2 h-4 w-4 animate-spin ${
                !isSubmitting ? "hidden" : ""
              }`}
            />
            {isSubmitting ? "Guardando" : "Guardar Entrega"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
