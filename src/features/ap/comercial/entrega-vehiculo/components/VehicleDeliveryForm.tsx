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
import { Loader, Car, User, FileText } from "lucide-react";
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
  useVehicles,
} from "../../vehiculos/lib/vehicles.hook";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { CM_COMERCIAL_ID } from "@/features/ap/ap-master/lib/apMaster.constants";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <FormSelectAsync
            name="vehicle_id"
            label="Vehículo Facturado"
            placeholder={
              watchSedeId
                ? "Selecciona un vehículo"
                : "Primero selecciona una sede"
            }
            useQueryHook={useVehicles}
            mapOptionFn={(item) => ({
              label: item.vin,
              value: item.id.toString(),
              description:
                item.sede_name_warehouse + " - " + item.warehouse_name || "",
            })}
            additionalParams={{
              warehouse$sede_id: watchSedeId ? Number(watchSedeId) : undefined,
              warehouse$is_received: 1,
              warehouse$article_class_id: watchArticleClassId,
              is_paid: 1,
            }}
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
              <Card className="p-5 border-gray-200 bg-gray-50/50">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <Loader className="h-4 w-4 animate-spin" />
                  Cargando información del vehículo...
                </div>
              </Card>
            ) : debtInfo ? (
              <Card className="overflow-hidden shadow-sm">
                {/* Hero header */}
                <div
                  className={`px-5 py-4 flex flex-wrap items-center justify-between gap-3 ${
                    debtInfo.debt_summary.debt_is_paid
                      ? "bg-green-600"
                      : "bg-red-600"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <Car className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white/70 text-xs font-medium uppercase tracking-wide">
                        VIN
                      </p>
                      <p className="text-white font-bold text-xl leading-tight">
                        {debtInfo.vehicle.vin}
                      </p>
                      <p className="text-white/70 text-xs mt-0.5">
                        {debtInfo.vehicle.model} · {debtInfo.vehicle.year}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 px-3.5 py-2 rounded-full border border-white/30">
                    {debtInfo.debt_summary.debt_is_paid ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-white" />
                        <span className="text-white text-sm font-semibold">
                          Deuda Pagada
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-white" />
                        <span className="text-white text-sm font-semibold">
                          Deuda Pendiente
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {/* Vehicle & Client */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Vehicle */}
                    <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
                      <div className="flex items-center gap-2 mb-3.5 pb-2.5 border-b border-blue-100">
                        <Car className="h-4 w-4 text-blue-600" />
                        <h4 className="text-xs font-bold text-blue-700 uppercase tracking-widest">
                          Datos del Vehículo
                        </h4>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">
                            Modelo
                          </p>
                          <p className="text-sm font-semibold text-gray-800">
                            {debtInfo.vehicle.model}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">
                            Código
                          </p>
                          <p className="text-sm font-semibold text-gray-800">
                            {debtInfo.vehicle.model_code}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">
                            Año
                          </p>
                          <p className="text-sm font-semibold text-gray-800">
                            {debtInfo.vehicle.year}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">
                            Tipo Motor
                          </p>
                          <p className="text-sm font-semibold text-gray-800">
                            {debtInfo.vehicle.engineType}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">
                            Nº Motor
                          </p>
                          <p className="text-sm font-semibold text-gray-800">
                            {debtInfo.vehicle.engine_number}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">
                            Almacén
                          </p>
                          <p className="text-sm font-semibold text-gray-800">
                            {debtInfo.vehicle.warehouse_physical}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Client */}
                    <div className="rounded-xl border border-purple-100 bg-purple-50/40 p-4">
                      <div className="flex items-center gap-2 mb-3.5 pb-2.5 border-b border-purple-100">
                        <User className="h-4 w-4 text-purple-600" />
                        <h4 className="text-xs font-bold text-purple-700 uppercase tracking-widest">
                          Datos del Cliente
                        </h4>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">
                            Documento
                          </p>
                          <p className="text-sm font-semibold text-gray-800">
                            {debtInfo.client.num_doc}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">
                            Nombre
                          </p>
                          <p className="text-sm font-semibold text-gray-800">
                            {debtInfo.client.full_name}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">
                            Dirección
                          </p>
                          <p className="text-sm font-semibold text-gray-800">
                            {debtInfo.client.direction}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">
                            Email
                          </p>
                          <p className="text-sm font-semibold text-gray-800">
                            {debtInfo.client.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Financial summary */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl border bg-white p-3.5 text-center shadow-sm">
                      <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide mb-1">
                        Precio Venta
                      </p>
                      <p className="text-base font-bold text-gray-900">
                        S/ {debtInfo.debt_summary.total_sale_price.toFixed(2)}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        Cot. #{debtInfo.purchase_quote.correlative}
                      </p>
                    </div>
                    <div className="rounded-xl border border-green-100 bg-green-50/60 p-3.5 text-center shadow-sm">
                      <p className="text-[10px] text-green-600 uppercase font-semibold tracking-wide mb-1">
                        Total Pagado
                      </p>
                      <p className="text-base font-bold text-green-700">
                        S/ {debtInfo.debt_summary.total_paid.toFixed(2)}
                      </p>
                      <p className="text-[10px] text-green-500 mt-0.5">
                        {debtInfo.documents_summary.total_documents} doc.
                      </p>
                    </div>
                    <div
                      className={`rounded-xl border p-3.5 text-center shadow-sm ${
                        debtInfo.debt_summary.debt_is_paid
                          ? "border-green-100 bg-green-50/60"
                          : "border-red-100 bg-red-50/60"
                      }`}
                    >
                      <p
                        className={`text-[10px] uppercase font-semibold tracking-wide mb-1 ${
                          debtInfo.debt_summary.debt_is_paid
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        Deuda Pendiente
                      </p>
                      <p
                        className={`text-base font-bold ${
                          debtInfo.debt_summary.debt_is_paid
                            ? "text-green-700"
                            : "text-red-700"
                        }`}
                      >
                        S/ {debtInfo.debt_summary.pending_debt.toFixed(2)}
                      </p>
                      <p
                        className={`text-[10px] mt-0.5 ${
                          debtInfo.debt_summary.debt_is_paid
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {debtInfo.debt_summary.status}
                      </p>
                    </div>
                  </div>

                  {/* Documents badges */}
                  <div className="flex items-center gap-3 flex-wrap bg-gray-50 rounded-xl border px-4 py-2.5">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <FileText className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium">Documentos:</span>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2.5 py-1 rounded-full">
                      {debtInfo.documents_summary.total_facturas} Factura
                      {debtInfo.documents_summary.total_facturas !== 1
                        ? "s"
                        : ""}
                    </span>
                    {debtInfo.documents_summary.total_notas_credito > 0 && (
                      <span className="text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-1 rounded-full">
                        {debtInfo.documents_summary.total_notas_credito} N.
                        Crédito
                      </span>
                    )}
                    {debtInfo.documents_summary.total_notas_debito > 0 && (
                      <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2.5 py-1 rounded-full">
                        {debtInfo.documents_summary.total_notas_debito} N.
                        Débito
                      </span>
                    )}
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
