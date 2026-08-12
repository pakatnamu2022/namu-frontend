"use client";

import { useState } from "react";
import { NotebookPen, ShoppingCart, TrendingUp, Wallet } from "lucide-react";
import TitleComponent from "@/shared/components/TitleComponent";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { MetricCard } from "@/shared/components/MetricCard";
import { ChartBarMixed } from "@/shared/charts/ChartBarMixed";
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
    dashboard?.budget_totals.reduce((acc, b) => acc + b.total_estimated, 0) ?? 0;
  const budgetExecuted =
    dashboard?.budget_totals.reduce((acc, b) => acc + b.total_executed, 0) ?? 0;
  const activitiesTotal =
    dashboard?.activities_status.reduce((acc, a) => acc + a.total, 0) ?? 0;
  const ordersTotal =
    dashboard?.orders_status.reduce((acc, o) => acc + o.total_amount, 0) ?? 0;

  const monthlyBudgetsData = (monthly?.monthly_budgets ?? []).map((m) => ({
    name: MONTH_OPTIONS.find((mo) => mo.value === m.period_month.toString())?.label ?? String(m.period_month),
    value: m.estimated,
  }));

  const byBrandData = (monthly?.by_brand ?? []).map((b) => ({
    name: b.brand_name ?? b.plan_name,
    value: b.amount_estimated,
  }));

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title="Dashboard de Marketing"
          subtitle="Resumen general del módulo de Marketing"
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
          value={budgetEstimated.toLocaleString("es-PE", { style: "currency", currency: "PEN" })}
          subtitle={`Ejecutado: ${budgetExecuted.toLocaleString("es-PE", { style: "currency", currency: "PEN" })}`}
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
          value={ordersTotal.toLocaleString("es-PE", { style: "currency", currency: "PEN" })}
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
            data={monthlyBudgetsData}
            valueLabel="Monto"
          />
        )}
        {!isLoadingMonthly && byBrandData.length > 0 && (
          <ChartBarMixed
            title="Presupuesto Estimado por Marca"
            data={byBrandData}
            valueLabel="Monto"
          />
        )}
      </div>
    </div>
  );
}
