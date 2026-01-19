"use client";

import { useState } from "react";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import {
  getSalesManagerStats,
  downloadSalesManagerFile,
} from "../lib/dashboard.actions";
import { SalesManagerFilters } from "../lib/dashboard.interface";
import SalesManagerStatsCards from "./SalesManagerStatsCards";
import SalesManagerAdvisorTable from "./SalesManagerAdvisorTable";
import SalesManagerDetailsSheet from "./SalesManagerDetailsSheet";
import { DateRangePickerFilter } from "@/shared/components/DateRangePickerFilter";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { useAllWorkers } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import {
  POSITION_TYPE,
  STATUS_WORKER,
} from "@/features/gp/gestionhumana/gestion-de-personal/posiciones/lib/position.constant";
import { EMPRESA_AP } from "@/core/core.constants";
import { errorToast, successToast } from "@/core/core.function";
import TitleComponent from "@/shared/components/TitleComponent";
import ExportButtons from "@/shared/components/ExportButtons";
import { MetricCard } from "@/shared/components/MetricCard";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import PageWrapper from "@/shared/components/PageWrapper";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { UserCheck, UserCircle, UserMinus, Users, UserX } from "lucide-react";

// Obtener el primer y último día del mes pasado
const getLastMonthRange = () => {
  const lastMonth = subMonths(new Date(), 0);
  return {
    firstDay: startOfMonth(lastMonth),
    lastDay: endOfMonth(lastMonth),
  };
};

export default function SalesManagerDashboard() {
  const ROUTE = "dashboard-equipo-leads";
  const { canViewAdvisors } = useModulePermissions(ROUTE);

  const lastMonthRange = getLastMonthRange();

  // Estados para los filtros
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    lastMonthRange.firstDay,
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(
    lastMonthRange.lastDay,
  );
  const [type, setType] = useState<"VISITA" | "LEADS">("LEADS");
  const [bossId, setBossId] = useState<string>("");

  const [selectedAdvisorId, setSelectedAdvisorId] = useState<number | null>(
    null,
  );
  const [showDetailsSheet, setShowDetailsSheet] = useState(false);

  const { data: bosses = [] } = useAllWorkers({
    cargo_id: [...POSITION_TYPE.SALES_MANAGER, ...POSITION_TYPE.SALES_BOSS],
    status_id: STATUS_WORKER.ACTIVE,
    sede$empresa_id: EMPRESA_AP.id,
  });

  // Query para obtener las estadísticas
  const { data: statsData, isLoading } = useQuery({
    queryKey: [
      "salesManagerStats",
      dateFrom?.toISOString().split("T")[0],
      dateTo?.toISOString().split("T")[0],
      type,
      bossId,
    ],
    queryFn: async () => {
      if (!dateFrom || !dateTo) return null;

      const queryFilters: SalesManagerFilters = {
        date_from: dateFrom.toISOString().split("T")[0],
        date_to: dateTo.toISOString().split("T")[0],
        type,
        boss_id: bossId ? parseInt(bossId, 10) : undefined,
      };
      return await getSalesManagerStats(queryFilters);
    },
    enabled: !!(dateFrom && dateTo && type),
  });

  const handleAdvisorClick = (workerId: number) => {
    setSelectedAdvisorId(workerId);
    setShowDetailsSheet(true);
  };

  const handleDateChange = (from: Date | undefined, to: Date | undefined) => {
    setDateFrom(from);
    setDateTo(to);
  };

  const formatDate = (date: Date | undefined) => {
    return date ? date.toISOString().split("T")[0] : "";
  };

  const currentBossId = statsData?.data.manager_info.boss_id;

  const handleExcelDownload = async () => {
    if (!dateFrom || !dateTo) {
      errorToast("Por favor seleccione un rango de fechas");
      return;
    }
    if (!currentBossId) {
      errorToast("No se ha identificado el jefe del equipo");
      return;
    }

    try {
      await downloadSalesManagerFile({
        date_from: formatDate(dateFrom),
        date_to: formatDate(dateTo),
        type,
        boss_id: currentBossId,
      });
      successToast("Archivo Excel descargado exitosamente");
    } catch (error: any) {
      errorToast(
        "Error al descargar el Excel. Por favor, intente nuevamente.",
        error.response?.data?.message?.toString(),
      );
    }
  };

  const handlePDFDownload = async () => {
    if (!dateFrom || !dateTo) {
      errorToast("Por favor seleccione un rango de fechas");
      return;
    }
    if (!currentBossId) {
      errorToast("No se ha identificado el jefe del equipo");
      return;
    }

    try {
      await downloadSalesManagerFile({
        date_from: formatDate(dateFrom),
        date_to: formatDate(dateTo),
        type,
        boss_id: currentBossId,
        format: "pdf",
      });
      successToast("Archivo PDF descargado exitosamente");
    } catch (error: any) {
      errorToast(
        "Error al descargar el PDF. Por favor, intente nuevamente.",
        error.response?.data?.message?.toString(),
      );
    }
  };

  return (
    <PageWrapper>
      {/* Header */}
      <TitleComponent
        icon={"FileSignature"}
        title="Dashboard de Leads de Equipo de Ventas"
        subtitle={
          statsData
            ? `Resumen gerencial de ${statsData.data.manager_info.boss_name}`
            : "Resumen gerencial"
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-1 w-full justify-start">
        <ExportButtons
          onExcelDownload={handleExcelDownload}
          onPdfDownload={handlePDFDownload}
          disableExcel={!dateFrom || !dateTo || !currentBossId}
          disablePdf={!dateFrom || !dateTo || !currentBossId}
          variant="grouped"
        />

        {canViewAdvisors && (
          <SearchableSelect
            options={bosses.map((boss) => ({
              label: boss.name,
              value: boss.id.toString(),
            }))}
            value={bossId}
            onChange={setBossId}
            placeholder="Jefe"
            buttonSize="sm"
            classNameDiv="min-w-[200px]"
          />
        )}

        <DateRangePickerFilter
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateChange={handleDateChange}
          placeholder="Selecciona rango"
          className="w-[280px]"
        />

        <SearchableSelect
          options={[
            { label: "Visitas", value: "VISITA" },
            { label: "Leads", value: "LEADS" },
          ]}
          value={type}
          onChange={(value) => setType(value as "VISITA" | "LEADS")}
          placeholder="Tipo"
          buttonSize="sm"
          classNameDiv="min-w-[120px]"
        />
      </div>

      {/* Stats Overview */}
      {isLoading && !statsData ? (
        <FormSkeleton />
      ) : (
        statsData && (
          <>
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <MetricCard
                title="Total Asesores"
                value={statsData.data.team_totals.total_advisors}
                subtitle="Miembros del equipo"
                variant="outline"
                color="gray"
                icon={Users}
              />

              <MetricCard
                title={`Total ${type === "VISITA" ? "Visitas" : "Leads"}`}
                value={statsData.data.team_totals.total_visits}
                subtitle="En el período seleccionado"
                variant="outline"
                icon={UserCircle}
              />

              <MetricCard
                title="Atendidos"
                value={statsData.data.team_totals.attended || 0}
                subtitle={`${statsData.data.team_totals.attention_percentage.toFixed(
                  1,
                )}% del total`}
                variant="outline"
                color="green"
                showProgress
                progressValue={statsData.data.team_totals.attended || 0}
                progressMax={statsData.data.team_totals.total_visits || 0}
                icon={UserCheck}
              />

              <MetricCard
                title="No Atendidos"
                value={statsData.data.team_totals.not_attended || 0}
                subtitle={`${(
                  ((statsData.data.team_totals.not_attended || 0) /
                    (statsData.data.team_totals.total_visits || 1)) *
                  100
                ).toFixed(1)}% del total`}
                variant="outline"
                color="yellow"
                showProgress
                progressValue={statsData.data.team_totals.not_attended || 0}
                progressMax={statsData.data.team_totals.total_visits || 0}
                icon={UserMinus}
              />

              <MetricCard
                title="Descartados"
                value={statsData.data.team_totals.discarded || 0}
                subtitle={`${(
                  ((statsData.data.team_totals.discarded || 0) /
                    (statsData.data.team_totals.total_visits || 1)) *
                  100
                ).toFixed(1)}% del total`}
                variant="outline"
                color="red"
                showProgress
                progressValue={statsData.data.team_totals.discarded || 0}
                progressMax={statsData.data.team_totals.total_visits || 0}
                icon={UserX}
              />
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 gap-6">
              {/* Advisors Table */}
              <div className="lg:col-span-2">
                <SalesManagerAdvisorTable
                  type={type}
                  advisors={statsData.data.by_advisor}
                  onAdvisorClick={handleAdvisorClick}
                />
              </div>
              
              {/* Charts */}
              <div className="space-y-6">
                <SalesManagerStatsCards
                  teamTotals={statsData.data.team_totals}
                />
              </div>
            </div>
          </>
        )
      )}

      {/* Details Sheet */}
      {showDetailsSheet && dateFrom && dateTo && (
        <SalesManagerDetailsSheet
          open={showDetailsSheet}
          onOpenChange={setShowDetailsSheet}
          filters={{
            date_from: dateFrom.toISOString().split("T")[0],
            date_to: dateTo.toISOString().split("T")[0],
            type: type,
            worker_id: selectedAdvisorId,
          }}
        />
      )}
    </PageWrapper>
  );
}
