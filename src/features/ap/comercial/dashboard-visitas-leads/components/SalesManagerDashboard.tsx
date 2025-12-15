"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Form } from "@/components/ui/form";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { getSalesManagerStats } from "../lib/dashboard.actions";
import { SalesManagerFilters } from "../lib/dashboard.interface";
import SalesManagerStatsCards from "./SalesManagerStatsCards";
import SalesManagerAdvisorTable from "./SalesManagerAdvisorTable";
import SalesManagerDetailsSheet from "./SalesManagerDetailsSheet";
import { DateRangePickerFormField } from "@/shared/components/DateRangePickerFormField";
import { FormSelect } from "@/shared/components/FormSelect";
import { useAllWorkers } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import {
  POSITION_TYPE,
  STATUS_WORKER,
} from "@/features/gp/gestionhumana/gestion-de-personal/posiciones/lib/position.constant";
import { EMPRESA_AP } from "@/core/core.constants";
import TitleComponent from "@/shared/components/TitleComponent";
import { MetricCard } from "@/shared/components/MetricCard";

// Obtener el primer y último día del mes pasado
const getLastMonthRange = () => {
  const lastMonth = subMonths(new Date(), 1);
  return {
    firstDay: startOfMonth(lastMonth),
    lastDay: endOfMonth(lastMonth),
  };
};

interface DashboardFormValues {
  date_from: string;
  date_to: string;
  type: "VISITA" | "LEADS";
  boss_id?: number | null;
}

export default function SalesManagerDashboard() {
  const lastMonthRange = getLastMonthRange();
  const [selectedAdvisorId, setSelectedAdvisorId] = useState<number | null>(
    null
  );
  const [showDetailsSheet, setShowDetailsSheet] = useState(false);

  const form = useForm<DashboardFormValues>({
    defaultValues: {
      date_from: format(lastMonthRange.firstDay, "yyyy-MM-dd"),
      date_to: format(lastMonthRange.lastDay, "yyyy-MM-dd"),
      type: "LEADS",
      boss_id: null,
    },
  });

  const { data: bosses = [] } = useAllWorkers({
    cargo_id: [...POSITION_TYPE.SALES_MANAGER, ...POSITION_TYPE.SALES_BOSS],
    status_id: STATUS_WORKER.ACTIVE,
    sede$empresa_id: EMPRESA_AP.id,
  });

  // Observar los valores del formulario
  const filters = form.watch();

  // Query para obtener las estadísticas
  const { data: statsData, isLoading } = useQuery({
    queryKey: [
      "salesManagerStats",
      filters.date_from,
      filters.date_to,
      filters.type,
      filters.boss_id,
    ],
    queryFn: async () => {
      const queryFilters: SalesManagerFilters = {
        date_from: filters.date_from,
        date_to: filters.date_to,
        type: filters.type,
        boss_id: filters.boss_id
          ? typeof filters.boss_id === "string"
            ? parseInt(filters.boss_id, 10)
            : filters.boss_id
          : undefined,
      };
      return await getSalesManagerStats(queryFilters);
    },
    enabled: !!(filters.date_from && filters.date_to && filters.type),
  });

  const handleAdvisorClick = (workerId: number) => {
    setSelectedAdvisorId(workerId);
    setShowDetailsSheet(true);
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
          <Form {...form}>
            <div className="flex items-end gap-3">
              <FormSelect
                options={bosses.map((boss) => ({
                  label: boss.name,
                  value: boss.id.toString(),
                }))}
                control={form.control}
                name="boss_id"
                placeholder="Jefe"
                popoverWidth="w-72"
                size="sm"
              />

              <DateRangePickerFormField
                size="sm"
                control={form.control}
                nameFrom="date_from"
                nameTo="date_to"
                placeholder="Selecciona rango"
                required
              />

              <FormSelect
                options={[
                  { label: "Visitas", value: "VISITA" },
                  { label: "Leads", value: "LEADS" },
                ]}
                control={form.control}
                name="type"
                placeholder="Tipo"
                popoverWidth="w-40"
                size="sm"
                required
              />
            </div>
          </Form>
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
                title={`Total ${form.getValues("type") === "VISITA" ? "Visitas" : "Leads"}`}
                value={statsData.data.team_totals.total_visits}
                subtitle="En el período seleccionado"
                variant="default"
              />

              <MetricCard
                title="Atendidos"
                value={statsData.data.team_totals.attended}
                subtitle={`${statsData.data.team_totals.attention_percentage.toFixed(1)}% del total`}
                variant="success"
              />

              <MetricCard
                title="No Atendidos"
                value={statsData.data.team_totals.not_attended}
                subtitle={`${((statsData.data.team_totals.not_attended / statsData.data.team_totals.total_visits) * 100).toFixed(1)}% del total`}
                variant="warning"
              />

              <MetricCard
                title="Descartados"
                value={statsData.data.team_totals.discarded}
                subtitle={`${((statsData.data.team_totals.discarded / statsData.data.team_totals.total_visits) * 100).toFixed(1)}% del total`}
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
      {showDetailsSheet && (
        <SalesManagerDetailsSheet
          open={showDetailsSheet}
          onOpenChange={setShowDetailsSheet}
          filters={{
            date_from: form.getValues("date_from"),
            date_to: form.getValues("date_to"),
            type: form.getValues("type"),
            worker_id: selectedAdvisorId,
          }}
        />
      )}
    </div>
  );
}
