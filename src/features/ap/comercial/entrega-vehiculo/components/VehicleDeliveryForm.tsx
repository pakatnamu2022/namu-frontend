"use client";

import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import {
  VehicleDeliverySchema,
  vehicleDeliverySchemaCreate,
  vehicleDeliverySchemaUpdate,
} from "../lib/vehicleDelivery.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
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
import { FormTextArea } from "@/shared/components/FormTextArea";

interface VehicleDeliveryFormProps {
  defaultValues: Partial<VehicleDeliverySchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  isSupplier?: boolean;
  onCancel?: () => void;
}

export const VehicleDeliveryForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  isSupplier = false,
  onCancel,
}: VehicleDeliveryFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create" && !isSupplier
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        {/* Sección: Selección */}
        <div className="space-y-4">
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

            {!isSupplier && (
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
            )}

            <FormSelectAsync
              name="vehicle_id"
              label="Vehículo Facturado"
              placeholder={
                isSupplier || watchSedeId
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
                ...(isSupplier
                  ? {}
                  : {
                      warehouse$sede_id: watchSedeId
                        ? Number(watchSedeId)
                        : undefined,
                    }),
                warehouse$is_received: 1,
                warehouse$article_class_id: watchArticleClassId,
                is_paid: 1,
              }}
              control={form.control}
              disabled={isSupplier ? isLoadingVehicles : !watchSedeId || isLoadingVehicles}
            />
          </div>

          {/* Fechas en su propia fila */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DateTimePickerForm
              control={form.control}
              name="scheduled_delivery_date"
              label="Fecha y Hora de Entrega Programada"
              placeholder="Selecciona la fecha y hora de entrega"
              minDate={new Date()}
            />
            <DateTimePickerForm
              control={form.control}
              name="wash_date"
              label="Fecha y Hora de Lavado"
              placeholder="Selecciona la fecha y hora de lavado"
              minDate={new Date()}
            />
          </div>
        </div>

        {/* Información del Vehículo y Cliente */}
        {selectedVehicleId && (
          <>
            {isLoadingDebtInfo ? (
              <Card className="py-0 px-5 border-gray-200 bg-gray-50/50">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <Loader className="h-4 w-4 animate-spin" />
                  Cargando información del vehículo...
                </div>
              </Card>
            ) : debtInfo ? (
              <Card className="py-0 overflow-hidden shadow-sm">
                {/* Header con slate oscuro — badge de estado */}
                {/* Hero header */}
                <div
                  className={`px-5 py-4 flex flex-wrap items-center justify-between gap-3 ${
                    debtInfo.debt_summary.debt_is_paid
                      ? "bg-green-600"
                      : "bg-red-600"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-white/10 p-2 rounded-lg">
                      <Car className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white/50 text-xs font-medium uppercase tracking-wide">
                        VIN
                      </p>
                      <p className="text-white font-bold text-xl leading-tight">
                        {debtInfo.vehicle.vin}
                      </p>
                      <p className="text-white/50 text-xs mt-0.5">
                        {debtInfo.vehicle.model.version} ·{" "}
                        {debtInfo.vehicle.year}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-full border ${
                      debtInfo.debt_summary.debt_is_paid
                        ? "bg-green-500/20 border-green-400/40"
                        : "bg-amber-500/20 border-amber-400/40"
                    }`}
                  >
                    {debtInfo.debt_summary.debt_is_paid ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                        <span className="text-green-300 text-sm font-semibold">
                          Deuda Pagada
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-amber-400" />
                        <span className="text-amber-300 text-sm font-semibold">
                          Deuda Pendiente
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {/* Vehicle & Client */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Vehículo */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                      <div className="flex items-center gap-2 mb-3.5 pb-2.5 border-b border-slate-200">
                        <Car className="h-4 w-4 text-slate-500" />
                        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                          Datos del Vehículo
                        </h4>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">
                            Modelo
                          </p>
                          <p className="text-sm font-semibold text-gray-800">
                            {debtInfo.vehicle.model.version}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">
                            Código
                          </p>
                          <p className="text-sm font-semibold text-gray-800">
                            {debtInfo.vehicle.model.code}
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
                            {debtInfo.vehicle.engine_type}
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
                            {debtInfo.vehicle.warehouse_name}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Cliente */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                      <div className="flex items-center gap-2 mb-3.5 pb-2.5 border-b border-slate-200">
                        <User className="h-4 w-4 text-slate-500" />
                        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest">
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

                  {/* Resumen financiero */}
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
                          : "border-amber-100 bg-amber-50/60"
                      }`}
                    >
                      <p
                        className={`text-[10px] uppercase font-semibold tracking-wide mb-1 ${
                          debtInfo.debt_summary.debt_is_paid
                            ? "text-green-600"
                            : "text-amber-600"
                        }`}
                      >
                        Deuda Pendiente
                      </p>
                      <p
                        className={`text-base font-bold ${
                          debtInfo.debt_summary.debt_is_paid
                            ? "text-green-700"
                            : "text-amber-700"
                        }`}
                      >
                        S/ {debtInfo.debt_summary.pending_debt.toFixed(2)}
                      </p>
                      <p
                        className={`text-[10px] mt-0.5 ${
                          debtInfo.debt_summary.debt_is_paid
                            ? "text-green-500"
                            : "text-amber-500"
                        }`}
                      >
                        {debtInfo.debt_summary.status}
                      </p>
                    </div>
                  </div>

                  {/* Alerta de deuda pendiente */}
                  {!debtInfo.debt_summary.debt_is_paid && (
                    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                      <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                      <p className="text-sm text-amber-800">
                        Este vehículo tiene una deuda pendiente de{" "}
                        <strong>
                          S/ {debtInfo.debt_summary.pending_debt.toFixed(2)}
                        </strong>
                        . No se puede registrar la entrega hasta que sea
                        cancelada.
                      </p>
                    </div>
                  )}

                  {/* Badges de documentos */}
                  <div className="flex items-center gap-3 flex-wrap bg-gray-50 rounded-xl border px-4 py-2.5">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <FileText className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium">Documentos:</span>
                    </div>
                    <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 rounded-full">
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
            ) : (
              <Card className="py-0 px-5 border-gray-200 bg-gray-50/50">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <AlertCircle className="h-4 w-4 text-gray-400" />
                  No se encontró información para el vehículo seleccionado.
                </div>
              </Card>
            )}
          </>
        )}

        {/* Observaciones */}
        <FormTextArea
          name="observations"
          label="Observaciones"
          placeholder="Ingrese observaciones sobre la entrega"
          control={form.control}
          uppercase
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
