"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDiagnoseVehicleDeliveryVin } from "../lib/vehicleDelivery.hook";
import { DiagnoseVinData } from "../lib/vehicleDelivery.interface";
import { useWarehousesByCompany } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.hook";
import { CLASS_ARTICLE_ID } from "@/features/ap/configuraciones/maestros-general/clase-articulo/lib/classArticle.constants";
import { EMPRESA_AP } from "@/core/core.constants";
import { CM_COMERCIAL_ID } from "@/features/ap/ap-master/lib/apMaster.constants";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader,
  Search,
  Car,
  Warehouse,
  ScanSearch,
  PartyPopper,
  OctagonAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import GeneralSheet from "@/shared/components/GeneralSheet";

interface DiagnoseVinSedeOption {
  value: number;
  label: string;
  description?: string;
}

interface DiagnoseVinModalProps {
  open: boolean;
  onClose: () => void;
  initialVin?: string;
  /** Sede de contexto (ej. la ya seleccionada en el formulario de entrega). */
  sedeId?: number;
  sedeLabel?: string;
  /** Sedes disponibles para poder cambiar contra cuál se valida el diagnóstico. */
  sedeOptions?: DiagnoseVinSedeOption[];
}

const STATUS_STYLES: Record<
  string,
  { icon: any; iconClass: string; dotClass: string }
> = {
  pass: {
    icon: CheckCircle2,
    iconClass: "text-emerald-500",
    dotClass: "bg-emerald-50",
  },
  fail: {
    icon: XCircle,
    iconClass: "text-red-500",
    dotClass: "bg-red-50",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "text-amber-500",
    dotClass: "bg-amber-50",
  },
};

export function DiagnoseVinModal({
  open,
  onClose,
  initialVin = "",
  sedeId,
  sedeLabel,
  sedeOptions: sedeOptionsProp,
}: DiagnoseVinModalProps) {
  const [vin, setVin] = useState(initialVin.toUpperCase());
  const [result, setResult] = useState<DiagnoseVinData | null>(null);
  const [selectedSedeId, setSelectedSedeId] = useState<number | undefined>(
    sedeId,
  );

  const diagnoseMutation = useDiagnoseVehicleDeliveryVin();

  // Las sedes válidas para diagnosticar son siempre las de vehículos nuevos (class_id = 3),
  // sin importar la clase de artículo que tenga seleccionada el formulario contenedor.
  const { data: vehicleSedes = [] } = useWarehousesByCompany({
    my: 1,
    is_received: 1,
    ap_class_article_id: CLASS_ARTICLE_ID.M_VEH_NUE.toString(),
    empresa_id: EMPRESA_AP.id,
    type_operation_id: CM_COMERCIAL_ID,
    enabled: open && !sedeOptionsProp,
  });

  const sedeOptions =
    sedeOptionsProp ??
    vehicleSedes.map((item) => ({
      value: item.sede_id,
      label: item.sede,
      description: item.description,
    }));

  useEffect(() => {
    if (!open) return;
    const upperVin = initialVin.toUpperCase();
    setVin(upperVin);
    setResult(null);
    setSelectedSedeId(sedeId);
    diagnoseMutation.reset();
    if (upperVin.trim()) {
      diagnoseMutation.mutate(
        { vin: upperVin.trim(), sedeId },
        {
          onSuccess: (res) => {
            if (res.success !== false) setResult(res);
          },
        },
      );
    }
  }, [open, initialVin]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => {
    setVin("");
    setResult(null);
    diagnoseMutation.reset();
    onClose();
  };

  const handleDiagnose = (overrideSedeId?: number) => {
    const trimmed = vin.trim();
    if (!trimmed) return;
    diagnoseMutation.mutate(
      { vin: trimmed, sedeId: overrideSedeId ?? selectedSedeId },
      {
        onSuccess: (res) => {
          if (res.success !== false) setResult(res);
        },
      },
    );
  };

  const handleSedeChange = (value: string) => {
    const newSedeId = Number(value);
    setSelectedSedeId(newSedeId);
    if (vin.trim()) handleDiagnose(newSedeId);
  };

  return (
    <GeneralSheet
      open={open}
      onClose={handleClose}
      title="Diagnóstico de VIN"
      subtitle="Descubre por qué un vehículo no aparece para generar su entrega"
      icon="ScanSearch"
      size="2xl"
    >
      <div className="space-y-5 pb-1">
        {/* ── Buscador ────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={vin}
              onChange={(e) => setVin(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleDiagnose();
                }
              }}
              placeholder="Ingresa el VIN del vehículo"
              className="pl-9 h-10 font-mono tracking-wide uppercase"
              maxLength={32}
            />
          </div>
          {sedeOptions.length > 0 ? (
            <Select
              value={selectedSedeId ? selectedSedeId.toString() : undefined}
              onValueChange={handleSedeChange}
            >
              <SelectTrigger className="h-10 w-full sm:w-[220px] shrink-0 text-xs font-medium text-slate-600">
                <Warehouse className="h-3.5 w-3.5 mr-1.5 shrink-0 text-muted-foreground" />
                <SelectValue placeholder="Selecciona sede" />
              </SelectTrigger>
              <SelectContent>
                {sedeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                    {option.description ? ` · ${option.description}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            sedeLabel && (
              <div className="flex items-center gap-1.5 h-10 px-3 rounded-md bg-slate-50 text-xs font-medium text-slate-500 shrink-0">
                <Warehouse className="h-3.5 w-3.5" />
                {sedeLabel}
              </div>
            )
          )}
          <Button
            onClick={() => handleDiagnose()}
            disabled={!vin.trim() || diagnoseMutation.isPending}
            className="h-10 sm:w-auto"
          >
            <Loader
              className={cn("mr-2 h-4 w-4 animate-spin", {
                hidden: !diagnoseMutation.isPending,
              })}
            />
            {!diagnoseMutation.isPending && (
              <ScanSearch className="mr-2 h-4 w-4" />
            )}
            Diagnosticar
          </Button>
        </div>

        {/* ── Estado vacío ────────────────────────────────────────── */}
        {!result && !diagnoseMutation.isPending && (
          <div className="flex flex-col items-center justify-center gap-2.5 py-14 text-center">
            <div className="p-3.5 rounded-2xl bg-slate-50">
              <ScanSearch className="h-6 w-6 text-slate-300" />
            </div>
            <p className="text-sm font-medium text-gray-400">
              Ingresa un VIN para revisar el checklist de entrega
            </p>
          </div>
        )}

        {diagnoseMutation.isPending && (
          <div className="flex flex-col items-center justify-center gap-2.5 py-14 text-center">
            <Loader className="h-5 w-5 animate-spin text-slate-300" />
            <p className="text-sm font-medium text-gray-400">
              Analizando vehículo…
            </p>
          </div>
        )}

        {/* ── Resultado ───────────────────────────────────────────── */}
        {result && !diagnoseMutation.isPending && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-1 duration-300">
            {/* Vehículo */}
            {result.vehicle && (
              <div className="rounded-2xl bg-white shadow-md p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="shrink-0 p-2.5 rounded-xl bg-slate-100">
                    <Car className="h-5 w-5 text-slate-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase">
                      VIN
                    </p>
                    <p className="text-base font-bold text-gray-900 truncate leading-tight font-mono">
                      {result.vehicle.vin}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Warehouse className="h-3 w-3" />
                      {result.vehicle.sede} · {result.vehicle.warehouse}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase bg-slate-100 text-slate-600 shrink-0">
                  {result.vehicle.status}
                </span>
              </div>
            )}

            {/* Veredicto */}
            <div
              className={cn(
                "flex items-center gap-3 rounded-2xl p-4 shadow-md",
                result.can_generate_delivery ? "bg-emerald-50" : "bg-red-50",
              )}
            >
              {result.can_generate_delivery ? (
                <PartyPopper className="h-5 w-5 text-emerald-500 shrink-0" />
              ) : (
                <OctagonAlert className="h-5 w-5 text-red-500 shrink-0" />
              )}
              <div>
                <p
                  className={cn(
                    "text-sm font-semibold",
                    result.can_generate_delivery
                      ? "text-emerald-700"
                      : "text-red-700",
                  )}
                >
                  {result.can_generate_delivery
                    ? "Listo para generar la entrega"
                    : "Aún no se puede generar la entrega"}
                </p>
                <p
                  className={cn(
                    "text-xs mt-0.5",
                    result.can_generate_delivery
                      ? "text-emerald-600/80"
                      : "text-red-600/80",
                  )}
                >
                  {result.can_generate_delivery
                    ? "Todas las validaciones fueron superadas correctamente."
                    : "Resuelve los pasos marcados en rojo o ámbar para continuar."}
                </p>
              </div>
            </div>

            {/* Pasos */}
            <div className="rounded-2xl bg-white shadow-md p-4">
              <p className="text-[10px] font-semibold text-gray-400 uppercase mb-3">
                Checklist de validación
              </p>
              <div className="space-y-0">
                {result.checks.map((check, i) => {
                  const style =
                    STATUS_STYLES[check.status] ?? STATUS_STYLES.pass;
                  const Icon = style.icon;
                  const isLast = i === result.checks.length - 1;
                  return (
                    <div key={`${check.step}-${i}`} className="flex gap-3">
                      <div className="flex flex-col items-center shrink-0">
                        <div
                          className={cn(
                            "flex items-center justify-center h-7 w-7 rounded-full",
                            style.dotClass,
                          )}
                        >
                          <Icon className={cn("h-4 w-4", style.iconClass)} />
                        </div>
                        {!isLast && (
                          <div className="w-px bg-gray-100 flex-1 my-1" />
                        )}
                      </div>
                      <div className={cn("min-w-0", isLast ? "pb-0" : "pb-4")}>
                        <p className="text-sm font-semibold text-gray-800 pt-0.5">
                          {check.step}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                          {check.message}
                        </p>
                        {check.action && (
                          <p className="text-xs font-medium text-indigo-500 mt-1 leading-relaxed">
                            → {check.action}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </GeneralSheet>
  );
}
