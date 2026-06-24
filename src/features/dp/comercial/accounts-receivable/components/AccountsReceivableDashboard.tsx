import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  RefreshCw,
  Clock,
  FileText,
  Banknote,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  BarChart2,
  Send,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import { InteractivePieChart } from "@/shared/charts/InteractivePieChart";
import { ChartBarLabelCustom } from "@/shared/charts/ChartBarLabelCustom";
import { ChartBarMixed } from "@/shared/charts/ChartBarMixed";
import { ChartAreaDefault } from "@/shared/charts/ChartAreaDefault";
import { Link } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

import { MetricCard } from "@/shared/components/MetricCard";
import TitleComponent from "@/shared/components/TitleComponent";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { successToast, errorToast } from "@/core/core.function";

import { useAccountsReceivableDashboard } from "../lib/accountsReceivable.hook";
import { syncAccountsReceivable, sendDueReports } from "../lib/accountsReceivable.actions";
import { ACCOUNTS_RECEIVABLE } from "../lib/accountsReceivable.constants";
import type { DashboardChart, DashboardFilters, AccountsReceivableFilters } from "../lib/accountsReceivable.interface";
import AccountsReceivableTreeFilter from "./AccountsReceivableTreeFilter";

const COMPANY_STORAGE_KEY = "ar-dashboard-company";
const PIE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
];
const AGING_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const formatPEN = (value: number): string =>
  `S/ ${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)}`;

const formatAxisShort = (value: number): string => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(value);
};

function formatSyncedAt(raw: string): string {
  try {
    return format(parseISO(raw.replace(" ", "T")), "dd/MM/yyyy HH:mm", {
      locale: es,
    });
  } catch {
    return raw;
  }
}

function getStoredCompany(): string {
  try {
    return (
      localStorage.getItem(COMPANY_STORAGE_KEY) ?? ACCOUNTS_RECEIVABLE.COMPANY
    );
  } catch {
    return ACCOUNTS_RECEIVABLE.COMPANY;
  }
}

// ── Custom tooltip ────────────────────────────────────────────────────────────
function CurrencyTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background p-2.5 shadow-lg text-xs space-y-1 min-w-40">
      {label && (
        <p className="font-semibold text-foreground border-b pb-1 mb-1">
          {label}
        </p>
      )}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span
              className="size-2 rounded-full shrink-0"
              style={{ background: p.color ?? p.fill }}
            />
            <span className="text-muted-foreground">{p.name}</span>
          </div>
          <span className="font-bold tabular-nums">{formatPEN(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ── Skeletons ─────────────────────────────────────────────────────────────────

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-44" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-64 w-full" />
      </CardContent>
    </Card>
  );
}

// ── Status Donut ──────────────────────────────────────────────────────────────
function StatusDonut({ chart }: { chart: DashboardChart }) {
  const data = chart.labels.map((label, i) => ({
    name: label,
    value: chart.datasets[0]?.data[i] ?? 0,
    fill: PIE_COLORS[i % PIE_COLORS.length],
  }));

  const config: ChartConfig = Object.fromEntries(
    data.map((item) => [item.name, { label: item.name, color: item.fill }]),
  );

  return (
    <InteractivePieChart
      id={chart.id}
      title={chart.title}
      data={data}
      config={config}
      showCenterLabel
      centerLabelAsPercent
      showSelectionFooter
      valueFormatter={formatPEN}
    />
  );
}

// ── Aging Bar Chart ───────────────────────────────────────────────────────────
function AgingBar({ chart }: { chart: DashboardChart }) {
  const data = chart.labels.map((label, i) => ({
    name: label,
    value: chart.datasets[0]?.data[i] ?? 0,
    color: AGING_COLORS[i] ?? AGING_COLORS[AGING_COLORS.length - 1],
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{chart.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={data}
            margin={{ left: 0, right: 16, top: 4, bottom: 0 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tickFormatter={formatAxisShort}
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={58}
            />
            <Tooltip
              content={<CurrencyTooltip />}
              cursor={{ fill: "var(--muted)" }}
            />
            <Bar dataKey="value" name="Saldo (S/)" radius={[4, 4, 0, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-3 justify-center mt-3">
          {data.map((entry, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <span
                className="inline-block size-2.5 rounded-sm shrink-0"
                style={{ background: entry.color }}
              />
              {entry.name}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AccountsReceivableDashboard() {
  const [company] = useState<string>(getStoredCompany);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [dashFilters, setDashFilters] = useState<DashboardFilters>({});
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } =
    useAccountsReceivableDashboard(company, dashFilters);

  const handleFiltersChange = (partial: Partial<AccountsReceivableFilters>) =>
    setDashFilters((prev) => ({
      sede_id: partial.sede_id !== undefined ? partial.sede_id : prev.sede_id,
      overdue_status: partial.overdue_status !== undefined ? partial.overdue_status : prev.overdue_status,
      due_year: partial.due_year !== undefined ? partial.due_year : prev.due_year,
    }));

  const handleReset = () => setDashFilters({});

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncAccountsReceivable();
      await queryClient.invalidateQueries({
        queryKey: [ACCOUNTS_RECEIVABLE.QUERY_KEY, "dashboard"],
      });
      successToast(
        "Sincronización completa.",
        "Los datos del dashboard se han actualizado.",
      );
    } catch {
      errorToast("No se pudo sincronizar los datos.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSendReports = async () => {
    setIsSending(true);
    try {
      const res = await sendDueReports(company);
      successToast("Reportes enviados.", res.message);
    } catch {
      errorToast("No se pudo enviar los reportes.");
    } finally {
      setIsSending(false);
    }
  };

  const summary = data?.summary;
  const syncedAt = data?.synced_at;
  const charts = data?.charts ?? [];

  const isEmpty =
    !isLoading &&
    !isError &&
    data != null &&
    charts.every((c) => (c.datasets[0]?.data ?? []).length === 0);

  const getChart = (id: string) => charts.find((c) => c.id === id);

  const overduePercent =
    summary && summary.total_balance_pen > 0
      ? `${((summary.overdue_balance_pen / summary.total_balance_pen) * 100).toFixed(1)}% del saldo total`
      : undefined;

  const currentPercent =
    summary && summary.total_balance_pen > 0
      ? `${((summary.current_balance_pen / summary.total_balance_pen) * 100).toFixed(1)}% del saldo total`
      : undefined;

  return (
    <div className="relative space-y-6">
      {/* Sync overlay */}
      {isSyncing && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-xl bg-background/80 backdrop-blur-sm min-h-40">
          <RefreshCw className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-medium">
            Sincronizando datos…
          </p>
        </div>
      )}

      {/* Header */}
      <HeaderTableWrapper>
        <TitleComponent
          title="Dashboard — Cuentas por Cobrar"
          subtitle="Depósito Pakatnamu"
          icon="BarChart2"
        >
          {syncedAt && !isLoading && (
            <span className="hidden md:flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3" />
              Última sync: {formatSyncedAt(syncedAt)}
            </span>
          )}
        </TitleComponent>

        <div className="flex items-center gap-2">
          <Link to="/dp/comercial/cuentas-por-cobrar">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground"
            >
              <FileText className="size-4" />
              <span className="hidden sm:inline">Ver tabla</span>
            </Button>
          </Link>



          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={handleSendReports}
            disabled={isSending || isLoading}
          >
            <Send className={`size-4 ${isSending ? "animate-pulse" : ""}`} />
            <span className="hidden sm:inline">Enviar reportes</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={handleSync}
            disabled={isSyncing || isLoading}
          >
            <RefreshCw
              className={`size-4 ${isSyncing ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Sincronizar</span>
          </Button>
        </div>
      </HeaderTableWrapper>

      {/* Filters */}
      <AccountsReceivableTreeFilter
        filters={dashFilters}
        onFiltersChange={handleFiltersChange}
        onReset={handleReset}
      />

      {/* KPI Cards — always visible (skeleton when loading, real data when ready) */}
      {!isError && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <MetricCard
            title="Total Documentos"
            value={summary?.total_documents.toLocaleString("en-US")}
            icon={FileText}
            color="blue"
            variant="outline"
            isLoading={isLoading}
          />
          <MetricCard
            title="Importe Total"
            value={summary ? formatPEN(summary.total_amount_pen) : undefined}
            icon={Banknote}
            color="slate"
            variant="outline"
            isLoading={isLoading}
          />
          <MetricCard
            title="Saldo Total"
            value={summary ? formatPEN(summary.total_balance_pen) : undefined}
            icon={Banknote}
            color="indigo"
            variant="outline"
            isLoading={isLoading}
          />
          <MetricCard
            title="Saldo Vencido"
            value={summary ? formatPEN(summary.overdue_balance_pen) : undefined}
            subtitle={overduePercent}
            icon={TrendingDown}
            color="red"
            variant="outline"
            isLoading={isLoading}
          />
          <MetricCard
            title="Saldo por Vencer"
            value={summary ? formatPEN(summary.current_balance_pen) : undefined}
            subtitle={currentPercent}
            icon={TrendingUp}
            color="green"
            variant="outline"
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Error state */}
      {isError && !isLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <AlertCircle className="size-12 text-destructive" />
          <p className="text-muted-foreground text-sm">
            No se pudo cargar el dashboard. Intenta de nuevo.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Reintentar
          </Button>
        </div>
      )}

      {/* Empty state */}
      {isEmpty && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <BarChart2 className="size-12 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">
            Sin datos, haz una sincronización
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={isSyncing}
          >
            <RefreshCw
              className={`size-4 mr-1.5 ${isSyncing ? "animate-spin" : ""}`}
            />
            Sincronizar ahora
          </Button>
        </div>
      )}

      {/* Charts grid */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <ChartSkeleton key={i} />
          ))}
        </div>
      )}
      {!isLoading && !isError && !isEmpty && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-3">
            {getChart("balance_by_month") &&
              (() => {
                const chart = getChart("balance_by_month")!;
                const data = chart.labels.map((label, i) => ({
                  name: label,
                  value: chart.datasets[0]?.data[i] ?? 0,
                }));
                return (
                  <ChartAreaDefault
                    title={chart.title}
                    data={data}
                    valueFormatter={formatPEN}
                    valueLabel="Saldo (S/)"
                  />
                );
              })()}
          </div>
          <div className="lg:col-span-1">
            {getChart("balance_by_status") && (
              <StatusDonut chart={getChart("balance_by_status")!} />
            )}
          </div>

          {getChart("balance_by_sede") &&
            (() => {
              const chart = getChart("balance_by_sede")!;
              const data = chart.labels.map((label, i) => ({
                name: label,
                value: chart.datasets[0]?.data[i] ?? 0,
              }));
              return (
                <div className="lg:col-span-1">
                  <ChartBarMixed
                    title={chart.title}
                    data={data}
                    valueFormatter={formatPEN}
                    valueLabel="Saldo (S/)"
                  />
                </div>
              );
            })()}
          {getChart("top_sellers") &&
            (() => {
              const chart = getChart("top_sellers")!;
              const data = chart.labels
                .map((label, i) => ({
                  name: label,
                  value: chart.datasets[0]?.data[i] ?? 0,
                }))
                .sort((a, b) => b.value - a.value);
              return (
                <div className="lg:col-span-1">
                  <ChartBarLabelCustom
                    title={chart.title}
                    data={data}
                    valueFormatter={formatPEN}
                  />
                </div>
              );
            })()}
          {getChart("aging") && (
            <div className="lg:col-span-2">
              <AgingBar chart={getChart("aging")!} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
