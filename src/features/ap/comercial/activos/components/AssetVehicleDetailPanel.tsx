"use client";

import { useState } from "react";
import {
  Activity,
  AlertCircle,
  Clock,
  Eye,
  Hash,
  Loader,
  Package,
  ShieldAlert,
  Truck,
  Wrench,
  X,
  ZoomIn,
} from "lucide-react";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { AssetVehicleDetail } from "../lib/assets.interface";

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
    <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase mb-0.5">
      {label}
    </p>
    <p className="text-xs font-medium text-gray-800 dark:text-gray-100 leading-snug">
      {value ?? "—"}
    </p>
  </div>
);

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

interface Props {
  detail?: AssetVehicleDetail;
  isLoading?: boolean;
}

export const AssetVehicleDetailPanel = ({ detail, isLoading }: Props) => {
  const [modalImg, setModalImg] = useState<{
    url: string;
    label: string;
  } | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 py-6 px-5 rounded-xl bg-gray-50 dark:bg-gray-900 text-sm text-gray-400 dark:text-gray-500">
        <Loader className="h-4 w-4 animate-spin" />
        Cargando información del vehículo…
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex items-center gap-3 py-5 px-4 rounded-xl bg-gray-50 dark:bg-gray-900 text-sm text-gray-400 dark:text-gray-500">
        <AlertCircle className="h-4 w-4 text-gray-300 dark:text-gray-600 shrink-0" />
        No se encontró información para el vehículo seleccionado.
      </div>
    );
  }

  const { vehicle, reception } = detail;
  const model = vehicle.model as any;

  return (
    <div className="space-y-3">
      <PhotoModal img={modalImg} onClose={() => setModalImg(null)} />

      {/* ── Identificación ─────────────────────────────────────────── */}
      <GroupFormSection
        icon={Hash}
        title="Identificación"
        color="blue"
        cols={{ sm: 2, md: 4 }}
        gap="gap-x-4 gap-y-3"
      >
        <InfoItem label="VIN" value={vehicle.vin} span={2} />
        <InfoItem label="Placa" value={vehicle.plate ?? "—"} />
        <InfoItem label="Año" value={vehicle.year} />
        <InfoItem label="Color" value={vehicle.vehicle_color} />
        <InfoItem label="Tipo Motor" value={vehicle.engine_type} />
        <InfoItem label="N° Motor" value={vehicle.engine_number} span={2} />
        <InfoItem
          label="Sede"
          value={vehicle.sede_name_warehouse ?? "—"}
        />
        <InfoItem label="Almacén" value={vehicle.warehouse_name ?? "—"} />
        <InfoItem label="Estado" value={vehicle.vehicle_status} />
      </GroupFormSection>

      {/* ── Especificaciones del modelo ───────────────────────────── */}
      <GroupFormSection
        icon={Wrench}
        title="Especificaciones del Modelo"
        color="amber"
        cols={{ sm: 3, md: 5 }}
        gap="gap-x-4 gap-y-3"
        headerExtra={
          <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300 bg-white/60 dark:bg-white/10 px-2 py-0.5 rounded-full">
            {model?.code}
          </span>
        }
      >
        <InfoItem label="Marca" value={model?.brand} />
        <InfoItem label="Familia" value={model?.family} />
        <InfoItem label="Clase" value={model?.class} />
        <InfoItem label="Versión" value={model?.version} />
        <InfoItem label="Año Modelo" value={model?.model_year} />
        <InfoItem label="Tipo" value={model?.vehicle_type} />
        <InfoItem label="Carrocería" value={model?.body_type} />
        <InfoItem label="Tracción" value={model?.traction_type} />
        <InfoItem label="Transmisión" value={model?.transmission} />
        <InfoItem label="Combustible" value={model?.fuel} />
        <InfoItem label="Potencia" value={model?.power} />
        <InfoItem label="Cilindros" value={model?.cylinders_number} />
        <InfoItem label="Pasajeros" value={model?.passengers_number} />
        <InfoItem label="Ruedas" value={model?.wheels_number} />
        <InfoItem
          label="Peso Neto"
          value={model?.net_weight ? `${model.net_weight} kg` : "—"}
        />
        <InfoItem
          label="Peso Bruto"
          value={model?.gross_weight ? `${model.gross_weight} kg` : "—"}
        />
      </GroupFormSection>

      {/* ── Recepción del vehículo ────────────────────────────────── */}
      {reception ? (
        <GroupFormSection
          icon={Truck}
          title="Recepción del Vehículo"
          color="cyan"
          cols={{ sm: 1, md: 1 }}
          headerExtra={
            <span className="text-[10px] font-semibold text-cyan-800 dark:text-cyan-300 bg-white/60 dark:bg-white/10 px-2 py-0.5 rounded-full">
              {reception.document_number}
            </span>
          }
        >
          <div className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3">
              <InfoItem
                label="Guía de Remisión"
                value={reception.document_number}
              />
              <InfoItem
                label="Fecha Emisión (fecha de asignación)"
                value={reception.issue_date}
              />
              <InfoItem
                label="Fecha Recepción"
                value={
                  reception.received_date
                    ? new Date(reception.received_date).toLocaleDateString(
                        "es-PE",
                        { day: "2-digit", month: "short", year: "numeric" },
                      )
                    : "—"
                }
              />
              <InfoItem label="Recibido por" value={reception.received_by} />
            </div>

            {reception.checklist_items.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                    Checklist de accesorios
                  </span>
                  <span className="text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
                    {reception.checklist_items.length}
                  </span>
                </div>
                <table className="w-full">
                  <thead>
                    <tr>
                      {["Accesorio", "Cant.", "Km"].map((h) => (
                        <th
                          key={h}
                          className="text-left pb-1.5 text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reception.checklist_items.map((item, i) => (
                      <tr
                        key={item.id}
                        className={
                          i % 2 === 0 ? "bg-gray-50/60 dark:bg-gray-800/40" : ""
                        }
                      >
                        <td className="px-2 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 rounded-l-lg">
                          {item.description}
                        </td>
                        <td className="px-2 py-1.5 text-xs text-gray-500 dark:text-gray-400 text-center">
                          {item.quantity}
                        </td>
                        <td className="px-2 py-1.5 text-xs text-gray-500 dark:text-gray-400 rounded-r-lg">
                          {Number(item.kilometers).toLocaleString("es-PE")} km
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {reception.inspection && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-2">
                  <Eye className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                    Inspección Visual
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3">
                  <InfoItem
                    label="Inspeccionado por"
                    value={reception.inspection.inspected_by}
                    span={2}
                  />
                  <InfoItem
                    label="Fecha Inspección"
                    value={
                      reception.inspection.created_at
                        ? new Date(
                            reception.inspection.created_at,
                          ).toLocaleString("es-PE", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"
                    }
                    span={2}
                  />
                </div>

                {reception.inspection.general_observations && (
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase mb-0.5">
                      Observaciones generales
                    </p>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-200 leading-snug">
                      {reception.inspection.general_observations}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-4 gap-2">
                  {[
                    {
                      url: reception.inspection.photo_front_url,
                      label: "Frontal",
                    },
                    {
                      url: reception.inspection.photo_back_url,
                      label: "Trasero",
                    },
                    {
                      url: reception.inspection.photo_left_url,
                      label: "Lateral Izq.",
                    },
                    {
                      url: reception.inspection.photo_right_url,
                      label: "Lateral Der.",
                    },
                  ]
                    .filter((p) => p.url)
                    .map(({ url, label }) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setModalImg({ url, label })}
                        className="relative rounded-xl overflow-hidden aspect-4/3 bg-gray-100 dark:bg-gray-800 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-700"
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

                {reception.inspection.damages.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-3.5 w-3.5 text-red-400 dark:text-red-500" />
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                        Daños registrados
                      </span>
                      <span className="text-[10px] font-semibold bg-red-100 text-red-500 dark:bg-red-950 dark:text-red-400 px-2 py-0.5 rounded-full">
                        {reception.inspection.damages.length}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {reception.inspection.damages.map((damage) => (
                        <div
                          key={damage.id}
                          className="flex items-start gap-2.5 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40"
                        >
                          {damage.photo_url && (
                            <button
                              type="button"
                              onClick={() =>
                                setModalImg({
                                  url: damage.photo_url,
                                  label: damage.damage_type,
                                })
                              }
                              className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-red-100 dark:bg-red-950 group cursor-pointer focus:outline-none"
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
                          )}
                          <div className="min-w-0 pt-0.5">
                            <p className="text-[10px] font-bold text-red-700 dark:text-red-300 uppercase">
                              {damage.damage_type}
                            </p>
                            {damage.description && (
                              <p className="text-[11px] text-red-600 dark:text-red-400 mt-0.5 leading-snug">
                                {damage.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </GroupFormSection>
      ) : (
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950">
          <AlertCircle className="h-4 w-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              Sin recepción registrada
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5 leading-relaxed">
              Este vehículo no tiene guía de recepción de compra. Se usará la
              fecha actual como fecha de asignación.
            </p>
          </div>
        </div>
      )}

      {/* ── Historial de movimientos ──────────────────────────────── */}
      {vehicle.movements.length > 0 && (
        <GroupFormSection
          icon={Activity}
          title="Historial de Movimientos"
          color="slate"
          cols={{ sm: 1, md: 1 }}
          headerExtra={
            <span className="text-[10px] font-semibold bg-white/60 dark:bg-white/10 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
              {vehicle.movements.length}
            </span>
          }
        >
          <div className="space-y-0">
            {vehicle.movements.map((mov, i) => (
              <div key={mov.id} className="flex gap-2.5">
                <div className="flex flex-col items-center shrink-0">
                  <div
                    className="w-2 h-2 rounded-full mt-1"
                    style={{ backgroundColor: mov.status_color }}
                  />
                  {i < vehicle.movements.length - 1 && (
                    <div className="w-px bg-gray-100 dark:bg-gray-800 flex-1 my-0.5" />
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
                    <span className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500">
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
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 leading-snug">
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
  );
};
