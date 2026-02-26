"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ClipboardList,
  CalendarDays,
  User,
  MapPin,
  CheckCircle2,
  Clock,
  AlertCircle,
  Wrench,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  RotateCcw,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getVehicleWorkOrderHistory } from "@/features/ap/post-venta/taller/orden-trabajo/lib/workOrder.actions";
import {
  VehicleWorkOrderHistoryItem,
  VehicleWorkOrderHistoryPart,
  VehicleWorkOrderHistoryWork,
} from "@/features/ap/post-venta/taller/orden-trabajo/lib/workOrder.interface";
import GeneralSheet from "@/shared/components/GeneralSheet";

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatDate = (value: string | null): string => {
  if (!value) return "-";
  const date = new Date(value);
  return date.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value: string | null): string => {
  if (!value) return "-";
  const date = new Date(value);
  return date.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; dotColor: string; icon: React.ReactNode }
> = {
  CERRADA: {
    label: "Cerrada",
    color: "text-green-700 bg-green-50 border-green-200",
    dotColor: "#16a34a",
    icon: <CheckCircle2 className="size-3.5" />,
  },
  CERRADO: {
    label: "Cerrada",
    color: "text-green-700 bg-green-50 border-green-200",
    dotColor: "#16a34a",
    icon: <CheckCircle2 className="size-3.5" />,
  },
  TERMINADO: {
    label: "Terminado",
    color: "text-blue-700 bg-blue-50 border-blue-200",
    dotColor: "#2563eb",
    icon: <CheckCircle2 className="size-3.5" />,
  },
  "EN TRABAJO": {
    label: "En Trabajo",
    color: "text-amber-700 bg-amber-50 border-amber-200",
    dotColor: "#d97706",
    icon: <Clock className="size-3.5" />,
  },
  RECEPCIONADO: {
    label: "Recepcionado",
    color: "text-purple-700 bg-purple-50 border-purple-200",
    dotColor: "#7c3aed",
    icon: <ClipboardList className="size-3.5" />,
  },
  APERTURADO: {
    label: "Aperturado",
    color: "text-sky-700 bg-sky-50 border-sky-200",
    dotColor: "#0284c7",
    icon: <ClipboardList className="size-3.5" />,
  },
  ANULADO: {
    label: "Anulado",
    color: "text-red-700 bg-red-50 border-red-200",
    dotColor: "#dc2626",
    icon: <AlertCircle className="size-3.5" />,
  },
};

const getStatusConfig = (status: string) =>
  STATUS_CONFIG[status.toUpperCase()] ?? {
    label: status,
    color: "text-gray-700 bg-gray-50 border-gray-200",
    dotColor: "#6b7280",
    icon: <ClipboardList className="size-3.5" />,
  };

// ─── Part Item ───────────────────────────────────────────────────────────────

const PartItem = ({ part }: { part: VehicleWorkOrderHistoryPart }) => (
  <div className="flex items-center justify-between gap-3 py-2 border-b border-border/50 last:border-0">
    <div className="flex gap-3 min-w-0">
      <div className="mt-0.5 size-6 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
        <Package className="size-3 text-orange-600" />
      </div>
      <p className="text-sm font-medium leading-snug truncate">
        {part.description}
      </p>
    </div>
    <span className="text-xs text-muted-foreground shrink-0">
      x{part.quantity}
    </span>
  </div>
);

// ─── Work Item ───────────────────────────────────────────────────────────────

const WorkItem = ({ work }: { work: VehicleWorkOrderHistoryWork }) => (
  <div className="flex gap-3 py-2.5 border-b border-border/50 last:border-0">
    <div className="mt-0.5 size-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
      <Wrench className="size-3 text-primary" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium leading-snug">{work.description}</p>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
        {work.worker && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <User className="size-3" />
            {work.worker}
          </span>
        )}
        {work.actual_hours != null && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3" />
            {work.actual_hours}h
          </span>
        )}
        {work.actual_start_datetime && (
          <span className="text-xs text-muted-foreground">
            {formatDateTime(work.actual_start_datetime)}
            {work.actual_end_datetime &&
              ` → ${formatDateTime(work.actual_end_datetime)}`}
          </span>
        )}
      </div>
    </div>
  </div>
);

// ─── Timeline Card ────────────────────────────────────────────────────────────

const TimelineCard = ({
  item,
  isLast,
}: {
  item: VehicleWorkOrderHistoryItem;
  isLast: boolean;
}) => {
  const [expanded, setExpanded] = useState(false);
  const cfg = getStatusConfig(item.status);
  const hasWorks = item.works_performed.length > 0;
  const hasParts = item.parts_used.length > 0;

  return (
    <div className="relative flex gap-4">
      {/* Dot + line */}
      <div className="flex flex-col items-center">
        <div
          className="size-3 rounded-full mt-1.5 shrink-0 ring-4 ring-background"
          style={{ backgroundColor: cfg.dotColor }}
        />
        {!isLast && <div className="w-px flex-1 mt-1 mb-0 bg-border" />}
      </div>

      {/* Card */}
      <div className={cn("flex-1 pb-6", isLast && "pb-2")}>
        <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
          <div className="flex items-start justify-between gap-3 p-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm">
                  {item.correlative}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border",
                    cfg.color,
                  )}
                >
                  {cfg.icon}
                  {cfg.label}
                </span>
                {item.is_guarantee && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border text-emerald-700 bg-emerald-50 border-emerald-200">
                    <ShieldCheck className="size-3" />
                    Garantía
                  </span>
                )}
                {item.is_recall && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border text-orange-700 bg-orange-50 border-orange-200">
                    <RotateCcw className="size-3" />
                    Recall
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarDays className="size-3" />
                  Apertura: {formatDate(item.opening_date)}
                </span>
                {item.actual_delivery_date && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CheckCircle2 className="size-3" />
                    Entrega: {formatDate(item.actual_delivery_date)}
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <User className="size-3" />
                  {item.advisor}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3" />
                  {item.sede}
                </span>
              </div>

              {item.observations && (
                <p className="mt-2 text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1.5 leading-snug">
                  {item.observations}
                </p>
              )}
            </div>
          </div>

          {hasWorks && (
            <>
              <button
                onClick={() => setExpanded((v) => !v)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/40 transition-colors border-t border-border/50"
              >
                <span className="flex items-center gap-1.5">
                  <Wrench className="size-3" />
                  {item.works_performed.length}{" "}
                  {item.works_performed.length === 1
                    ? "trabajo realizado"
                    : "trabajos realizados"}
                </span>
                {expanded ? (
                  <ChevronUp className="size-3.5" />
                ) : (
                  <ChevronDown className="size-3.5" />
                )}
              </button>

              {expanded && (
                <div className="px-3 pb-2">
                  {item.works_performed.map((w, i) => (
                    <WorkItem key={i} work={w} />
                  ))}
                </div>
              )}
            </>
          )}

          {hasParts && (
            <>
              <div className="border-t border-border/50 px-3 py-2">
                <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Package className="size-3" />
                  {item.parts_used.length}{" "}
                  {item.parts_used.length === 1
                    ? "repuesto utilizado"
                    : "repuestos utilizados"}
                </span>
              </div>
              <div className="px-3 pb-2">
                {item.parts_used.map((p, i) => (
                  <PartItem key={i} part={p} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

const HistorySkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex gap-4">
        <div className="flex flex-col items-center">
          <Skeleton className="size-3 rounded-full mt-1.5" />
          <Skeleton className="w-px h-24 mt-1" />
        </div>
        <div className="flex-1 space-y-2 pb-6">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    ))}
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-12 gap-3">
    <div className="size-14 rounded-full bg-muted flex items-center justify-center">
      <ClipboardList className="size-7 text-muted-foreground" />
    </div>
    <div className="text-center">
      <p className="text-sm font-medium">Sin historial</p>
      <p className="text-xs text-muted-foreground mt-1">
        Este vehículo no tiene órdenes de trabajo registradas
      </p>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  vehicleId: number;
  vehiclePlate?: string;
}

export default function VehicleWorkOrderHistory({
  vehicleId,
  vehiclePlate,
}: Props) {
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["vehicleWorkOrderHistory", vehicleId],
    queryFn: () => getVehicleWorkOrderHistory(vehicleId),
    enabled: open,
  });

  const history = data?.data ?? [];

  return (
    <>
      <Button
        size="icon"
        variant="outline"
        className="size-7"
        tooltip="Historial de Mantenimientos y Reparaciones"
        onClick={() => setOpen(true)}
      >
        <ClipboardList className="size-4" />
      </Button>

      <GeneralSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Historial de Mantenimientos y Reparaciones"
        subtitle={vehiclePlate ? `Vehículo: ${vehiclePlate}` : undefined}
        icon="ClipboardList"
        size="3xl"
        childrenFooter={
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cerrar
          </Button>
        }
      >
        {isLoading ? (
          <HistorySkeleton />
        ) : history.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge color="blue">
                {history.length} {history.length === 1 ? "orden" : "órdenes"}
              </Badge>
              {data?.vehicle_vin && (
                <span className="text-xs text-muted-foreground">
                  VIN: {data.vehicle_vin}
                </span>
              )}
            </div>
            <Separator />
            <div className="pt-2">
              {history.map((item, index) => (
                <TimelineCard
                  key={item.correlative}
                  item={item}
                  isLast={index === history.length - 1}
                />
              ))}
            </div>
          </div>
        )}
      </GeneralSheet>
    </>
  );
}
