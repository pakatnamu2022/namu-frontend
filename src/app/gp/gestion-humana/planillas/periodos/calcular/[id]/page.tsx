"use client";

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { findPayrollPeriodById } from "@/features/gp/gestionhumana/planillas/periodo-planilla/lib/payroll-period.actions";
import { PAYROLL_PERIOD } from "@/features/gp/gestionhumana/planillas/periodo-planilla/lib/payroll-period.constant";
import {
  usePayrollAttendances,
  usePayrollCalculationSummary,
  usePayrollReport,
} from "@/features/gp/gestionhumana/planillas/calculo-planilla/lib/payroll-calculation.hook";
import { SummaryWorkerItem } from "@/features/gp/gestionhumana/planillas/calculo-planilla/lib/payroll-calculation.interface";
import PayrollCalculationToolbar, {
  ActiveView,
} from "@/features/gp/gestionhumana/planillas/calculo-planilla/components/PayrollCalculationToolbar";
import PayrollCalculationSummaryTable from "@/features/gp/gestionhumana/planillas/calculo-planilla/components/PayrollCalculationSummaryTable";
import PayrollCalculationDetailModal from "@/features/gp/gestionhumana/planillas/calculo-planilla/components/PayrollCalculationDetailModal";
import PayrollAttendanceTable from "@/features/gp/gestionhumana/planillas/calculo-planilla/components/PayrollAttendanceTable";
import PayrollReportTable from "@/features/gp/gestionhumana/planillas/calculo-planilla/components/PayrollReportTable";

function TableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full rounded-md" />
      ))}
    </div>
  );
}

export default function PayrollCalculationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeView, setActiveView] = useState<ActiveView>("attendances");
  const [selectedWorker, setSelectedWorker] =
    useState<SummaryWorkerItem | null>(null);

  const { data: period, isLoading: isLoadingPeriod } = useQuery({
    queryKey: [PAYROLL_PERIOD.QUERY_KEY, id],
    queryFn: () => findPayrollPeriodById(id as string),
    refetchOnWindowFocus: false,
  });

  const {
    data: attendancesData,
    isLoading: isLoadingAttendances,
    isError: isErrorAttendances,
  } = usePayrollAttendances(period ? period.id : null);

  const {
    data: summaryResponse,
    isLoading: isLoadingSummary,
    isError: isErrorSummary,
    refetch: refetchSummary,
  } = usePayrollCalculationSummary(
    activeView === "totals" && period ? period.id : null,
  );

  const {
    data: reportData,
    isLoading: isLoadingReport,
    isError: isErrorReport,
    refetch: refetchReport,
  } = usePayrollReport(activeView === "report" && period ? period.id : null);

  const handleChangeView = (view: ActiveView) => {
    if (view === activeView) {
      if (view === "totals") refetchSummary();
      if (view === "report") refetchReport();
    }
    setActiveView(view);
  };

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: [PAYROLL_PERIOD.QUERY_KEY] });
    if (activeView === "totals") refetchSummary();
  };

  if (isLoadingPeriod || !period) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-6 w-40" />
        <TableSkeleton />
      </div>
    );
  }

  const summary = summaryResponse?.summary ?? [];

  return (
    <div className="space-y-5 p-6">
      {/* Header + Toolbar */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => navigate(PAYROLL_PERIOD.ABSOLUTE_ROUTE)}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">
              Cálculo de Nómina — {period.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              Período: {period.code} | Estado: {period.status} |{" "}
              {period.start_date} → {period.end_date}
            </p>
          </div>
        </div>

        <PayrollCalculationToolbar
          periodId={period.id}
          periodStatus={period.status}
          activeView={activeView}
          onChangeView={handleChangeView}
          onSuccess={handleSuccess}
        />
      </div>

      {/* Vista: Asistencias */}
      {activeView === "attendances" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">
              Asistencias del Período
            </h2>
            {attendancesData && (
              <span className="text-xs text-muted-foreground">
                {attendancesData.total_workers} trabajador(es)
              </span>
            )}
          </div>

          {isLoadingAttendances && <TableSkeleton />}

          {isErrorAttendances && !isLoadingAttendances && (
            <div className="py-6 text-center text-sm text-red-600 dark:text-red-400">
              No se pudieron cargar las asistencias del período.
            </div>
          )}

          {attendancesData && <PayrollAttendanceTable data={attendancesData} />}
        </div>
      )}

      {/* Vista: Ver Totales */}
      {activeView === "totals" && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">
            Resumen de Cálculos
          </h2>

          {isLoadingSummary && <TableSkeleton />}

          {isErrorSummary && !isLoadingSummary && (
            <div className="py-6 text-center text-sm text-red-600 dark:text-red-400">
              No se pudo cargar el resumen. Verifica que el período tenga
              asistencias registradas.
            </div>
          )}

          {!isLoadingSummary && !isErrorSummary && (
            <PayrollCalculationSummaryTable summary={summary} />
          )}
        </div>
      )}

      {/* Vista: Resumen de Nómina */}
      {activeView === "report" && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">
            Resumen de Nómina — {period.name}
          </h2>

          {isLoadingReport && <TableSkeleton />}

          {isErrorReport && !isLoadingReport && (
            <div className="py-6 text-center text-sm text-red-600 dark:text-red-400">
              No se pudo cargar el reporte. Verifica que el período tenga
              cálculos generados.
            </div>
          )}

          {reportData && !isLoadingReport && !isErrorReport && (
            <PayrollReportTable data={reportData} />
          )}
        </div>
      )}

      {selectedWorker && (
        <PayrollCalculationDetailModal
          open={!!selectedWorker}
          onClose={() => setSelectedWorker(null)}
          worker={selectedWorker}
        />
      )}
    </div>
  );
}
