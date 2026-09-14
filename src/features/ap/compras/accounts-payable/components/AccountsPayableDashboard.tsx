import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  RefreshCw,
  Clock,
  FileText,
  Banknote,
  AlertCircle,
  BarChart2,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import type { ChartConfig } from "@/components/ui/chart";
import { InteractivePieChart } from "@/shared/charts/InteractivePieChart";
import { ChartBarLabelCustom } from "@/shared/charts/ChartBarLabelCustom";
import { ChartAreaDefault } from "@/shared/charts/ChartAreaDefault";
import { Link } from "react-router-dom";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";

import { MetricCard } from "@/shared/components/MetricCard";
import TitleComponent from "@/shared/components/TitleComponent";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { successToast, errorToast } from "@/core/core.function";

import { useAccountsPayableDashboard } from "../lib/accountsPayable.hook";
import { syncAccountsPayable } from "../lib/accountsPayable.actions";
import { ACCOUNTS_PAYABLE } from "../lib/accountsPayable.constants";
import type { DashboardChart, DashboardFilters } from "../lib/accountsPayable.interface";

const PIE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
];

const MONEDAS = ["PEN", "USD"];

const formatAmount = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

function formatSyncedAt(raw: string): string {
  try {
    return format(parseISO(raw.replace(" ", "T")), "dd/MM/yyyy HH:mm", {
      locale: es,
    });
  } catch {
    return raw;
  }
}

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

function MonedaDonut({ chart }: { chart: DashboardChart }) {
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
      valueFormatter={formatAmount}
    />
  );
}

interface AccountsPayableDashboardProps {
  company?: string;
  title?: string;
  subtitle?: string;
  listRoute?: string;
}

export default function AccountsPayableDashboard({
  company = ACCOUNTS_PAYABLE.COMPANY,
  title = "Dashboard — Cuentas por Pagar",
  subtitle = "Depósito Pakatnamu",
  listRoute = "/dp/comercial/accounts-payable",
}: AccountsPayableDashboardProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [dashFilters, setDashFilters] = useState<DashboardFilters>({});
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useAccountsPayableDashboard(
    company,
    dashFilters,
  );

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncAccountsPayable(company);
      await queryClient.invalidateQueries({
        queryKey: [ACCOUNTS_PAYABLE.QUERY_KEY, "dashboard"],
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

  const summary = data?.summary;
  const syncedAt = data?.synced_at;
  const charts = data?.charts ?? [];

  const isEmpty =
    !isLoading &&
    !isError &&
    data != null &&
    charts.every((c) => (c.datasets[0]?.data ?? []).length === 0);

  const getChart = (id: string) => charts.find((c) => c.id === id);

  return (
    <div className="relative space-y-6">
      {isSyncing && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-xl bg-background/80 backdrop-blur-sm min-h-40">
          <RefreshCw className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-medium">
            Sincronizando datos…
          </p>
        </div>
      )}

      <HeaderTableWrapper>
        <TitleComponent title={title} subtitle={subtitle} icon="BarChart2">
          {syncedAt && !isLoading && (
            <span className="hidden md:flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3" />
              Última sync: {formatSyncedAt(syncedAt)}
            </span>
          )}
        </TitleComponent>

        <div className="flex items-center gap-2">
          <Link to={listRoute}>
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

      <ButtonGroup>
        <Button
          type="button"
          size="sm"
          variant={dashFilters.moneda === undefined ? "default" : "outline"}
          onClick={() => setDashFilters({})}
        >
          Todas
        </Button>
        {MONEDAS.map((m) => (
          <Button
            key={m}
            type="button"
            size="sm"
            variant={dashFilters.moneda === m ? "default" : "outline"}
            onClick={() => setDashFilters({ moneda: m })}
          >
            {m}
          </Button>
        ))}
      </ButtonGroup>

      {!isError && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard
            title="Total Documentos"
            value={summary?.total_documents.toLocaleString("en-US")}
            icon={FileText}
            color="blue"
            variant="outline"
            isLoading={isLoading}
          />
          <MetricCard
            title="Monto Total"
            value={summary ? formatAmount(summary.total_amount) : undefined}
            icon={Banknote}
            color="slate"
            variant="outline"
            isLoading={isLoading}
          />
          <MetricCard
            title="Saldo sin aplicar"
            value={summary ? formatAmount(summary.total_pending) : undefined}
            icon={Banknote}
            color="indigo"
            variant="outline"
            isLoading={isLoading}
          />
        </div>
      )}

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

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <ChartSkeleton key={i} />
          ))}
        </div>
      )}
      {!isLoading && !isError && !isEmpty && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            {getChart("pending_by_month") &&
              (() => {
                const chart = getChart("pending_by_month")!;
                const data = chart.labels.map((label, i) => ({
                  name: label,
                  value: chart.datasets[0]?.data[i] ?? 0,
                }));
                return (
                  <ChartAreaDefault
                    title={chart.title}
                    data={data}
                    valueFormatter={formatAmount}
                    valueLabel="Saldo sin aplicar"
                  />
                );
              })()}
          </div>
          <div className="lg:col-span-1">
            {getChart("pending_by_moneda") && (
              <MonedaDonut chart={getChart("pending_by_moneda")!} />
            )}
          </div>

          {getChart("top_proveedores") &&
            (() => {
              const chart = getChart("top_proveedores")!;
              const data = chart.labels
                .map((label, i) => ({
                  name: label,
                  value: chart.datasets[0]?.data[i] ?? 0,
                }))
                .sort((a, b) => b.value - a.value);
              return (
                <div className="lg:col-span-3">
                  <ChartBarLabelCustom
                    title={chart.title}
                    data={data}
                    valueFormatter={formatAmount}
                  />
                </div>
              );
            })()}
        </div>
      )}
    </div>
  );
}
