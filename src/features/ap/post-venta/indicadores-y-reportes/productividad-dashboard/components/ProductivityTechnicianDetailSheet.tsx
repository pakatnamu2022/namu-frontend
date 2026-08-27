"use client";

import { useMemo, useState } from "react";
import { Loader2, AlertCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatHours, formatMoney } from "@/core/core.function";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { DataTable } from "@/shared/components/DataTable";
import SearchInput from "@/shared/components/SearchInput";
import { useProductivityTechnicianDetail } from "../lib/productivityDashboard.hook";
import { toDateRange } from "../lib/productivityDashboard.actions";
import {
  productivityWorkOrderColumns,
  productivityWorkOrderWithoutLabourColumns,
} from "./ProductivityWorkOrderColumns";

interface ProductivityTechnicianDetailSheetProps {
  open: boolean;
  onClose: () => void;
  workerId: number | null;
  year: number;
  month: number;
  sedeId?: number;
  sedeName?: string;
}

interface SummaryItemProps {
  label: string;
  value: string;
  valueClassName?: string;
}

function SummaryItem({ label, value, valueClassName }: SummaryItemProps) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn("text-lg font-semibold", valueClassName)}>{value}</div>
    </div>
  );
}

export default function ProductivityTechnicianDetailSheet({
  open,
  onClose,
  workerId,
  year,
  month,
  sedeId,
  sedeName,
}: ProductivityTechnicianDetailSheetProps) {
  const [workOrderSearch, setWorkOrderSearch] = useState("");

  const filters = useMemo(() => {
    if (!workerId) return null;
    return {
      worker_id: workerId,
      date_range: toDateRange(year, month),
      sede_id: sedeId,
    };
  }, [workerId, year, month, sedeId]);

  const { data, isLoading, isError } = useProductivityTechnicianDetail(filters);

  const detail = data?.data;
  const workOrderColumns = useMemo(() => productivityWorkOrderColumns(), []);
  const workOrderWithoutLabourColumns = useMemo(
    () => productivityWorkOrderWithoutLabourColumns(),
    [],
  );

  const normalizedSearch = workOrderSearch.trim().toLowerCase();

  const filteredWorkOrders = useMemo(() => {
    if (!detail) return [];
    if (!normalizedSearch) return detail.work_orders;

    return detail.work_orders.filter((workOrder) => {
      const ot = workOrder.work_order_number?.toLowerCase() ?? "";
      const plate = workOrder.vehicle_plate?.toLowerCase() ?? "";
      return ot.includes(normalizedSearch) || plate.includes(normalizedSearch);
    });
  }, [detail, normalizedSearch]);

  const filteredWorkOrdersWithoutLabour = useMemo(() => {
    if (!detail) return [];
    if (!normalizedSearch) return detail.work_orders_without_labour;

    return detail.work_orders_without_labour.filter((workOrder) => {
      const ot = workOrder.work_order_number?.toLowerCase() ?? "";
      const plate = workOrder.vehicle_plate?.toLowerCase() ?? "";
      return ot.includes(normalizedSearch) || plate.includes(normalizedSearch);
    });
  }, [detail, normalizedSearch]);

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title={
        detail ? detail.technician_info.worker_name : "Detalle de productividad"
      }
      subtitle={detail ? detail.period.description : undefined}
      icon="Wrench"
      size="7xl"
      className="overflow-hidden!"
    >
      <div className="h-full">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Loader2 className="size-8 animate-spin mx-auto text-primary" />
              <p className="text-sm text-muted-foreground">
                Cargando detalle...
              </p>
            </div>
          </div>
        )}

        {!isLoading && (isError || !detail) && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <AlertCircle className="size-8 mx-auto text-red-500" />
              <p className="text-sm text-red-600">
                No se pudo cargar el detalle de productividad
              </p>
            </div>
          </div>
        )}

        {!isLoading && detail && (
          <div className="flex flex-col gap-4">
            <div className="flex gap-1.5 text-sm text-muted-foreground">
              <span className="font-semibold">{sedeName || "-"}</span>
              <span className="font-semibold">
                DNI: {detail.technician_info.worker_dni}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-muted/30 border">
              <SummaryItem
                label="Horas facturadas"
                value={formatHours(detail.summary.billed_hours)}
              />
              <SummaryItem
                label="Horas laborables"
                value={formatHours(detail.summary.standard_hours)}
              />
              <SummaryItem
                label="Productividad"
                value={`${detail.summary.productivity_hours >= 0 ? "+" : ""}${formatHours(
                  detail.summary.productivity_hours,
                )} · ${detail.summary.productivity_percentage}%`}
                valueClassName={
                  detail.summary.productivity_hours < 0
                    ? "text-red-600"
                    : "text-green-600"
                }
              />
              <SummaryItem
                label="Ganancia/hora"
                value={formatMoney(detail.summary.earnings_per_hour)}
              />
              <SummaryItem
                label="Comisión"
                value={formatMoney(detail.summary.commission)}
              />
              <SummaryItem
                label="Total OTs"
                value={detail.summary.total_work_orders.toString()}
              />
              <SummaryItem
                label="Días laborados"
                value={`${detail.summary.days_worked.toString()} / ${detail.period.total_days}`}
              />
            </div>

            {!detail.validation.cuadra && (
              <div className="flex items-start gap-2 p-3 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 text-xs">
                <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                <span>
                  Las sumas del detalle no cuadran exactamente con el resumen.
                  Verificar información.
                </span>
              </div>
            )}

            <SearchInput
              value={workOrderSearch}
              onChange={setWorkOrderSearch}
              placeholder="Buscar por N° OT o placa..."
              className="w-full md:max-w-sm"
            />

            <div className="space-y-2">
              <h3 className="text-sm font-semibold">
                Órdenes de trabajo con mano de obra ({filteredWorkOrders.length}
                )
              </h3>
              <DataTable
                columns={workOrderColumns}
                data={filteredWorkOrders}
                variant="simple"
                isVisibleColumnFilter={false}
              />
            </div>

            {filteredWorkOrdersWithoutLabour.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">
                  Órdenes de trabajo sin mano de obra (
                  {filteredWorkOrdersWithoutLabour.length})
                </h3>
                <DataTable
                  columns={workOrderWithoutLabourColumns}
                  data={filteredWorkOrdersWithoutLabour}
                  variant="simple"
                  isVisibleColumnFilter={false}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </GeneralSheet>
  );
}
