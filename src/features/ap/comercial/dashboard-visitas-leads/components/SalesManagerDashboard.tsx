"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { getSalesManagerStats } from "../lib/dashboard.actions";
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
import TitleComponent from "@/shared/components/TitleComponent";
import { MetricCard } from "@/shared/components/MetricCard";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";

// Obtener el primer y último día del mes pasado
const getLastMonthRange = () => {
  const lastMonth = subMonths(new Date(), 1);
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
    lastMonthRange.firstDay
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(
    lastMonthRange.lastDay
  );
  const [type, setType] = useState<"VISITA" | "LEADS">("LEADS");
  const [bossId, setBossId] = useState<string>("");

  const [selectedAdvisorId, setSelectedAdvisorId] = useState<number | null>(
    null
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

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between border-b pb-4">
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
        <div className="flex items-end gap-3">
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
      </div>

      {/* Stats Overview */}
      {isLoading && !statsData ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="border-0 bg-muted/50">
                <CardContent className="pt-6">
                  <Skeleton className="h-3 w-24 mb-3" />
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      ) : (
        statsData && (
          <>
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <MetricCard
                title="Total Asesores"
                value={statsData.data.team_totals.total_advisors}
                subtitle="Miembros del equipo"
                variant="info"
              />

              <MetricCard
                title={`Total ${type === "VISITA" ? "Visitas" : "Leads"}`}
                value={statsData.data.team_totals.total_visits}
                subtitle="En el período seleccionado"
                variant="default"
              />

              <MetricCard
                title="Atendidos"
                value={statsData.data.team_totals.attended}
                subtitle={`${statsData.data.team_totals.attention_percentage.toFixed(
                  1
                )}% del total`}
                variant="success"
              />

              <MetricCard
                title="No Atendidos"
                value={statsData.data.team_totals.not_attended}
                subtitle={`${(
                  (statsData.data.team_totals.not_attended /
                    statsData.data.team_totals.total_visits) *
                  100
                ).toFixed(1)}% del total`}
                variant="warning"
              />

              <MetricCard
                title="Descartados"
                value={statsData.data.team_totals.discarded}
                subtitle={`${(
                  (statsData.data.team_totals.discarded /
                    statsData.data.team_totals.total_visits) *
                  100
                ).toFixed(1)}% del total`}
                variant="danger"
              />
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Advisors Table */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Rendimiento por Asesor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SalesManagerAdvisorTable
                      type={type}
                      advisors={statsData.data.by_advisor}
                      onAdvisorClick={handleAdvisorClick}
                    />
                  </CardContent>
                </Card>
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
    </div>
  );
}
