"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { PayrollPeriodResource } from "../../periodo-planilla/lib/payroll-period.interface";
import { usePayrollCalculationSummary } from "../lib/payroll-calculation.hook";
import { SummaryWorkerItem } from "../lib/payroll-calculation.interface";
import PayrollCalculationToolbar, {
  ActiveView,
} from "./PayrollCalculationToolbar";
import PayrollCalculationSummaryTable from "./PayrollCalculationSummaryTable";
import PayrollCalculationDetailModal from "./PayrollCalculationDetailModal";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { PAYROLL_PERIOD } from "../../periodo-planilla/lib/payroll-period.constant";

interface Props {
  period: PayrollPeriodResource;
  open: boolean;
  onClose: () => void;
}

function SummarySkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full rounded-md" />
      ))}
    </div>
  );
}

export default function PayrollCalculationPanel({
  period,
  open,
  onClose,
}: Props) {
  const queryClient = useQueryClient();
  const [activeView, setActiveView] = useState<ActiveView>("attendances");
  const [selectedWorker, setSelectedWorker] =
    useState<SummaryWorkerItem | null>(null);

  const {
    data: summaryResponse,
    isLoading: isLoadingSummary,
    isError: isErrorSummary,
    refetch: refetchSummary,
  } = usePayrollCalculationSummary(activeView === "totals" ? period.id : null);

  const handleChangeView = (view: ActiveView) => {
    setActiveView(view);
    if (view === "totals") refetchSummary();
  };

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: [PAYROLL_PERIOD.QUERY_KEY] });
    setActiveView("totals");
    refetchSummary();
  };

  const summary = summaryResponse?.summary ?? [];
  const periodInfo = summaryResponse?.period;

  return (
    <>
      <GeneralModal
        open={open}
        onClose={onClose}
        title={`Cálculo de Nómina — ${period.name}`}
        subtitle={`Período: ${period.code} | Estado: ${period.status}`}
        size="5xl"
        icon="Calculator"
      >
        <div className="space-y-5">
          {/* Toolbar con acciones */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
            <div className="text-sm text-muted-foreground">
              {periodInfo
                ? `${periodInfo.start_date} → ${periodInfo.end_date}`
                : `${period.start_date} → ${period.end_date}`}
            </div>
            <PayrollCalculationToolbar
              periodId={period.id}
              periodStatus={period.status}
              activeView={activeView}
              onChangeView={handleChangeView}
              onSuccess={handleSuccess}
            />
          </div>

          {/* Contenido del resumen */}
          {activeView !== "totals" && (
            <div className="py-8 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
              <AlertCircle className="size-8 text-muted-foreground/50" />
              <p>
                Haz clic en <strong>Ver Totales</strong> para previsualizar los
                cálculos,
              </p>
              <p>
                o en <strong>Generar Cálculos</strong> para guardarlos en base
                de datos.
              </p>
            </div>
          )}

          {activeView === "totals" && isLoadingSummary && <SummarySkeleton />}

          {activeView === "totals" && isErrorSummary && (
            <div className="py-6 text-center text-sm text-red-600 dark:text-red-400">
              No se pudo cargar el resumen. Verifica que el período tenga
              asistencias registradas.
            </div>
          )}

          {activeView === "totals" && !isLoadingSummary && !isErrorSummary && (
            <>
              {summary.length > 0 && (
                <div className="text-xs text-muted-foreground mb-1">
                  {summaryResponse?.workers_count ?? summary.length}{" "}
                  trabajador(es) con asistencias.{" "}
                  <span className="italic">
                    Haz clic en la flecha para ver el desglose por trabajador.
                  </span>
                </div>
              )}
              <PayrollCalculationSummaryTable summary={summary} />
            </>
          )}
        </div>
      </GeneralModal>

      {selectedWorker && (
        <PayrollCalculationDetailModal
          open={!!selectedWorker}
          onClose={() => setSelectedWorker(null)}
          worker={selectedWorker}
        />
      )}
    </>
  );
}
