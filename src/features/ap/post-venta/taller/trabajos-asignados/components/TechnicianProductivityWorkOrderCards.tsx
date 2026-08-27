"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wrench, AlertTriangle, Users, CalendarDays } from "lucide-react";
import { formatDate, formatHours } from "@/core/core.function";
import { CopyCell } from "@/shared/components/CopyCell";
import SearchInput from "@/shared/components/SearchInput";
import {
  TechnicianProductivityWorkOrder,
  TechnicianProductivityWorkOrderWithoutLabour,
} from "../lib/technicianProductivity.interface";

interface TechnicianProductivityWorkOrderCardsProps {
  workOrders: TechnicianProductivityWorkOrder[];
  workOrdersWithoutLabour: TechnicianProductivityWorkOrderWithoutLabour[];
}

function WorkOrderCard({ wo }: { wo: TechnicianProductivityWorkOrder }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CopyCell
              value={wo.work_order_number}
              className="font-semibold text-sm"
            />
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <CalendarDays className="size-3" />
              {formatDate(wo.fecha_facturacion)}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Placa:{" "}
              <span className="text-foreground">{wo.vehicle_plate || "-"}</span>
            </div>
          </div>
          <Badge color="blue">{wo.tipo_planificacion}</Badge>
        </div>

        <div className="text-xs text-muted-foreground">
          Asesor: <span className="text-foreground">{wo.asesor}</span>
        </div>

        {wo.descripcion_labour && (
          <div className="flex items-center gap-1.5 text-xs">
            <Wrench className="size-3 text-muted-foreground shrink-0" />
            <span className="line-clamp-1">{wo.descripcion_labour}</span>
          </div>
        )}

        <div className="flex items-end justify-between pt-2 border-t">
          <div>
            <div className="text-xs text-muted-foreground">H. facturadas</div>
            <div className="text-lg font-bold text-primary">
              {formatHours(wo.horas_facturadas_tecnico)}
            </div>
          </div>
          {wo.cantidad_tecnicos > 1 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="size-3" />
              {formatHours(wo.horas_facturadas_total_ot)} entre{" "}
              {wo.cantidad_tecnicos}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function WorkOrderWithoutLabourCard({
  wo,
}: {
  wo: TechnicianProductivityWorkOrderWithoutLabour;
}) {
  return (
    <Card className="border-amber-200 bg-amber-50/40">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CopyCell
              value={wo.work_order_number}
              className="font-semibold text-sm"
            />
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <CalendarDays className="size-3" />
              {formatDate(wo.fecha_facturacion)}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Placa:{" "}
              <span className="text-foreground">{wo.vehicle_plate || "-"}</span>
            </div>
          </div>
          <Badge color="yellow">{wo.tipo_planificacion}</Badge>
        </div>
        <div className="text-xs text-muted-foreground">
          Asesor: <span className="text-foreground">{wo.asesor}</span>
        </div>
        <div className="flex items-start gap-1.5 text-xs text-amber-800 pt-1 border-t border-amber-200">
          <AlertTriangle className="size-3 shrink-0 mt-0.5" />
          <span>{wo.observacion}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          Horas trabajadas: {formatHours(wo.horas_trabajadas)}
        </div>
      </CardContent>
    </Card>
  );
}

// Normaliza para comparación exacta: minúsculas, sin acentos y sin
// espacios/guiones/símbolos, de modo que "ABC-123", "abc 123" y "N° OT 123"
// se comparen de forma consistente.
function normalizeSearchValue(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function matchesExactSearch(
  wo: { work_order_number?: string; vehicle_plate?: string },
  normalizedSearch: string,
) {
  const workOrderNumber = normalizeSearchValue(wo.work_order_number ?? "");
  const vehiclePlate = normalizeSearchValue(wo.vehicle_plate ?? "");
  return (
    workOrderNumber === normalizedSearch || vehiclePlate === normalizedSearch
  );
}

export default function TechnicianProductivityWorkOrderCards({
  workOrders,
  workOrdersWithoutLabour,
}: TechnicianProductivityWorkOrderCardsProps) {
  const [search, setSearch] = useState("");

  const normalizedSearch = normalizeSearchValue(search);

  const filteredWorkOrders = useMemo(() => {
    if (!normalizedSearch) return workOrders;
    return workOrders.filter((wo) => matchesExactSearch(wo, normalizedSearch));
  }, [workOrders, normalizedSearch]);

  const filteredWorkOrdersWithoutLabour = useMemo(() => {
    if (!normalizedSearch) return workOrdersWithoutLabour;
    return workOrdersWithoutLabour.filter((wo) =>
      matchesExactSearch(wo, normalizedSearch),
    );
  }, [workOrdersWithoutLabour, normalizedSearch]);

  return (
    <div className="space-y-6">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar por N° OT o placa exacta..."
        className="w-full md:max-w-sm"
      />

      <div className="space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Wrench className="size-4" />
          Órdenes de trabajo con mano de obra ({filteredWorkOrders.length})
        </h3>
        {filteredWorkOrders.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            No hay órdenes de trabajo con mano de obra en el período.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredWorkOrders.map((wo, index) => (
              <WorkOrderCard
                key={`${wo.work_order_id}-${wo.descripcion_labour ?? ""}-${index}`}
                wo={wo}
              />
            ))}
          </div>
        )}
      </div>

      {filteredWorkOrdersWithoutLabour.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2 text-amber-700">
            <AlertTriangle className="size-4" />
            Órdenes de trabajo sin mano de obra (
            {filteredWorkOrdersWithoutLabour.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredWorkOrdersWithoutLabour.map((wo, index) => (
              <WorkOrderWithoutLabourCard
                key={`${wo.work_order_id}-${index}`}
                wo={wo}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
