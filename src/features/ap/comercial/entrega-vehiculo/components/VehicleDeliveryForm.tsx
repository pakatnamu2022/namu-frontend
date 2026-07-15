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
  X,
  ZoomIn,
  ScanSearch,
} from "lucide-react";
import { ScheduledDeliveryPicker } from "./ScheduledDeliveryPicker";
import { DiagnoseVinModal } from "./DiagnoseVinModal";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormSwitch } from "@/shared/components/FormSwitch";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { EMPRESA_AP } from "@/core/core.constants";
import { useWarehousesByCompany } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.hook";
import { useAllClassArticle } from "@/features/ap/configuraciones/maestros-general/clase-articulo/lib/classArticle.hook";
import {
  useVehicleClientDebtInfo,
  useVehicles,
} from "../../vehiculos/lib/vehicles.hook";
import { CM_COMERCIAL_ID } from "@/features/ap/ap-master/lib/apMaster.constants";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { FormTextArea } from "@/shared/components/FormTextArea";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { VEHICLE_STATUS_ID } from "@/features/ap/configuraciones/vehiculos/estados-vehiculo/lib/vehicleStatus.constants";

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
    <p className="text-[10px] font-semibold text-gray-400 uppercase mb-0.5">
      {label}
    </p>
    <p className="text-xs font-medium text-gray-800 leading-snug">
      {value ?? "—"}
    </p>
  </div>
);

// ── Photo Modal ──────────────────────────────────────────────────────────────

const PhotoModal = ({
  img,
  onClose,
}: {
  img: { url: string; label: string } | null;
  onClose: () => void;
}) => {
  if (!img) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-3xl w-full rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={img.url}
          alt={img.label}
          className="w-full object-contain max-h-[80vh]"
        />
        <div className="absolute bottom-0 inset-x-0 bg-linear-to-t from-black/60 to-transparent px-4 py-3 flex items-center justify-between">
          <span className="text-white text-sm font-semibold">{img.label}</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

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
  const [modalImg, setModalImg] = useState<{
    url: string;
    label: string;
  } | null>(null);
  const [diagnoseVin, setDiagnoseVin] = useState<string | null>(null);
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

  const selectedSede = mySedes.find(
    (item) => item.sede_id.toString() === watchSedeId,
  );
  const shopId = selectedSede?.shop_id;

  const watchIsExtraordinary = form.watch("is_extraordinary");

  const selectedVehicleId = form.watch("vehicle_id");

  const { data: debtInfo, isLoading: isLoadingDebtInfo } =
    useVehicleClientDebtInfo(
      selectedVehicleId ? Number(selectedVehicleId) : null,
    );

  const hasReception = debtInfo?.reception != null;
  // const canSave = (debtInfo?.debt_summary.debt_is_paid ?? false) && hasReception;

  useEffect(() => {
    if (isFirstLoad) return;
    const currentVehicleId = form.getValues("vehicle_id");
    if (currentVehicleId)
      form.setValue("vehicle_id", "", { shouldValidate: false });
  }, [watchSedeId]);

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
      <PhotoModal img={modalImg} onClose={() => setModalImg(null)} />
      <DiagnoseVinModal
        open={diagnoseVin !== null}
        onClose={() => setDiagnoseVin(null)}
        initialVin={diagnoseVin ?? ""}
        sedeId={watchSedeId ? Number(watchSedeId) : undefined}
        sedeLabel={selectedSede?.description}
      />
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        {/* ── Selección ─────────────────────────────────────────────── */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
              additionalParams={{
                warehouse$sede_id: watchSedeId
                  ? Number(watchSedeId)
                  : undefined,
                warehouse$is_received: 1,
                warehouse$article_class_id: watchArticleClassId,
                has_delivery_guide: 0,
                has_vehicle_delivery: 0,
                // is_paid: 1,
                is_received: 1,
                vehicleMovements$new_status_id:
                  VEHICLE_STATUS_ID.VEHICULO_FACTURADO_FINAL,
              }}
              mapOptionFn={(item) => ({
                label: item.vin,
                value: item.id.toString(),
                description:
                  item.sede_name_warehouse + " - " + item.warehouse_name || "",
              })}
              control={form.control}
              disabled={isSupplier ? false : !watchSedeId}
              renderEmpty={(search) =>
                search.trim() ? (
                  <div className="flex flex-col items-center gap-2 py-1">
                    <p className="text-muted-foreground">
                      No se encontró el VIN «{search.trim().toUpperCase()}» en
                      los vehículos disponibles.
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => setDiagnoseVin(search.trim())}
                    >
                      <ScanSearch className="mr-1.5 h-3.5 w-3.5" />
                      Diagnosticar este VIN
                    </Button>
                  </div>
                ) : (
                  "No hay resultados."
                )
              }
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setDiagnoseVin("")}
            >
              <ScanSearch className="mr-1.5 h-3.5 w-3.5" />
              ¿No aparece un vehículo? Diagnosticar VIN
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {mode === "create" && !isSupplier && (
              <div className="space-y-2">
                <FormSwitch
                  control={form.control}
                  name="is_extraordinary"
                  label="Entrega extraordinaria"
                  text="Permite programar la entrega en un horario ya tomado."
                  description="Esta opción requiere aprobación y enviará un email de confirmación al responsable."
                />
              </div>
            )}
            <ScheduledDeliveryPicker
              control={form.control}
              name="scheduled_delivery_date"
              label="Fecha y Hora de Entrega Programada"
              placeholder="Selecciona la fecha y hora de entrega"
              description="Lun-Vie: 9, 10, 11, 12, 15, 16 y 17h · Sáb: 10, 11 y 12h"
              minDate={(() => {
                const min = new Date();
                if (!(mode === "create" && watchIsExtraordinary)) {
                  min.setDate(min.getDate() + 1);
                }
                min.setHours(0, 0, 0, 0);
                return min;
              })()}
              autoSelectFirstAvailable={mode === "create"}
              shopId={shopId}
              allowUnavailableSlots={
                mode === "create" && !!watchIsExtraordinary
              }
            />
          </div>
        </div>

        {/* ── Panel de vehículo ──────────────────────────────────────── */}
        {selectedVehicleId && (
          <>
            {isLoadingDebtInfo ? (
              <div className="flex items-center gap-3 py-6 px-5 rounded-xl bg-gray-50 text-sm text-gray-400">
                <Loader className="h-4 w-4 animate-spin" />
                Cargando información del vehículo…
              </div>
            ) : debtInfo ? (
              <div className="space-y-3">
                {/* ── Hero ──────────────────────────────────────────────── */}
                <div className="rounded-xl bg-white shadow-md p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="shrink-0 p-2.5 rounded-xl bg-slate-100">
                        <Car className="h-6 w-6 text-slate-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase">
                          VIN
                        </p>
                        <p className="text-xl font-bold text-gray-900 truncate leading-tight font-mono">
                          {debtInfo.vehicle.vin}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          <span className="font-medium text-gray-600">
                            {debtInfo.vehicle.model.brand}
                          </span>
                          {" · "}
                          {debtInfo.vehicle.model.version}
                          {" · "}
                          {debtInfo.vehicle.year}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                      <div
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                          isPaid
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {isPaid ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <AlertCircle className="h-3 w-3" />
                        )}
                        {isPaid ? "Deuda Pagada" : "Deuda Pendiente"}
                      </div>
                      <span
                        className="text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase"
                        style={{
                          color: debtInfo.vehicle.status_color,
                          backgroundColor: debtInfo.vehicle.status_color + "18",
                        }}
                      >
                        {debtInfo.vehicle.vehicle_status}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <div className="rounded-lg bg-gray-50 px-3 py-2">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase mb-0.5">
                        Precio Venta
                      </p>
                      <p className="text-sm font-bold text-gray-900 tabular-nums">
                        S/{" "}
                        {debtInfo.debt_summary.total_sale_price.toLocaleString(
                          "es-PE",
                          { minimumFractionDigits: 2 },
                        )}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        Cot. #{debtInfo.purchase_quote.correlative}
                      </p>
                    </div>
                    <div className="rounded-lg bg-gray-50 px-3 py-2">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase mb-0.5">
                        Total Pagado
                      </p>
                      <p className="text-sm font-bold text-emerald-600 tabular-nums">
                        S/{" "}
                        {debtInfo.debt_summary.total_paid.toLocaleString(
                          "es-PE",
                          { minimumFractionDigits: 2 },
                        )}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {debtInfo.documents_summary.total_documents} doc
                        {debtInfo.documents_summary.total_documents !== 1
                          ? "s"
                          : ""}
                      </p>
                    </div>
                    <div className="rounded-lg bg-gray-50 px-3 py-2">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase mb-0.5">
                        Estado
                      </p>
                      <p
                        className={`text-sm font-bold tabular-nums ${isPaid ? "text-emerald-600" : "text-red-500"}`}
                      >
                        {debtInfo.debt_summary.status}
                      </p>
                      <p className="text-[10px] text-gray-400 truncate">
                        {debtInfo.debt_summary.message}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ── Sin recepción ──────────────────────────────────────── */}
                {!hasReception && (
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50">
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-amber-800">
                        Sin recepción registrada
                      </p>
                      <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                        Este vehículo no tiene guía de recepción. No es posible
                        procesar la entrega hasta registrarla.
                      </p>
                    </div>
                  </div>
                )}

                {/* ── Identificación + Cliente ─────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <GroupFormSection
                    icon={Hash}
                    title="Identificación"
                    color="blue"
                    cols={{ sm: 2, md: 2 }}
                    gap="gap-x-4 gap-y-3"
                  >
                    <InfoItem
                      label="VIN"
                      value={debtInfo.vehicle.vin}
                      span={2}
                    />
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
                  </GroupFormSection>

                  <GroupFormSection
                    icon={User}
                    title="Cliente"
                    color="violet"
                    cols={{ sm: 2, md: 2 }}
                    gap="gap-x-4 gap-y-3"
                  >
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
                  </GroupFormSection>
                </div>

                {/* ── Especificaciones ─────────────────────────────────── */}
                <GroupFormSection
                  icon={Wrench}
                  title="Especificaciones del Modelo"
                  color="amber"
                  cols={{ sm: 3, md: 5 }}
                  gap="gap-x-4 gap-y-3"
                  headerExtra={
                    <span className="text-[10px] font-semibold text-gray-600 bg-white/60 px-2 py-0.5 rounded-full">
                      {debtInfo.vehicle.model.code}
                    </span>
                  }
                >
                  <InfoItem
                    label="Marca"
                    value={debtInfo.vehicle.model.brand}
                  />
                  <InfoItem
                    label="Familia"
                    value={debtInfo.vehicle.model.family}
                  />
                  <InfoItem
                    label="Clase"
                    value={debtInfo.vehicle.model.class}
                  />
                  <InfoItem
                    label="Año Modelo"
                    value={debtInfo.vehicle.model.model_year}
                  />
                  <InfoItem
                    label="Tipo"
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
                </GroupFormSection>

                {/* ── Documentos de venta ──────────────────────────────── */}
                {debtInfo.facturas.length > 0 && (
                  <GroupFormSection
                    icon={Receipt}
                    title="Documentos de Venta"
                    color="emerald"
                    cols={{ sm: 1, md: 1 }}
                    headerExtra={
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold bg-white/60 text-gray-600 px-2 py-0.5 rounded-full">
                          {debtInfo.documents_summary.total_facturas} Factura
                          {debtInfo.documents_summary.total_facturas !== 1
                            ? "s"
                            : ""}
                        </span>
                        {debtInfo.documents_summary.total_notas_credito > 0 && (
                          <span className="text-[10px] font-semibold bg-white/60 text-emerald-800 px-2 py-0.5 rounded-full">
                            {debtInfo.documents_summary.total_notas_credito} N.
                            Crédito
                          </span>
                        )}
                        {debtInfo.documents_summary.total_notas_debito > 0 && (
                          <span className="text-[10px] font-semibold bg-white/60 text-amber-800 px-2 py-0.5 rounded-full">
                            {debtInfo.documents_summary.total_notas_debito} N.
                            Débito
                          </span>
                        )}
                      </div>
                    }
                  >
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
                              className="text-left pb-1.5 text-[10px] font-semibold text-gray-400 uppercase"
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
                            <td className="px-2 py-2 text-xs font-bold text-gray-800 rounded-l-lg">
                              {factura.document_number}
                            </td>
                            <td className="px-2 py-2">
                              <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                {factura.tipo_documento}
                              </span>
                            </td>
                            <td className="px-2 py-2 text-xs text-gray-500">
                              {factura.fecha_emision}
                            </td>
                            <td className="px-2 py-2 text-xs text-gray-500">
                              {factura.moneda}
                            </td>
                            <td className="px-2 py-2 text-right text-xs font-bold text-gray-800 rounded-r-lg tabular-nums">
                              S/{" "}
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

                {/* ── Recepción del vehículo ───────────────────────────── */}
                {debtInfo.reception && (
                  <GroupFormSection
                    icon={Truck}
                    title="Recepción del Vehículo"
                    color="cyan"
                    cols={{ sm: 1, md: 1 }}
                    headerExtra={
                      <span className="text-[10px] font-semibold text-cyan-800 bg-white/60 px-2 py-0.5 rounded-full">
                        {debtInfo.reception.document_number}
                      </span>
                    }
                  >
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3">
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

                      {debtInfo.reception.note_received && (
                        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50">
                          <FileText className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] font-semibold text-amber-500 uppercase mb-0.5">
                              Nota de Recepción
                            </p>
                            <p className="text-xs text-amber-800 font-medium leading-snug">
                              {debtInfo.reception.note_received}
                            </p>
                          </div>
                        </div>
                      )}

                      {debtInfo.reception.checklist_items.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Package className="h-3.5 w-3.5 text-slate-400" />
                            <span className="text-xs font-semibold text-gray-700">
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
                                    className="text-left pb-1.5 text-[10px] font-semibold text-gray-400 uppercase"
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
                                    <td className="px-2 py-1.5 text-xs font-medium text-gray-700 rounded-l-lg">
                                      {item.description}
                                    </td>
                                    <td className="px-2 py-1.5 text-xs text-gray-500 text-center">
                                      {item.quantity}
                                    </td>
                                    <td className="px-2 py-1.5 text-xs text-gray-500 rounded-r-lg">
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
                        <div className="space-y-3 pt-1">
                          <div className="flex items-center gap-2">
                            <Eye className="h-3.5 w-3.5 text-indigo-500" />
                            <span className="text-xs font-semibold text-gray-700">
                              Inspección Visual
                            </span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3">
                            <InfoItem
                              label="Inspeccionado por"
                              value={debtInfo.reception.inspection.inspected_by}
                              span={2}
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
                              span={2}
                            />
                          </div>

                          {debtInfo.reception.inspection
                            .general_observations && (
                            <div className="p-3 rounded-lg bg-gray-50">
                              <p className="text-[10px] font-semibold text-gray-400 uppercase mb-0.5">
                                Observaciones generales
                              </p>
                              <p className="text-xs font-medium text-gray-700 leading-snug">
                                {
                                  debtInfo.reception.inspection
                                    .general_observations
                                }
                              </p>
                            </div>
                          )}

                          <div className="grid grid-cols-4 gap-2">
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
                              <button
                                key={label}
                                type="button"
                                onClick={() => setModalImg({ url, label })}
                                className="relative rounded-xl overflow-hidden aspect-4/3 bg-gray-100 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-300"
                              >
                                <img
                                  src={url}
                                  alt={label}
                                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <ZoomIn className="h-5 w-5 text-white drop-shadow" />
                                </div>
                                <span className="absolute bottom-1.5 left-2 text-white text-[9px] font-bold uppercase drop-shadow">
                                  {label}
                                </span>
                              </button>
                            ))}
                          </div>

                          {debtInfo.reception.inspection.damages.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <ShieldAlert className="h-3.5 w-3.5 text-red-400" />
                                <span className="text-xs font-semibold text-gray-700">
                                  Daños registrados
                                </span>
                                <span className="text-[10px] font-semibold bg-red-100 text-red-500 px-2 py-0.5 rounded-full">
                                  {debtInfo.reception.inspection.damages.length}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {debtInfo.reception.inspection.damages.map(
                                  (damage) => (
                                    <div
                                      key={damage.id}
                                      className="flex items-start gap-2.5 p-2.5 rounded-lg bg-red-50"
                                    >
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setModalImg({
                                            url: damage.photo_url,
                                            label: damage.damage_type,
                                          })
                                        }
                                        className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-red-100 group cursor-pointer focus:outline-none"
                                      >
                                        <img
                                          src={damage.photo_url}
                                          alt={damage.damage_type}
                                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                                          <ZoomIn className="h-4 w-4 text-white" />
                                        </div>
                                      </button>
                                      <div className="min-w-0 pt-0.5">
                                        <p className="text-[10px] font-bold text-red-700 uppercase">
                                          {damage.damage_type}
                                        </p>
                                        {damage.description && (
                                          <p className="text-[11px] text-red-600 mt-0.5 leading-snug">
                                            {damage.description}
                                          </p>
                                        )}
                                        <p className="text-[10px] text-red-400 mt-1 tabular-nums">
                                          (
                                          {Number(damage.x_coordinate).toFixed(
                                            1,
                                          )}
                                          ,{" "}
                                          {Number(damage.y_coordinate).toFixed(
                                            1,
                                          )}
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
                  </GroupFormSection>
                )}

                {/* ── Historial de movimientos ─────────────────────────── */}
                {debtInfo.vehicle.movements.length > 0 && (
                  <GroupFormSection
                    icon={Activity}
                    title="Historial de Movimientos"
                    color="slate"
                    cols={{ sm: 1, md: 1 }}
                    headerExtra={
                      <span className="text-[10px] font-semibold bg-white/60 text-gray-600 px-2 py-0.5 rounded-full">
                        {debtInfo.vehicle.movements.length}
                      </span>
                    }
                  >
                    <div className="space-y-0">
                      {debtInfo.vehicle.movements.map((mov, i) => (
                        <div key={mov.id} className="flex gap-2.5">
                          <div className="flex flex-col items-center shrink-0">
                            <div
                              className="w-2 h-2 rounded-full mt-1"
                              style={{ backgroundColor: mov.status_color }}
                            />
                            {i < debtInfo.vehicle.movements.length - 1 && (
                              <div className="w-px bg-gray-100 flex-1 my-0.5" />
                            )}
                          </div>
                          <div className="pb-3 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className="text-[10px] font-bold uppercase"
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
                              <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">
                                {mov.observation}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </GroupFormSection>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 py-5 px-4 rounded-xl bg-gray-50 text-sm text-gray-400">
                <AlertCircle className="h-4 w-4 text-gray-300 shrink-0" />
                No se encontró información para el vehículo seleccionado.
              </div>
            )}
          </>
        )}

        {/* ── Observaciones ─────────────────────────────────────────── */}
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
            {isSubmitting ? "Guardando…" : "Guardar Entrega"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
