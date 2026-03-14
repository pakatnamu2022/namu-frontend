"use client";

import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Eye, FileText } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { findPayrollPeriodById } from "@/features/gp/gestionhumana/planillas/periodo-planilla/lib/payroll-period.actions";
import {
  PAYROLL_PERIOD,
  PAYROLL_PERIOD_STATUS_CONFIG,
} from "@/features/gp/gestionhumana/planillas/periodo-planilla/lib/payroll-period.constant";
import {
  usePayrollAttendances,
  usePayrollCalculationSummary,
  usePayrollReport,
} from "@/features/gp/gestionhumana/planillas/calculo-planilla/lib/payroll-calculation.hook";
import { SummaryWorkerItem } from "@/features/gp/gestionhumana/planillas/calculo-planilla/lib/payroll-calculation.interface";
import PayrollCalculationToolbar, {
  Quincena,
} from "@/features/gp/gestionhumana/planillas/calculo-planilla/components/PayrollCalculationToolbar";
import PayrollCalculationSummaryTable from "@/features/gp/gestionhumana/planillas/calculo-planilla/components/PayrollCalculationSummaryTable";
import PayrollCalculationDetailModal from "@/features/gp/gestionhumana/planillas/calculo-planilla/components/PayrollCalculationDetailModal";
import PayrollAttendanceTable from "@/features/gp/gestionhumana/planillas/calculo-planilla/components/PayrollAttendanceTable";
import PayrollReportTable from "@/features/gp/gestionhumana/planillas/calculo-planilla/components/PayrollReportTable";
import TitleComponent from "@/shared/components/TitleComponent";
import PageWrapper from "@/shared/components/PageWrapper";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";

function TableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full rounded-md" />
      ))}
    </div>
  );
}

function SummarySectionSkeleton() {
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
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("attendances");
  const [quincena, setQuincena] = useState<Quincena>(null);
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
  } = usePayrollAttendances(period ? period.id : null, quincena);

  const {
    data: summaryData,
    isLoading: isLoadingSummary,
    isError: isErrorSummary,
    refetch: refetchSummary,
  } = usePayrollCalculationSummary(period ? period.id : null, quincena);

  const {
    data: reportData,
    isLoading: isLoadingReport,
    isError: isErrorReport,
    refetch: refetchReport,
  } = usePayrollReport(period ? period.id : null, quincena);

  const hasBiweekly = Boolean(period?.biweekly_date);

  // Para periodos biweekly: si el summary ya cargó, sabemos si la quincena actual tiene datos
  const hasQuincenaCalculations = hasBiweekly
    ? isLoadingReport
      ? undefined
      : !isErrorReport && (reportData?.rows.length ?? 0) > 0
    : undefined;

  const handleTabChange = (tab: string) => {
    if (tab === activeTab) {
      if (tab === "totals") refetchSummary();
      if (tab === "report") refetchReport();
    }
    setActiveTab(tab);
  };

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: [PAYROLL_PERIOD.QUERY_KEY] });
    if (activeTab === "totals") refetchSummary();
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

  return (
    <PageWrapper>
      {/* Header */}
      <HeaderTableWrapper>
        <TitleComponent
          title={`Cálculo de Nómina - ${period.name}`}
          subtitle={`Período: ${period.code} | Estado: ${PAYROLL_PERIOD_STATUS_CONFIG[period.status]?.label ?? period.status} | ${format(
            new Date(period.start_date),
            "dd/MM/yyyy",
          )} → ${format(new Date(period.end_date), "dd/MM/yyyy")}`}
          icon="FileText"
          backRoute={PAYROLL_PERIOD.ABSOLUTE_ROUTE}
        >
          <PayrollCalculationToolbar
            periodId={period.id}
            periodStatus={period.status}
            biweeklyDate={period.biweekly_date}
            quincena={quincena}
            onQuincenaChange={setQuincena}
            onSuccess={handleSuccess}
            hasQuincenaCalculations={hasQuincenaCalculations}
          />
        </TitleComponent>
      </HeaderTableWrapper>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <div className="overflow-x-auto overflow-y-hidden scrollbar-hide -mx-6 px-6">
          <TabsList className="inline-flex w-auto min-w-full lg:w-full lg:grid lg:grid-cols-3 gap-1">
            <TabsTrigger
              value="attendances"
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <CalendarDays className="size-4 shrink-0" />
              <span>Asistencias</span>
            </TabsTrigger>
            <TabsTrigger
              value="totals"
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <Eye className="size-4 shrink-0" />
              <span>Detalles de Cálculo</span>
            </TabsTrigger>
            <TabsTrigger
              value="report"
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <FileText className="size-4 shrink-0" />
              <span>Resumen</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="mt-6">
          <TabsContent value="attendances" className="space-y-2">
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

            {attendancesData && (
              <PayrollAttendanceTable
                data={attendancesData}
                biweeklyDate={period.biweekly_date}
              />
            )}
          </TabsContent>

          <TabsContent value="totals" className="space-y-2">
            <h2 className="text-sm font-semibold text-foreground">
              Detalles de Cálculo
            </h2>
            {isLoadingSummary && <SummarySectionSkeleton />}
            {isErrorSummary && !isLoadingSummary && (
              <div className="py-6 text-center text-sm text-red-600 dark:text-red-400">
                No se pudo cargar el resumen. Verifica que el período tenga
                asistencias registradas.
              </div>
            )}
            {!isLoadingSummary && !isErrorSummary && (
              <PayrollCalculationSummaryTable
                summary={summaryData?.summary ?? []}
              />
            )}
          </TabsContent>

          <TabsContent value="report" className="space-y-2">
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
          </TabsContent>
        </div>
      </Tabs>

      {selectedWorker && (
        <PayrollCalculationDetailModal
          open={!!selectedWorker}
          onClose={() => setSelectedWorker(null)}
          worker={selectedWorker}
        />
      )}
    </PageWrapper>
  );
}
