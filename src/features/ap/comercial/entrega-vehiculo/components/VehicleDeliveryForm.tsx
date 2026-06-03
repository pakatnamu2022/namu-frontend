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
  Wrench,
  Receipt,
  Clock,
  Activity,
  Hash,
  Truck,
  AlertTriangle,
  Package,
  Eye,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  FileText,
} from "lucide-react";
import { DateTimePickerForm } from "@/shared/components/DateTimePickerForm";
import { FormSelect } from "@/shared/components/FormSelect";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { EMPRESA_AP } from "@/core/core.constants";
import { useWarehousesByCompany } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.hook";
import { useAllClassArticle } from "@/features/ap/configuraciones/maestros-general/clase-articulo/lib/classArticle.hook";
import {
  useAllVehicles,
  useVehicleClientDebtInfo,
  useVehicles,
} from "../../vehiculos/lib/vehicles.hook";
import { CM_COMERCIAL_ID } from "@/features/ap/ap-master/lib/apMaster.constants";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { FormTextArea } from "@/shared/components/FormTextArea";

// ── Primitives ──────────────────────────────────────────────────────────────

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
    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">
      {label}
    </p>
    <p className="text-sm font-medium text-gray-800 leading-snug">{value ?? "—"}</p>
  </div>
);

const Divider = () => <div className="border-t border-gray-100" />;

const SectionHeader = ({
  icon: Icon,
  title,
  badge,
}: {
  icon: React.ElementType;
  title: string;
  badge?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between px-5 py-3.5">
    <div className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 text-gray-400" />
      <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">
        {title}
      </span>
    </div>
    {badge}
  </div>
);

// ── Form ────────────────────────────────────────────────────────────────────

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
    defaultValues: { ...defaultValues },
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

  const watchSedeId = form.watch("sede_id");

  const { data: vehiclesVn = [], isLoading: isLoadingVehicles } =
    useAllVehicles({
      warehouse$sede_id: watchSedeId ? Number(watchSedeId) : undefined,
      warehouse$is_received: 1,
      warehouse$article_class_id: watchArticleClassId,
      has_delivery_guide: 0,
      has_vehicle_delivery: 0,
    });

  const selectedVehicleId = form.watch("vehicle_id");

  const { data: debtInfo, isLoading: isLoadingDebtInfo } =
    useVehicleClientDebtInfo(
      selectedVehicleId ? Number(selectedVehicleId) : null,
    );

  const hasReception = debtInfo?.reception != null;
  const canSave = (debtInfo?.debt_summary.debt_is_paid ?? false) && hasReception;

  useEffect(() => {
    const currentVehicleId = form.getValues("vehicle_id");
    if (currentVehicleId && vehiclesVn.length > 0) {
      const vehicleExists = vehiclesVn.some(
        (v) => v.id.toString() === currentVehicleId,
      );
      if (!vehicleExists)
        form.setValue("vehicle_id", "", { shouldValidate: false });
    } else if (
      currentVehicleId &&
      !isLoadingVehicles &&
      vehiclesVn.length === 0
    ) {
      form.setValue("vehicle_id", "", { shouldValidate: false });
    }
  }, [watchSedeId, vehiclesVn, isLoadingVehicles]);

  useEffect(() => {
    if (mode === "update" && isFirstLoad) {
      setIsFirstLoad(false);
      return;
    }
    if (watchArticleClassId) {
      const sede = form.getValues("sede_id");
      if (sede) form.setValue("sede_id", "", { shouldValidate: false });
    }
  }, [watchArticleClassId]);

  if (isLoadingArticleClass) return <FormSkeleton />;

  const isPaid = debtInfo?.debt_summary.debt_is_paid ?? false;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        {/* Selección */}
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

        {/* Panel de vehículo */}
        {selectedVehicleId && (
          <>
            {isLoadingDebtInfo ? (
              <div className="flex items-center gap-3 py-8 px-6 rounded-2xl border border-gray-100 bg-white shadow-sm text-sm text-gray-300">
                <Loader className="h-4 w-4 animate-spin" />
                Cargando información del vehículo…
              </div>
            ) : debtInfo ? (
              <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                {/* Accent strip */}
                <div
                  className={`h-[3px] w-full ${isPaid ? "bg-emerald-500" : "bg-red-400"}`}
                />

                {/* Hero */}
                <div className="px-6 py-5 flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className={`shrink-0 p-3 rounded-2xl ${
                        isPaid ? "bg-emerald-50" : "bg-red-50"
                      }`}
                    >
                      <Car
                        className={`h-7 w-7 ${
                          isPaid ? "text-emerald-600" : "text-red-500"
                        }`}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                        VIN
                      </p>
                      <p className="text-2xl font-bold text-gray-900 tracking-tight truncate leading-tight">
                        {debtInfo.vehicle.vin}
                      </p>
                      <p className="text-sm text-gray-400 mt-0.5 truncate">
                        <span className="font-medium text-gray-600">
                          {debtInfo.vehicle.model.brand}
                        </span>{" "}
                        · {debtInfo.vehicle.model.version} ·{" "}
                        {debtInfo.vehicle.year}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${
                        isPaid
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {isPaid ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <AlertCircle className="h-3.5 w-3.5" />
                      )}
                      {isPaid ? "Deuda Pagada" : "Deuda Pendiente"}
                    </div>
                    <span
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide border"
                      style={{
                        color: debtInfo.vehicle.status_color,
                        borderColor: debtInfo.vehicle.status_color + "40",
                        backgroundColor: debtInfo.vehicle.status_color + "12",
                      }}
                    >
                      {debtInfo.vehicle.vehicle_status}
                    </span>
                  </div>
                </div>

                {/* Financial strip */}
                <div className="border-t border-gray-100 grid grid-cols-3 divide-x divide-gray-100">
                  <div className="px-5 py-4">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">
                      Precio Venta
                    </p>
                    <p className="text-lg font-bold text-gray-900 tracking-tight">
                      ${" "}
                      {debtInfo.debt_summary.total_sale_price.toLocaleString(
                        "es-PE",
                        { minimumFractionDigits: 2 },
                      )}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Cot. #{debtInfo.purchase_quote.correlative}
                    </p>
                  </div>
                  <div className="px-5 py-4">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">
                      Total Pagado
                    </p>
                    <p className="text-lg font-bold text-emerald-600 tracking-tight">
                      ${" "}
                      {debtInfo.debt_summary.total_paid.toLocaleString("es-PE", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {debtInfo.documents_summary.total_documents} documento
                      {debtInfo.documents_summary.total_documents !== 1
                        ? "s"
                        : ""}
                    </p>
                  </div>
                  <div className="px-5 py-4">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">
                      Estado
                    </p>
                    <p
                      className={`text-lg font-bold tracking-tight ${isPaid ? "text-emerald-600" : "text-red-500"}`}
                    >
                      {debtInfo.debt_summary.status}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                      {debtInfo.debt_summary.message}
                    </p>
                  </div>
                </div>

                {/* Alerta sin recepción */}
                {!hasReception && (
                  <>
                    <Divider />
                    <div className="mx-5 my-4 flex items-start gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50">
                      <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-amber-800">
                          Sin recepción registrada
                        </p>
                        <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                          Este vehículo no tiene una guía de recepción. No es
                          posible procesar la entrega hasta que se registre la
                          recepción en el sistema.
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {/* Identificación del vehículo */}
                <Divider />
                <SectionHeader icon={Hash} title="Identificación del Vehículo" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4 px-5 pb-5">
                  <InfoItem label="VIN" value={debtInfo.vehicle.vin} span={2} />
                  <InfoItem
                    label="Placa"
                    value={debtInfo.vehicle.plate ?? "—"}
                  />
                  <InfoItem label="Año" value={debtInfo.vehicle.year} />
                  <InfoItem
                    label="Color"
                    value={debtInfo.vehicle.vehicle_color}
                  />
                  <InfoItem
                    label="Tipo Motor"
                    value={debtInfo.vehicle.engine_type}
                  />
                  <InfoItem
                    label="N° Motor"
                    value={debtInfo.vehicle.engine_number}
                    span={2}
                  />
                  <InfoItem
                    label="Sede"
                    value={debtInfo.vehicle.sede_name_warehouse ?? "—"}
                  />
                  <InfoItem
                    label="Almacén"
                    value={debtInfo.vehicle.warehouse_name ?? "—"}
                  />
                </div>

                {/* Cliente */}
                <Divider />
                <SectionHeader icon={User} title="Datos del Cliente" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 px-5 pb-5">
                  <InfoItem
                    label="N° Documento"
                    value={debtInfo.client.num_doc}
                  />
                  <InfoItem label="Email" value={debtInfo.client.email} />
                  <InfoItem
                    label="Razón Social / Nombre"
                    value={debtInfo.client.full_name}
                    span={2}
                  />
                  <InfoItem
                    label="Dirección"
                    value={debtInfo.client.direction}
                    span={2}
                  />
                </div>

                {/* Especificaciones */}
                <Divider />
                <SectionHeader
                  icon={Wrench}
                  title="Especificaciones del Modelo"
                  badge={
                    <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {debtInfo.vehicle.model.code}
                    </span>
                  }
                />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4 px-5 pb-5">
                  <InfoItem label="Marca" value={debtInfo.vehicle.model.brand} />
                  <InfoItem
                    label="Familia"
                    value={debtInfo.vehicle.model.family}
                  />
                  <InfoItem label="Clase" value={debtInfo.vehicle.model.class} />
                  <InfoItem
                    label="Año Modelo"
                    value={debtInfo.vehicle.model.model_year}
                  />
                  <InfoItem
                    label="Tipo Vehículo"
                    value={debtInfo.vehicle.model.vehicle_type}
                  />
                  <InfoItem
                    label="Carrocería"
                    value={debtInfo.vehicle.model.body_type}
                  />
                  <InfoItem
                    label="Tracción"
                    value={debtInfo.vehicle.model.traction_type}
                  />
                  <InfoItem
                    label="Transmisión"
                    value={debtInfo.vehicle.model.transmission}
                  />
                  <InfoItem
                    label="Combustible"
                    value={debtInfo.vehicle.model.fuel}
                  />
                  <InfoItem
                    label="Potencia"
                    value={debtInfo.vehicle.model.power}
                  />
                  <InfoItem
                    label="Cilindros"
                    value={debtInfo.vehicle.model.cylinders_number}
                  />
                  <InfoItem
                    label="Pasajeros"
                    value={debtInfo.vehicle.model.passengers_number}
                  />
                  <InfoItem
                    label="Ruedas"
                    value={debtInfo.vehicle.model.wheels_number}
                  />
                  <InfoItem
                    label="Peso Neto"
                    value={`${debtInfo.vehicle.model.net_weight} kg`}
                  />
                  <InfoItem
                    label="Peso Bruto"
                    value={`${debtInfo.vehicle.model.gross_weight} kg`}
                  />
                </div>

                {/* Facturas */}
                {debtInfo.facturas.length > 0 && (
                  <>
                    <Divider />
                    <SectionHeader
                      icon={Receipt}
                      title="Documentos de Venta"
                      badge={
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                            {debtInfo.documents_summary.total_facturas} Factura
                            {debtInfo.documents_summary.total_facturas !== 1
                              ? "s"
                              : ""}
                          </span>
                          {debtInfo.documents_summary.total_notas_credito >
                            0 && (
                            <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                              {
                                debtInfo.documents_summary.total_notas_credito
                              }{" "}
                              N. Crédito
                            </span>
                          )}
                          {debtInfo.documents_summary.total_notas_debito >
                            0 && (
                            <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                              {debtInfo.documents_summary.total_notas_debito} N.
                              Débito
                            </span>
                          )}
                        </div>
                      }
                    />
                    <div className="px-5 pb-5">
                      <table className="w-full">
                        <thead>
                          <tr>
                            {[
                              "Documento",
                              "Tipo",
                              "Fecha Emisión",
                              "Moneda",
                              "Total",
                            ].map((h) => (
                              <th
                                key={h}
                                className="text-left pb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-widest"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {debtInfo.facturas.map((factura, i) => (
                            <tr
                              key={factura.id}
                              className={
                                i % 2 === 0 ? "bg-gray-50/60 rounded-lg" : ""
                              }
                            >
                              <td className="px-2 py-2.5 text-xs font-bold text-gray-800 rounded-l-lg">
                                {factura.document_number}
                              </td>
                              <td className="px-2 py-2.5">
                                <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                  {factura.tipo_documento}
                                </span>
                              </td>
                              <td className="px-2 py-2.5 text-xs text-gray-500">
                                {factura.fecha_emision}
                              </td>
                              <td className="px-2 py-2.5 text-xs text-gray-500">
                                {factura.moneda}
                              </td>
                              <td className="px-2 py-2.5 text-right text-sm font-bold text-gray-800 rounded-r-lg">
                                ${" "}
                                {Number(factura.total).toLocaleString("es-PE", {
                                  minimumFractionDigits: 2,
                                })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

                {/* Recepción */}
                {debtInfo.reception && (
                  <>
                    <Divider />
                    <SectionHeader
                      icon={Truck}
                      title="Recepción del Vehículo"
                      badge={
                        <span className="text-[10px] font-semibold text-cyan-700 bg-cyan-100 px-2 py-0.5 rounded-full">
                          {debtInfo.reception.document_number}
                        </span>
                      }
                    />
                    <div className="px-5 pb-5 space-y-5">
                      {/* Meta */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
                        <InfoItem
                          label="Guía de Remisión"
                          value={debtInfo.reception.document_number}
                        />
                        <InfoItem
                          label="Fecha Emisión"
                          value={debtInfo.reception.issue_date}
                        />
                        <InfoItem
                          label="Fecha Recepción"
                          value={
                            debtInfo.reception.received_date
                              ? new Date(
                                  debtInfo.reception.received_date,
                                ).toLocaleDateString("es-PE", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "—"
                          }
                        />
                        <InfoItem
                          label="Recibido por"
                          value={debtInfo.reception.received_by}
                        />
                      </div>

                      {/* Nota de recepción */}
                      {debtInfo.reception.note_received && (
                        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-100">
                          <FileText className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-widest mb-0.5">
                              Nota de Recepción
                            </p>
                            <p className="text-sm text-amber-800 font-medium leading-snug">
                              {debtInfo.reception.note_received}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Checklist */}
                      {debtInfo.reception.checklist_items.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Package className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                              Checklist de accesorios
                            </span>
                            <span className="text-[10px] font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                              {debtInfo.reception.checklist_items.length}
                            </span>
                          </div>
                          <table className="w-full">
                            <thead>
                              <tr>
                                {["Accesorio", "Cant.", "Km"].map((h) => (
                                  <th
                                    key={h}
                                    className="text-left pb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-widest"
                                  >
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {debtInfo.reception.checklist_items.map(
                                (item, i) => (
                                  <tr
                                    key={item.id}
                                    className={
                                      i % 2 === 0 ? "bg-gray-50/60" : ""
                                    }
                                  >
                                    <td className="px-2 py-2 text-sm font-medium text-gray-700 rounded-l-lg">
                                      {item.description}
                                    </td>
                                    <td className="px-2 py-2 text-sm text-gray-500 text-center">
                                      {item.quantity}
                                    </td>
                                    <td className="px-2 py-2 text-sm text-gray-500 rounded-r-lg">
                                      {Number(item.kilometers).toLocaleString(
                                        "es-PE",
                                      )}{" "}
                                      km
                                    </td>
                                  </tr>
                                ),
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Inspección visual */}
                      {debtInfo.reception.inspection && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Eye className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                              Inspección Visual
                            </span>
                          </div>

                          {/* Meta inspección */}
                          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                            <InfoItem
                              label="Inspeccionado por"
                              value={
                                debtInfo.reception.inspection.inspected_by
                              }
                            />
                            <InfoItem
                              label="Fecha Inspección"
                              value={new Date(
                                debtInfo.reception.inspection.created_at,
                              ).toLocaleString("es-PE", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            />
                          </div>

                          {/* Observaciones generales */}
                          {debtInfo.reception.inspection
                            .general_observations && (
                            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
                                Observaciones generales
                              </p>
                              <p className="text-sm font-medium text-gray-700 leading-snug">
                                {
                                  debtInfo.reception.inspection
                                    .general_observations
                                }
                              </p>
                            </div>
                          )}

                          {/* Fotos 2×2 */}
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              {
                                url: debtInfo.reception.inspection
                                  .photo_front_url,
                                label: "Frontal",
                              },
                              {
                                url: debtInfo.reception.inspection
                                  .photo_back_url,
                                label: "Trasero",
                              },
                              {
                                url: debtInfo.reception.inspection
                                  .photo_left_url,
                                label: "Lateral Izq.",
                              },
                              {
                                url: debtInfo.reception.inspection
                                  .photo_right_url,
                                label: "Lateral Der.",
                              },
                            ].map(({ url, label }) => (
                              <div
                                key={label}
                                className="relative rounded-xl overflow-hidden aspect-4/3 bg-gray-100 group"
                              >
                                <img
                                  src={url}
                                  alt={label}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                                <div className="absolute bottom-2.5 left-3">
                                  <span className="text-white text-[10px] font-bold uppercase tracking-widest drop-shadow">
                                    {label}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Daños */}
                          {debtInfo.reception.inspection.damages.length > 0 && (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <ShieldAlert className="h-3.5 w-3.5 text-red-400" />
                                <span className="text-[10px] font-semibold text-red-400 uppercase tracking-widest">
                                  Daños registrados
                                </span>
                                <span className="text-[10px] font-semibold bg-red-100 text-red-500 px-2 py-0.5 rounded-full">
                                  {
                                    debtInfo.reception.inspection.damages
                                      .length
                                  }
                                </span>
                              </div>
                              <div className="space-y-2">
                                {debtInfo.reception.inspection.damages.map(
                                  (damage) => (
                                    <div
                                      key={damage.id}
                                      className="flex items-start gap-3 p-3 rounded-xl bg-red-50 border border-red-100"
                                    >
                                      <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-red-100">
                                        <img
                                          src={damage.photo_url}
                                          alt={damage.damage_type}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                      <div className="min-w-0 pt-0.5">
                                        <p className="text-xs font-bold text-red-700 uppercase tracking-wide">
                                          {damage.damage_type}
                                        </p>
                                        {damage.description && (
                                          <p className="text-xs text-red-600 mt-0.5 leading-snug">
                                            {damage.description}
                                          </p>
                                        )}
                                        <p className="text-[10px] text-red-400 mt-1">
                                          Coord. (
                                          {Number(
                                            damage.x_coordinate,
                                          ).toFixed(1)}
                                          ,{" "}
                                          {Number(
                                            damage.y_coordinate,
                                          ).toFixed(1)}
                                          )
                                        </p>
                                      </div>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Historial de movimientos */}
                {debtInfo.vehicle.movements.length > 0 && (
                  <>
                    <Divider />
                    <SectionHeader
                      icon={Activity}
                      title="Historial de Movimientos"
                      badge={
                        <span className="text-[10px] font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                          {debtInfo.vehicle.movements.length}
                        </span>
                      }
                    />
                    <div className="px-5 pb-5">
                      {debtInfo.vehicle.movements.map((mov, i) => (
                        <div key={mov.id} className="flex gap-3">
                          <div className="flex flex-col items-center shrink-0">
                            <div
                              className="w-2 h-2 rounded-full mt-1.5 ring-2 ring-white"
                              style={{ backgroundColor: mov.status_color }}
                            />
                            {i < debtInfo.vehicle.movements.length - 1 && (
                              <div className="w-px bg-gray-100 flex-1 my-1" />
                            )}
                          </div>
                          <div className="pb-4 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className="text-[10px] font-bold uppercase tracking-wide"
                                style={{ color: mov.status_color }}
                              >
                                {mov.status}
                              </span>
                              <span className="flex items-center gap-1 text-[10px] text-gray-400">
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
                              <p className="text-xs text-gray-400 mt-0.5 leading-snug">
                                {mov.observation}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 py-6 px-5 rounded-2xl border border-gray-100 bg-white shadow-sm text-sm text-gray-400">
                <AlertCircle className="h-4 w-4 text-gray-300 shrink-0" />
                No se encontró información para el vehículo seleccionado.
              </div>
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

        <div className="flex gap-3 w-full justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid || !canSave}
          >
            <Loader
              className={`mr-2 h-4 w-4 animate-spin ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting ? "Guardando…" : "Guardar Entrega"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
