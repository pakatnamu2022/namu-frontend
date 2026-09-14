"use client";

import { useState } from "react";
import {
  Award,
  NotebookPen,
  Percent,
  ShoppingCart,
  Target,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import TitleComponent from "@/shared/components/TitleComponent";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { MetricCard } from "@/shared/components/MetricCard";
import { ChartBarMixed } from "@/shared/charts/ChartBarMixed";
import { ChartBarLabelCustom } from "@/shared/charts/ChartBarLabelCustom";
import { ChartAreaDefault } from "@/shared/charts/ChartAreaDefault";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FormSelect } from "@/shared/components/FormSelect";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { FILTER_YEAR_START, MONTH_OPTIONS } from "@/core/core.constants";
import { generateYear } from "@/core/core.function";
import { useAllBrands } from "@/features/ap/configuraciones/vehiculos/marcas/lib/brands.hook";
import {
  useMarketingDashboard,
  useMarketingDashboardMonthly,
} from "@/features/ap/comercial/marketing/dashboard/lib/marketingDashboard.hook";

// El dashboard consolida montos de presupuestos/KPIs que pueden venir en distintas
// monedas (PEN/USD): el backend ya los convierte todos a USD con el tipo de cambio
// vigente por fecha, así que aquí solo se formatean como dólares.
const currencyFormatter = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD" });

export default function MarketingDashboardPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<number>(currentYear);
  const [brandId, setBrandId] = useState<string>("");

  const { data: brands = [] } = useAllBrands();
  const { data: dashboard, isLoading } = useMarketingDashboard({ year });
  const { data: monthly, isLoading: isLoadingMonthly } = useMarketingDashboardMonthly({
    year,
    brand_id: brandId || undefined,
  });

  const form = useForm({ defaultValues: { year: year.toString(), brand_id: "" } });

  const budgetEstimated =
    dashboard?.budget_totals.reduce((acc, b) => acc + Number(b.total_estimated), 0) ?? 0;
  const budgetExecuted =
    dashboard?.budget_totals.reduce((acc, b) => acc + Number(b.total_executed), 0) ?? 0;
  const activitiesTotal =
    dashboard?.activities_status.reduce((acc, a) => acc + Number(a.total), 0) ?? 0;
  const ordersTotal =
    dashboard?.orders_status.reduce((acc, o) => acc + Number(o.total_amount), 0) ?? 0;

  const monthlyBudgetsData = (monthly?.monthly_budgets ?? []).map((m) => ({
    name: MONTH_OPTIONS.find((mo) => mo.value === m.period_month.toString())?.label ?? String(m.period_month),
    value: Number(m.estimated),
  }));

  const byBrandData = (monthly?.by_brand ?? []).map((b) => ({
    name: b.brand_name ?? b.plan_name,
    value: Number(b.amount_estimated),
  }));

  const kpiTotals = dashboard?.kpi_totals;
  const kpisByChannel = dashboard?.kpis_by_channel ?? [];
  const topActivities = dashboard?.top_activities ?? [];

  const monthlyKpisData = (monthly?.monthly_kpis ?? []).map((m) => ({
    name: MONTH_OPTIONS.find((mo) => mo.value === m.period_month.toString())?.label ?? String(m.period_month),
    value: Number(m.total_leads),
    value2: Number(m.total_sales),
  }));

  const channelInvestmentData = kpisByChannel.map((c) => ({
    name: c.channel,
    value: Number(c.total_investment),
  }));

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title="Dashboard de Marketing"
          subtitle="Resumen general del módulo de Marketing · montos consolidados en USD"
          icon="LayoutDashboard"
        />
        <Form {...form}>
          <div className="flex gap-2 items-center">
            <FormSelect
              name="year"
              placeholder="Año"
              options={generateYear(FILTER_YEAR_START).map((y) => ({ label: y.toString(), value: y.toString() }))}
              control={form.control}
              onValueChange={(v) => setYear(Number(v))}
            />
            <FormSelect
              name="brand_id"
              placeholder="Todas las marcas"
              options={brands.map((b) => ({ label: b.name, value: b.id.toString() }))}
              control={form.control}
              onValueChange={setBrandId}
            />
          </div>
        </Form>
      </HeaderTableWrapper>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Planes Activos"
          value={dashboard?.plans_count ?? 0}
          subtitle={`Año ${year}`}
          icon={NotebookPen}
          color="blue"
          isLoading={isLoading}
        />
        <MetricCard
          title="Presupuesto Estimado"
          value={currencyFormatter(budgetEstimated)}
          subtitle={`Ejecutado: ${currencyFormatter(budgetExecuted)}`}
          icon={Wallet}
          color="emerald"
          isLoading={isLoading}
        />
        <MetricCard
          title="Actividades"
          value={activitiesTotal}
          subtitle="Total registradas"
          icon={TrendingUp}
          color="violet"
          isLoading={isLoading}
        />
        <MetricCard
          title="Órdenes de Compra"
          value={currencyFormatter(ordersTotal)}
          subtitle="Monto total"
          icon={ShoppingCart}
          color="amber"
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {!isLoadingMonthly && monthlyBudgetsData.length > 0 && (
          <ChartBarMixed
            title="Presupuesto Estimado por Mes"
            subtitle="Evolución mensual del presupuesto estimado de campañas"
            data={monthlyBudgetsData}
            valueLabel="Monto"
            valueFormatter={currencyFormatter}
          />
        )}
        {!isLoadingMonthly && byBrandData.length > 0 && (
          <ChartBarMixed
            title="Presupuesto Estimado por Marca"
            subtitle="Distribución del presupuesto estimado por marca o plan"
            data={byBrandData}
            valueLabel="Monto"
            valueFormatter={currencyFormatter}
          />
        )}
      </div>

      <HeaderTableWrapper>
        <TitleComponent
          title="Rendimiento de Campañas (KPIs)"
          subtitle="Resultados reales de las campañas: leads, ventas y costos, para orientar dónde invertir más."
          icon="Target"
        />
      </HeaderTableWrapper>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Leads Generados"
          value={kpiTotals?.total_leads ?? 0}
          subtitle={`Año ${year}`}
          icon={Users}
          color="sky"
          isLoading={isLoading}
        />
        <MetricCard
          title="Ventas Cerradas"
          value={kpiTotals?.total_sales ?? 0}
          subtitle="Conversiones registradas"
          icon={Award}
          color="green"
          isLoading={isLoading}
        />
        <MetricCard
          title="Tasa de Conversión"
          value={`${kpiTotals?.conversion_rate ?? 0}%`}
          subtitle="Ventas / Leads"
          icon={Percent}
          color="purple"
          isLoading={isLoading}
        />
        <MetricCard
          title="Costo por Lead (CPL)"
          value={currencyFormatter(kpiTotals?.cost_per_lead ?? 0)}
          subtitle={`Costo por venta: ${currencyFormatter(kpiTotals?.cost_per_sale ?? 0)}`}
          icon={Target}
          color="orange"
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {!isLoadingMonthly && monthlyKpisData.length > 0 && (
          <ChartAreaDefault
            title="Leads vs Ventas por Mes"
            description="Evolución mensual de leads generados y ventas cerradas"
            data={monthlyKpisData}
            valueLabel="Leads"
            value2Label="Ventas"
          />
        )}
        {!isLoading && channelInvestmentData.length > 0 && (
          <ChartBarLabelCustom
            title="Inversión por Canal"
            subtitle="En qué canales se está invirtiendo el presupuesto de campañas"
            data={channelInvestmentData}
            valueFormatter={currencyFormatter}
            color="var(--chart-4)"
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {!isLoading && kpisByChannel.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">
                Rendimiento por Canal
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Leads, ventas, conversión y CPL por canal, para saber dónde reforzar la inversión.
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Canal</TableHead>
                    <TableHead className="text-right">Leads</TableHead>
                    <TableHead className="text-right">Ventas</TableHead>
                    <TableHead className="text-right">Conversión</TableHead>
                    <TableHead className="text-right">CPL</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kpisByChannel.map((c) => (
                    <TableRow key={c.channel}>
                      <TableCell className="font-medium">{c.channel}</TableCell>
                      <TableCell className="text-right">{c.total_leads}</TableCell>
                      <TableCell className="text-right">{c.total_sales}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={c.conversion_rate >= 10 ? "default" : "secondary"}>
                          {c.conversion_rate}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{currencyFormatter(c.cost_per_lead)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {!isLoading && topActivities.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">
                Top 5 Campañas por Ventas
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Las actividades que más ventas generaron — buenas candidatas para repetir o ampliar.
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Actividad</TableHead>
                    <TableHead className="text-right">Leads</TableHead>
                    <TableHead className="text-right">Ventas</TableHead>
                    <TableHead className="text-right">Conversión</TableHead>
                    <TableHead className="text-right">CPL</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topActivities.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">
                        {a.name}
                        <span className="block text-xs text-muted-foreground font-normal">
                          {a.channel ?? "Sin canal"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{a.total_leads}</TableCell>
                      <TableCell className="text-right">{a.total_sales}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={a.conversion_rate >= 10 ? "default" : "secondary"}>
                          {a.conversion_rate}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{currencyFormatter(a.cost_per_lead)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
