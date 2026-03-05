"use client";

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { findPayrollPeriodById } from "@/features/gp/gestionhumana/planillas/periodo-planilla/lib/payroll-period.actions";
import { PAYROLL_PERIOD } from "@/features/gp/gestionhumana/planillas/periodo-planilla/lib/payroll-period.constant";
import { usePayrollCalculationSummary } from "@/features/gp/gestionhumana/planillas/calculo-planilla/lib/payroll-calculation.hook";
import { SummaryWorkerItem } from "@/features/gp/gestionhumana/planillas/calculo-planilla/lib/payroll-calculation.interface";
import PayrollCalculationToolbar from "@/features/gp/gestionhumana/planillas/calculo-planilla/components/PayrollCalculationToolbar";
import PayrollCalculationSummaryTable from "@/features/gp/gestionhumana/planillas/calculo-planilla/components/PayrollCalculationSummaryTable";
import PayrollCalculationDetailModal from "@/features/gp/gestionhumana/planillas/calculo-planilla/components/PayrollCalculationDetailModal";

function SummarySkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full rounded-md" />
      ))}
    </div>
  );
}

export default function PayrollCalculationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [previewEnabled, setPreviewEnabled] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<SummaryWorkerItem | null>(null);

  const { data: period, isLoading: isLoadingPeriod } = useQuery({
    queryKey: [PAYROLL_PERIOD.QUERY_KEY, id],
    queryFn: () => findPayrollPeriodById(id as string),
    refetchOnWindowFocus: false,
  });

  const {
    data: summaryResponse,
    isLoading: isLoadingSummary,
    isError: isErrorSummary,
    refetch: refetchSummary,
  } = usePayrollCalculationSummary(previewEnabled && period ? period.id : null);

  const handlePreview = () => {
    setPreviewEnabled(true);
    if (previewEnabled) {
      refetchSummary();
    }
  };

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: [PAYROLL_PERIOD.QUERY_KEY] });
    if (previewEnabled) {
      refetchSummary();
    }
  };

  if (isLoadingPeriod || !period) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-6 w-40" />
        <SummarySkeleton />
      </div>
    );
  }

  const summary = summaryResponse?.summary ?? [];
  const periodInfo = summaryResponse?.period;

  return (
    <div className="space-y-5 p-6">
      {/* Header */}
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
            Período: {period.code} | Estado: {period.status}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <div className="text-sm text-muted-foreground">
          {periodInfo
            ? `${periodInfo.start_date} → ${periodInfo.end_date}`
            : `${period.start_date} → ${period.end_date}`}
        </div>
        <PayrollCalculationToolbar
          periodId={period.id}
          periodStatus={period.status}
          onPreview={handlePreview}
          onSuccess={handleSuccess}
        />
      </div>

      {/* Contenido */}
      {!previewEnabled && (
        <div className="py-8 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
          <AlertCircle className="size-8 text-muted-foreground/50" />
          <p>
            Haz clic en <strong>Ver Resumen</strong> para previsualizar los
            cálculos,
          </p>
          <p>
            o en <strong>Generar Cálculos</strong> para guardarlos en base de
            datos.
          </p>
        </div>
      )}

      {previewEnabled && isLoadingSummary && <SummarySkeleton />}

      {previewEnabled && isErrorSummary && (
        <div className="py-6 text-center text-sm text-red-600 dark:text-red-400">
          No se pudo cargar el resumen. Verifica que el período tenga asistencias
          registradas.
        </div>
      )}

      {previewEnabled && !isLoadingSummary && !isErrorSummary && (
        <>
          {summary.length > 0 && (
            <div className="text-xs text-muted-foreground mb-1">
              {summaryResponse?.workers_count ?? summary.length} trabajador(es)
              con asistencias.{" "}
              <span className="italic">
                Haz clic en la flecha para ver el desglose por trabajador.
              </span>
            </div>
          )}
          <PayrollCalculationSummaryTable summary={summary} />
        </>
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
