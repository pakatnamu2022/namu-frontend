"use client";

import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { errorToast } from "@/core/core.function";
import TitleComponent from "@/shared/components/TitleComponent";
import PageWrapper from "@/shared/components/PageWrapper";
import AdoptionFilters from "@/features/gp/gestion-del-sistema/adoption-dashboard/components/AdoptionFilters";
import AdoptionSummaryCards from "@/features/gp/gestion-del-sistema/adoption-dashboard/components/AdoptionSummaryCards";
import AdoptionTrend from "@/features/gp/gestion-del-sistema/adoption-dashboard/components/AdoptionTrend";
import AdoptionUsersRanking from "@/features/gp/gestion-del-sistema/adoption-dashboard/components/AdoptionUsersRanking";
import AdoptionSedesRanking from "@/features/gp/gestion-del-sistema/adoption-dashboard/components/AdoptionSedesRanking";
import AdoptionModulesHeatmap from "@/features/gp/gestion-del-sistema/adoption-dashboard/components/AdoptionModulesHeatmap";
import AdoptionCompliance from "@/features/gp/gestion-del-sistema/adoption-dashboard/components/AdoptionCompliance";
import AdoptionChampions from "@/features/gp/gestion-del-sistema/adoption-dashboard/components/AdoptionChampions";
import AdoptionAlerts from "@/features/gp/gestion-del-sistema/adoption-dashboard/components/AdoptionAlerts";
import {
  getAdoptionAll,
  refreshAdoptionDashboard,
} from "@/features/gp/gestion-del-sistema/adoption-dashboard/lib/adoption.actions";
import type {
  AdoptionSummary,
  AdoptionUser,
  AdoptionSede,
  AdoptionModule,
  AdoptionCompliance as AdoptionComplianceType,
  AdoptionChampions as AdoptionChampionsType,
  AdoptionAlert,
  AdoptionTrendPoint,
} from "@/features/gp/gestion-del-sistema/adoption-dashboard/lib/adoption.interface";

const EMPTY_SUMMARY: AdoptionSummary = {
  active_users: 0,
  expected_users: 0,
  total_ops: 0,
  top_sede: null,
  global_adoption_index: 0,
  trend_vs_previous_period: null,
  trend_7_days: { ops: 0, active_users: 0, days: 7 },
  trend_30_days: { ops: 0, active_users: 0, days: 30 },
};

const EMPTY_COMPLIANCE: AdoptionComplianceType = {
  active_compliance: [],
  inactive_users: [],
  summary: { green: 0, yellow: 0, red: 0 },
};

const EMPTY_CHAMPIONS: AdoptionChampionsType = {
  champions: [],
  at_risk: [],
  champion_count: 0,
  at_risk_count: 0,
};

const POLL_INTERVAL_MS = 5_000;

export default function AdoptionDashboardPage() {
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const [summary, setSummary] = useState<AdoptionSummary>(EMPTY_SUMMARY);
  const [users, setUsers] = useState<AdoptionUser[]>([]);
  const [sedes, setSedes] = useState<AdoptionSede[]>([]);
  const [modules, setModules] = useState<AdoptionModule[]>([]);
  const [compliance, setCompliance] = useState<AdoptionComplianceType>(EMPTY_COMPLIANCE);
  const [champions, setChampions] = useState<AdoptionChampionsType>(EMPTY_CHAMPIONS);
  const [alerts, setAlerts] = useState<AdoptionAlert[]>([]);
  const [trend, setTrend] = useState<AdoptionTrendPoint[]>([]);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    setDateFrom(firstDay);
    setDateTo(today);
  }, []);

  useEffect(() => {
    if (dateFrom && dateTo) fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFrom, dateTo]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  function buildFilters() {
    return {
      date_from: format(dateFrom!, "yyyy-MM-dd"),
      date_to: format(dateTo!, "yyyy-MM-dd"),
    };
  }

  function applyData(d: Awaited<ReturnType<typeof getAdoptionAll>>) {
    setSummary(d.summary);
    setUsers(d.users);
    setSedes(d.sedes);
    setModules(d.modules);
    setCompliance(d.compliance);
    setChampions(d.champions);
    setAlerts(d.alerts);
    setTrend(d.trend);
    setLastUpdated(d.last_updated);
  }

  async function fetchAll() {
    if (!dateFrom || !dateTo) return;
    setIsLoading(true);
    try {
      const all = await getAdoptionAll(buildFilters());
      applyData(all);
    } catch {
      errorToast("Error", "No se pudo cargar el dashboard de adopción");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleForceRefresh() {
    if (!dateFrom || !dateTo || isRefreshing) return;
    const filters = buildFilters();
    const prevLastUpdated = lastUpdated;
    setIsRefreshing(true);
    try {
      await refreshAdoptionDashboard(filters);
    } catch {
      errorToast("Error", "No se pudo encolar la actualización del dashboard");
      setIsRefreshing(false);
      return;
    }

    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const all = await getAdoptionAll(filters);
        if (all.last_updated && all.last_updated !== prevLastUpdated) {
          applyData(all);
          setIsRefreshing(false);
          clearInterval(pollRef.current!);
          pollRef.current = null;
        }
      } catch {
        // silently retry
      }
    }, POLL_INTERVAL_MS);
  }

  return (
    <PageWrapper>
      {/* Header */}
      <TitleComponent
        title="Dashboard de Adopción ERP"
        subtitle="Marcha blanca — Analítica de adopción operativa y gestión del cambio"
        icon="BarChart3"
      >
        <AdoptionFilters
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateChange={(from, to) => {
            setDateFrom(from);
            setDateTo(to);
          }}
          onRefresh={fetchAll}
          onForceRefresh={handleForceRefresh}
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          lastUpdated={lastUpdated}
        />
      </TitleComponent>

      {/* 1 — Resumen Ejecutivo */}
      <AdoptionSummaryCards data={summary} />

      {/* 2 — Tendencia diaria */}
      <AdoptionTrend data={trend} />

      {/* 3 — Rankings: Usuarios + Sedes */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <AdoptionUsersRanking data={users} />
        <AdoptionSedesRanking data={sedes} />
      </div>

      {/* 4 — Uso por módulos */}
      <AdoptionModulesHeatmap data={modules} />

      {/* 5 — Cumplimiento */}
      <AdoptionCompliance data={compliance} />

      {/* 6 — Campeones & Riesgo */}
      <AdoptionChampions data={champions} />

      {/* 7 — Alertas */}
      <AdoptionAlerts data={alerts} />
    </PageWrapper>
  );
}
