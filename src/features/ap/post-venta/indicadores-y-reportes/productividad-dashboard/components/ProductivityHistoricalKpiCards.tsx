"use client";

import { LucideIcon, TrendingUp, Wallet, CheckCircle2, Wrench } from "lucide-react";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney } from "@/core/core.function";
import { cn } from "@/lib/utils";
import {
  ProductivityMonthComparison,
  ProductivityMonthSnapshot,
} from "../lib/productivityHistorical.interface";

interface ProductivityHistoricalKpiCardsProps {
  snapshot: ProductivityMonthSnapshot;
  comparison: ProductivityMonthComparison | null;
  periodDescription: string;
  isLoading?: boolean;
}

const KPI_COLOR_CLASSES: Record<string, { bg: string; text: string }> = {
  blue: { bg: "bg-blue-600", text: "text-blue-600 dark:text-blue-400" },
  green: { bg: "bg-green-600", text: "text-green-600 dark:text-green-400" },
  violet: { bg: "bg-violet-600", text: "text-violet-600 dark:text-violet-400" },
  amber: { bg: "bg-amber-600", text: "text-amber-600 dark:text-amber-400" },
};

function ChangeIndicator({
  change,
  suffix = "",
}: {
  change: number | undefined | null;
  suffix?: string;
}) {
  if (change === undefined || change === null) {
    return <span className="text-xs text-muted-foreground">Sin dato previo</span>;
  }

  const isPositive = change > 0;
  const isNeutral = change === 0;
  const Icon = isNeutral ? Minus : isPositive ? ArrowUp : ArrowDown;
  const colorClass = isNeutral
    ? "text-muted-foreground"
    : isPositive
      ? "text-green-600 dark:text-green-400"
      : "text-red-600 dark:text-red-400";

  return (
    <span className={cn("flex items-center gap-1 text-xs font-medium", colorClass)}>
      <Icon className="size-3.5" />
      {Math.abs(change).toLocaleString("es-PE", { maximumFractionDigits: 2 })}
      {suffix} vs. mes anterior
    </span>
  );
}

interface KpiCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  color: keyof typeof KPI_COLOR_CLASSES;
  change: number | undefined | null;
  changeSuffix?: string;
  isLoading?: boolean;
}

function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  change,
  changeSuffix,
  isLoading,
}: KpiCardProps) {
  const colors = KPI_COLOR_CLASSES[color];

  return (
    <Card className="overflow-hidden p-0 gap-0 bg-linear-to-br from-muted to-background">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex w-full justify-between items-center">
          <CardDescription className="line-clamp-1 font-semibold">
            {title}
          </CardDescription>
          <div className={cn("p-1 rounded-md", colors.bg)}>
            <Icon className="w-4 h-4 text-white" />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2 pt-1">
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ) : (
          <>
            <CardTitle className={cn("text-2xl font-semibold tabular-nums mb-0", colors.text)}>
              {value}
            </CardTitle>
            <p className="text-xs line-clamp-1 text-muted-foreground">
              {subtitle}
            </p>
          </>
        )}
      </CardHeader>
      {!isLoading && (
        <CardContent className="px-4 pb-4 pt-1">
          <ChangeIndicator change={change} suffix={changeSuffix} />
        </CardContent>
      )}
    </Card>
  );
}

export default function ProductivityHistoricalKpiCards({
  snapshot,
  comparison,
  periodDescription,
  isLoading = false,
}: ProductivityHistoricalKpiCardsProps) {
  const productivity = Number(snapshot.average_productivity_percentage);
  const earnings = Number(snapshot.total_earnings);
  const coverage = Number(snapshot.labour_coverage_rate);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        title="Productividad promedio"
        value={`${productivity.toFixed(1)}%`}
        subtitle={periodDescription}
        icon={TrendingUp}
        color="blue"
        isLoading={isLoading}
        change={comparison?.productivity_percentage_change}
        changeSuffix="%"
      />

      <KpiCard
        title="Ganancias totales"
        value={formatMoney(earnings)}
        subtitle={periodDescription}
        icon={Wallet}
        color="green"
        isLoading={isLoading}
        change={comparison?.earnings_change}
      />

      <KpiCard
        title="OTs cerradas"
        value={snapshot.total_ots_closed.toLocaleString("es-PE")}
        subtitle={`${snapshot.ots_with_labour_charged} con m.o. · ${snapshot.ots_without_labour_charged} sin m.o.`}
        icon={CheckCircle2}
        color="violet"
        isLoading={isLoading}
        change={comparison?.ots_closed_change}
      />

      <KpiCard
        title="OTs con M.O. registrada"
        value={`${coverage.toFixed(1)}%`}
        subtitle={`${snapshot.total_technicians} técnicos`}
        icon={Wrench}
        color="amber"
        isLoading={isLoading}
        change={comparison?.labour_coverage_change}
        changeSuffix="%"
      />
    </div>
  );
}
