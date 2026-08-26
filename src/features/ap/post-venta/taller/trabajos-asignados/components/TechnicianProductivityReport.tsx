"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AlertCircle, AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageWrapper from "@/shared/components/PageWrapper";
import TitleComponent from "@/shared/components/TitleComponent";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { EMPRESA_AP } from "@/core/core.constants";
import { getCurrentDayOfMonth, getFirstDayOfMonth } from "@/core/core.function";
import { useMySedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import { useAllWorkers } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import {
  POSITION_TYPE,
  STATUS_WORKER,
} from "@/features/gp/gestionhumana/gestion-de-personal/posiciones/lib/position.constant";
import { useTechnicianProductivity } from "../lib/technicianProductivity.hook";
import TechnicianProductivityFiltersBar from "./TechnicianProductivityFiltersBar";
import TechnicianProductivitySummaryCards from "./TechnicianProductivitySummaryCards";
import TechnicianProductivityCharts from "./TechnicianProductivityCharts";
import TechnicianProductivityWorkOrderCards from "./TechnicianProductivityWorkOrderCards";

export default function TechnicianProductivityReport() {
  const [searchParams] = useSearchParams();

  const currentDate = new Date();
  const [sedeId, setSedeId] = useState<string>(
    searchParams.get("sede_id") || "",
  );
  const [workerId, setWorkerId] = useState<string>(
    searchParams.get("worker_id") || "",
  );

  const initialDateFrom = searchParams.get("date_from");
  const initialDateTo = searchParams.get("date_to");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    initialDateFrom
      ? new Date(`${initialDateFrom}T00:00:00`)
      : getFirstDayOfMonth(currentDate),
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(
    initialDateTo
      ? new Date(`${initialDateTo}T00:00:00`)
      : getCurrentDayOfMonth(currentDate),
  );

  const { data: mySedes = [], isLoading: isLoadingMySedes } = useMySedes({
    company: EMPRESA_AP.id,
    has_workshop: true,
  });

  useEffect(() => {
    if (mySedes.length > 0 && !sedeId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSedeId(mySedes[0].id.toString());
    }
  }, [mySedes, sedeId]);

  const { data: workers = [], isLoading: isLoadingWorkers } = useAllWorkers(
    {
      cargo_id: POSITION_TYPE.OPERATORS,
      status_id: STATUS_WORKER.ACTIVE,
      sede$empresa_id: EMPRESA_AP.id,
      sede_id: sedeId || undefined,
    },
    !!sedeId,
  );

  // Si el técnico seleccionado no pertenece a la sede actual, se limpia
  useEffect(() => {
    if (
      workerId &&
      workers.length > 0 &&
      !workers.some((w) => w.id.toString() === workerId)
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWorkerId("");
    }
  }, [workers, workerId]);

  useEffect(() => {
    if (!workerId && workers.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWorkerId(workers[0].id.toString());
    }
  }, [workers, workerId]);

  const formatDateParam = (date: Date | undefined) =>
    date ? date.toLocaleDateString("en-CA") : undefined;

  const filters = useMemo(() => {
    if (!workerId || !dateFrom || !dateTo) return null;
    return {
      worker_id: Number(workerId),
      date_range: [formatDateParam(dateFrom)!, formatDateParam(dateTo)!] as [
        string,
        string,
      ],
      sede_id: sedeId ? Number(sedeId) : undefined,
    };
  }, [workerId, dateFrom, dateTo, sedeId]);

  const { data, isLoading, isError } = useTechnicianProductivity(filters);
  const detail = data?.data;

  const selectedSede = mySedes.find((s) => s.id.toString() === sedeId);

  return (
    <PageWrapper>
      <div className="flex items-center gap-2">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <TitleComponent
          title="Productividad del técnico"
          subtitle={
            detail
              ? `${detail.technician_info.worker_name} · ${selectedSede?.description ?? "-"}`
              : "Avance de órdenes de trabajo terminadas"
          }
          icon="Gauge"
        />
      </div>

      <TechnicianProductivityFiltersBar
        workers={workers}
        workerId={workerId}
        setWorkerId={setWorkerId}
        isLoadingWorkers={isLoadingWorkers}
        sedeName={selectedSede?.description}
        dateFrom={dateFrom}
        setDateFrom={setDateFrom}
        dateTo={dateTo}
        setDateTo={setDateTo}
      />

      {(isLoading || isLoadingMySedes) && <FormSkeleton />}

      {!isLoading && !isLoadingMySedes && !workerId && (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Selecciona un técnico para ver su productividad.
        </div>
      )}

      {!isLoading && workerId && (isError || !detail) && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <AlertCircle className="size-8 mx-auto text-red-500" />
            <p className="text-sm text-red-600">
              No se pudo cargar la productividad del técnico
            </p>
          </div>
        </div>
      )}

      {!isLoading && detail && (
        <div className="space-y-6">
          {!detail.validation.cuadra && (
            <div className="flex items-start gap-2 p-3 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 text-xs">
              <AlertTriangle className="size-4 shrink-0 mt-0.5" />
              <span>
                Las sumas del detalle no cuadran exactamente con el resumen.
                Verificar información.
              </span>
            </div>
          )}

          <TechnicianProductivitySummaryCards
            summary={detail.summary}
            period={detail.period}
          />

          <TechnicianProductivityCharts
            summary={detail.summary}
            workOrders={detail.work_orders}
          />

          <TechnicianProductivityWorkOrderCards
            workOrders={detail.work_orders}
            workOrdersWithoutLabour={detail.work_orders_without_labour}
          />
        </div>
      )}
    </PageWrapper>
  );
}
