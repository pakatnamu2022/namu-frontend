"use client";

import { useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AlertCircle, AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatHours, formatMoney } from "@/core/core.function";
import PageWrapper from "@/shared/components/PageWrapper";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { DataTable } from "@/shared/components/DataTable";
import SearchInput from "@/shared/components/SearchInput";
import { useProductivityTechnicianDetail } from "../lib/productivityDashboard.hook";
import { toDateRange } from "../lib/productivityDashboard.actions";
import { PRODUCTIVITY_DASHBOARD } from "../lib/productivityDashboard.constants";
import {
  productivityWorkOrderColumns,
  productivityWorkOrderWithoutLabourColumns,
} from "./ProductivityWorkOrderColumns";
import ProductivityWorkOrderDetailSheet from "./ProductivityWorkOrderDetailSheet";

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

export default function ProductivityTechnicianDetailPage() {
  const router = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const [workOrderSearch, setWorkOrderSearch] = useState("");
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<number | null>(
    null,
  );

  const workerId = Number(params.workerId);
  const year = Number(searchParams.get("year"));
  const month = Number(searchParams.get("month"));
  const sedeIdParam = searchParams.get("sedeId");
  const sedeId = sedeIdParam ? Number(sedeIdParam) : undefined;
  const sedeName = searchParams.get("sedeName") || undefined;

  const filters = useMemo(() => {
    if (!workerId || !year || !month) return null;
    return {
      worker_id: workerId,
      date_range: toDateRange(year, month),
      sede_id: sedeId,
    };
  }, [workerId, year, month, sedeId]);

  const { data, isLoading, isError } = useProductivityTechnicianDetail(filters);

  const detail = data?.data;
  const workOrderColumns = useMemo(
    () => productivityWorkOrderColumns(setSelectedWorkOrderId),
    [],
  );
  const workOrderWithoutLabourColumns = useMemo(
    () => productivityWorkOrderWithoutLabourColumns(setSelectedWorkOrderId),
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

  const handleBack = () => {
    router(PRODUCTIVITY_DASHBOARD.ABSOLUTE_ROUTE);
  };

  return (
    <PageWrapper>
      <Card className="p-4 sm:p-6">
        <div className="flex items-start sm:items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold truncate">
              {detail
                ? detail.technician_info.worker_name
                : "Detalle de productividad"}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              {sedeName && <span>{sedeName}</span>}
              {detail && <span>DNI: {detail.technician_info.worker_dni}</span>}
              {detail && <span>{detail.period.description}</span>}
            </div>
          </div>
        </div>
      </Card>

      {isLoading && <FormSkeleton />}

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
              Órdenes de trabajo con mano de obra ({filteredWorkOrders.length})
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

      <ProductivityWorkOrderDetailSheet
        workOrderId={selectedWorkOrderId}
        nameTechnician={detail?.technician_info.worker_name || "-"}
        onClose={() => setSelectedWorkOrderId(null)}
      />
    </PageWrapper>
  );
}
