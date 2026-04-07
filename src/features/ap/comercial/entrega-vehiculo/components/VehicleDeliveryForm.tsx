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
import {
  Loader,
  Car,
  User,
  FileText,
  Wrench,
  Receipt,
  Clock,
  MapPin,
  Mail,
  Activity,
  Hash,
  DollarSign,
} from "lucide-react";
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
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { DashboardCard } from "@/components/ui/dashboard-card";

const InfoItem = ({
  label,
  value,
  span,
}: {
  label: string;
  value: string | number | null | undefined;
  span?: number;
}) => (
  <div className={span === 2 ? "col-span-2" : undefined}>
    <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">
      {label}
    </p>
    <p className="text-sm font-semibold text-gray-800">{value ?? "—"}</p>
  </div>
);

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
      class_article_id: watchArticleClassId,
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
              disabled={
                isSupplier
                  ? isLoadingVehicles
                  : !watchSedeId || isLoadingVehicles
              }
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
              <Card className="py-4 px-5 border-gray-200 bg-gray-50/50">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <Loader className="h-4 w-4 animate-spin" />
                  Cargando información del vehículo...
                </div>
              </Card>
            ) : debtInfo ? (
              <Card className="py-0 overflow-hidden shadow-sm">
                {/* Hero header */}
                <div
                  className={`px-5 py-4 flex flex-wrap items-start justify-between gap-3 ${
                    debtInfo.debt_summary.debt_is_paid
                      ? "bg-green-600"
                      : "bg-red-600"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-white/10 p-2.5 rounded-xl">
                      <Car className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white/60 text-[10px] font-semibold uppercase tracking-widest">
                        VIN
                      </p>
                      <p className="text-white font-bold text-2xl leading-tight tracking-wide">
                        {debtInfo.vehicle.vin}
                      </p>
                      <p className="text-white/70 text-xs mt-1">
                        <span className="font-semibold">
                          {debtInfo.vehicle.model.brand}
                        </span>{" "}
                        · {debtInfo.vehicle.model.version} ·{" "}
                        {debtInfo.vehicle.year}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 pt-0.5">
                    <div
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-sm font-semibold ${
                        debtInfo.debt_summary.debt_is_paid
                          ? "bg-green-500/20 border-green-400/40 text-green-200"
                          : "bg-amber-500/20 border-amber-400/40 text-amber-200"
                      }`}
                    >
                      {debtInfo.debt_summary.debt_is_paid ? (
                        <CheckCircle2 className="h-4 w-4 text-green-300" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-300" />
                      )}
                      {debtInfo.debt_summary.debt_is_paid
                        ? "Deuda Pagada"
                        : "Deuda Pendiente"}
                    </div>
                    <span
                      className="text-[10px] px-2.5 py-1 rounded-full bg-white/10 text-white/80 font-semibold border border-white/20 uppercase tracking-wide"
                      style={{ borderColor: debtInfo.vehicle.status_color + "60" }}
                    >
                      {debtInfo.vehicle.vehicle_status}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {/* Row 1: Identificación + Cliente */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <GroupFormSection
                      title="Identificación del Vehículo"
                      icon={Hash}
                      color="slate"
                      cols={{ sm: 2, md: 2 }}
                      gap="gap-x-4 gap-y-3"
                    >
                      <InfoItem label="VIN" value={debtInfo.vehicle.vin} span={2} />
                      <InfoItem label="Placa" value={debtInfo.vehicle.plate ?? "—"} />
                      <InfoItem label="Año" value={debtInfo.vehicle.year} />
                      <InfoItem label="Color" value={debtInfo.vehicle.vehicle_color} />
                      <InfoItem label="Tipo Motor" value={debtInfo.vehicle.engine_type} />
                      <InfoItem label="N° Motor" value={debtInfo.vehicle.engine_number} span={2} />
                      <InfoItem label="Sede" value={debtInfo.vehicle.sede_name_warehouse ?? "—"} />
                      <InfoItem label="Almacén" value={debtInfo.vehicle.warehouse_name ?? "—"} />
                    </GroupFormSection>

                    <GroupFormSection
                      title="Datos del Cliente"
                      icon={User}
                      color="indigo"
                      cols={{ sm: 1, md: 1 }}
                      gap="gap-y-3"
                    >
                      <div className="flex items-start gap-2">
                        <Hash className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <InfoItem label="N° Documento" value={debtInfo.client.num_doc} />
                      </div>
                      <div className="flex items-start gap-2">
                        <User className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <InfoItem label="Razón Social / Nombre" value={debtInfo.client.full_name} />
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <InfoItem label="Dirección" value={debtInfo.client.direction} />
                      </div>
                      <div className="flex items-start gap-2">
                        <Mail className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <InfoItem label="Email" value={debtInfo.client.email} />
                      </div>
                    </GroupFormSection>
                  </div>

                  {/* Row 2: Especificaciones del Modelo */}
                  <GroupFormSection
                    title="Especificaciones del Modelo"
                    icon={Wrench}
                    color="blue"
                    cols={{ sm: 2, md: 3, lg: 4 }}
                    gap="gap-x-4 gap-y-3"
                    headerExtra={
                      <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
                        {debtInfo.vehicle.model.code}
                      </span>
                    }
                  >
                    <InfoItem label="Marca" value={debtInfo.vehicle.model.brand} />
                    <InfoItem label="Familia" value={debtInfo.vehicle.model.family} />
                    <InfoItem label="Clase" value={debtInfo.vehicle.model.class} />
                    <InfoItem label="Año Modelo" value={debtInfo.vehicle.model.model_year} />
                    <InfoItem label="Tipo Vehículo" value={debtInfo.vehicle.model.vehicle_type} />
                    <InfoItem label="Carrocería" value={debtInfo.vehicle.model.body_type} />
                    <InfoItem label="Tracción" value={debtInfo.vehicle.model.traction_type} />
                    <InfoItem label="Transmisión" value={debtInfo.vehicle.model.transmission} />
                    <InfoItem label="Combustible" value={debtInfo.vehicle.model.fuel} />
                    <InfoItem label="Potencia" value={debtInfo.vehicle.model.power} />
                    <InfoItem label="Cilindros" value={debtInfo.vehicle.model.cylinders_number} />
                    <InfoItem label="Pasajeros" value={debtInfo.vehicle.model.passengers_number} />
                    <InfoItem label="Ruedas" value={debtInfo.vehicle.model.wheels_number} />
                    <InfoItem label="Peso Neto" value={`${debtInfo.vehicle.model.net_weight} kg`} />
                    <InfoItem label="Peso Bruto" value={`${debtInfo.vehicle.model.gross_weight} kg`} />
                  </GroupFormSection>

                  {/* Row 3: Resumen financiero */}
                  <div className="grid grid-cols-2 gap-3">
                    <DashboardCard
                      title="Precio de Venta"
                      value={`$ ${debtInfo.debt_summary.total_sale_price.toFixed(2)}`}
                      description={`Cot. #${debtInfo.purchase_quote.correlative}`}
                      icon={DollarSign}
                      variant="outline"
                      color="slate"
                      colorIntensity="600"
                    />
                    <DashboardCard
                      title="Total Pagado"
                      value={`$ ${debtInfo.debt_summary.total_paid.toFixed(2)}`}
                      description={`${debtInfo.documents_summary.total_documents} documento${debtInfo.documents_summary.total_documents !== 1 ? "s" : ""}`}
                      icon={CheckCircle2}
                      variant="outline"
                      color="green"
                      colorIntensity="600"
                      showProgress
                      progressValue={debtInfo.debt_summary.total_paid}
                      progressMax={debtInfo.debt_summary.total_sale_price}
                    />
                  </div>

                  {/* Row 4: Facturas */}
                  {debtInfo.facturas.length > 0 && (
                    <GroupFormSection
                      title="Facturas"
                      icon={Receipt}
                      color="emerald"
                      cols={{ sm: 1, md: 1 }}
                      headerExtra={
                        <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">
                          {debtInfo.facturas.length}
                        </span>
                      }
                    >
                      <table className="w-full text-sm">
                        <thead className="bg-muted/60">
                          <tr>
                            {["Documento", "Tipo", "Fecha", "Moneda", "Total"].map((h) => (
                              <th
                                key={h}
                                className="text-left px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wide"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {debtInfo.facturas.map((factura) => (
                            <tr key={factura.id} className="hover:bg-muted/30 transition-colors">
                              <td className="px-3 py-2.5 font-bold text-foreground text-xs">
                                {factura.document_number}
                              </td>
                              <td className="px-3 py-2.5">
                                <span className="text-[10px] bg-muted text-muted-foreground font-medium px-2 py-0.5 rounded-full">
                                  {factura.tipo_documento}
                                </span>
                              </td>
                              <td className="px-3 py-2.5 text-xs text-muted-foreground">
                                {factura.fecha_emision}
                              </td>
                              <td className="px-3 py-2.5 text-xs text-muted-foreground">
                                {factura.moneda}
                              </td>
                              <td className="px-3 py-2.5 text-right font-bold text-foreground text-sm">
                                ${" "}
                                {Number(factura.total).toLocaleString("es-PE", {
                                  minimumFractionDigits: 2,
                                })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </GroupFormSection>
                  )}

                  {/* Row 5: Historial de Movimientos */}
                  {debtInfo.vehicle.movements.length > 0 && (
                    <GroupFormSection
                      title="Historial de Movimientos"
                      icon={Activity}
                      color="violet"
                      cols={{ sm: 1, md: 1 }}
                      headerExtra={
                        <span className="text-xs bg-violet-100 text-violet-700 font-semibold px-2 py-0.5 rounded-full">
                          {debtInfo.vehicle.movements.length}
                        </span>
                      }
                    >
                      <div>
                        {debtInfo.vehicle.movements.map((mov, i) => (
                          <div key={mov.id} className="flex gap-3">
                            <div className="flex flex-col items-center shrink-0">
                              <div
                                className="w-2.5 h-2.5 rounded-full mt-1.5 ring-2 ring-background"
                                style={{ backgroundColor: mov.status_color }}
                              />
                              {i < debtInfo.vehicle.movements.length - 1 && (
                                <div className="w-px bg-border flex-1 my-0.5" />
                              )}
                            </div>
                            <div className="pb-3 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className="text-[10px] font-bold uppercase tracking-wide"
                                  style={{ color: mov.status_color }}
                                >
                                  {mov.status}
                                </span>
                                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                  <Clock className="h-2.5 w-2.5" />
                                  {new Date(mov.date).toLocaleString("es-PE", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                              {mov.observation && (
                                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                                  {mov.observation}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </GroupFormSection>
                  )}

                  {/* Badges resumen de documentos */}
                  <div className="flex items-center gap-2 flex-wrap bg-muted/50 rounded-md border px-4 py-2.5">
                    <div className="flex items-center gap-1.5 text-muted-foreground mr-1">
                      <FileText className="h-3.5 w-3.5" />
                      <span className="text-xs font-semibold">Documentos:</span>
                    </div>
                    <span className="text-[10px] bg-muted text-muted-foreground font-semibold px-2.5 py-1 rounded-full">
                      {debtInfo.documents_summary.total_facturas} Factura
                      {debtInfo.documents_summary.total_facturas !== 1 ? "s" : ""}
                    </span>
                    {debtInfo.documents_summary.total_notas_credito > 0 && (
                      <span className="text-[10px] bg-green-100 text-green-700 font-semibold px-2.5 py-1 rounded-full">
                        {debtInfo.documents_summary.total_notas_credito} N. Crédito
                      </span>
                    )}
                    {debtInfo.documents_summary.total_notas_debito > 0 && (
                      <span className="text-[10px] bg-amber-100 text-amber-700 font-semibold px-2.5 py-1 rounded-full">
                        {debtInfo.documents_summary.total_notas_debito} N. Débito
                      </span>
                    )}
                    <span className="ml-auto text-[10px] text-muted-foreground">
                      {debtInfo.debt_summary.message}
                    </span>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="py-4 px-5 border-gray-200 bg-gray-50/50">
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
