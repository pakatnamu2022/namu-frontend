"use client";

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChartConfig } from "@/components/ui/chart";
import { ChartBarMixed } from "@/shared/charts/ChartBarMixed";
import { InteractivePieChart } from "@/shared/charts/InteractivePieChart";
import { FAMILIES } from "@/features/ap/configuraciones/vehiculos/familias/lib/families.constants";
import { FamilyReportItem } from "../lib/daily-delivery.interface";
import FamilyImage from "./FamilyImage";
import FamilyPodiumCard from "./FamilyPodiumCard";

type Metric = "entregas" | "facturadas";

const METRICS: Record<
  Metric,
  { label: string; unit: string; other: Metric; otherUnit: string }
> = {
  entregas: {
    label: "Entregas",
    unit: "entregas",
    other: "facturadas",
    otherUnit: "facturadas",
  },
  facturadas: {
    label: "Facturadas",
    unit: "facturadas",
    other: "entregas",
    otherUnit: "entregas",
  },
};

const PIE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];
const PIE_TOP = 5;
const BAR_TOP = 8;
const CARD_CLASS = "border-0 shadow-md";

interface FamilyReportProps {
  familyReport?: FamilyReportItem[];
}

export default function FamilyReport({ familyReport }: FamilyReportProps) {
  const [metric, setMetric] = useState<Metric>("entregas");
  const { unit, other, otherUnit } = METRICS[metric];

  const ranking = useMemo(
    () =>
      [...(familyReport ?? [])]
        .filter((f) => f[metric] > 0)
        .sort(
          (a, b) =>
            b[metric] - a[metric] ||
            b[METRICS[metric].other] - a[METRICS[metric].other] ||
            a.family.localeCompare(b.family),
        ),
    [familyReport, metric],
  );

  const total = useMemo(
    () => ranking.reduce((sum, f) => sum + f[metric], 0),
    [ranking, metric],
  );

  const withoutImage = useMemo(
    () => ranking.filter((f) => !f.image).length,
    [ranking],
  );

  const barData = useMemo(
    () =>
      ranking
        .slice(0, BAR_TOP)
        .map((f) => ({ name: f.family, value: f[metric] })),
    [ranking, metric],
  );

  const { pieData, pieConfig } = useMemo(() => {
    const top = ranking.slice(0, PIE_TOP);
    const rest = ranking.slice(PIE_TOP);
    const config: ChartConfig = {};
    const data: Array<{ name: string; value: number; fill: string }> = [];

    top.forEach((f, i) => {
      const key = `familia_${i}`;
      config[key] = { label: f.family, color: PIE_COLORS[i] };
      data.push({ name: key, value: f[metric], fill: `var(--color-${key})` });
    });

    const restTotal = rest.reduce((sum, f) => sum + f[metric], 0);
    if (restTotal > 0) {
      config.otras = { label: "Otras familias", color: "var(--muted-foreground)" };
      data.push({ name: "otras", value: restTotal, fill: "var(--color-otras)" });
    }

    return { pieData: data, pieConfig: config };
  }, [ranking, metric]);

  if (!familyReport || familyReport.length === 0) {
    return (
      <div className="rounded-xl bg-muted/30 p-10 text-center text-sm text-muted-foreground">
        No hay entregas por familia en el rango seleccionado.
      </div>
    );
  }

  const podium = ranking.slice(0, 3);
  const leader = ranking[0];
  const maxValue = ranking[0]?.[metric] ?? 1;

  return (
    <div className="space-y-6">
      {/* Cabecera: selector de métrica + resumen */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-end gap-8">
          <Stat label="Familias distintas" value={ranking.length} />
          <Stat label={`Total ${unit}`} value={total} />
          {leader && (
            <Stat
              label="Familia líder"
              value={leader.family}
              hint={`${((leader[metric] / total) * 100).toFixed(1)}% del total`}
            />
          )}
        </div>

        <div className="inline-flex rounded-lg bg-muted p-1">
          {(Object.keys(METRICS) as Metric[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setMetric(key)}
              className={cn(
                "rounded-md px-4 py-1.5 text-sm font-medium transition-all",
                metric === key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {METRICS[key].label}
            </button>
          ))}
        </div>
      </div>

      {ranking.length === 0 ? (
        <div className="rounded-xl bg-muted/30 p-10 text-center text-sm text-muted-foreground">
          No hay {unit} por familia en el rango seleccionado.
        </div>
      ) : (
        <>
          {/* Podio top 3 */}
          <div
            key={metric}
            className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-3"
          >
            {podium.map((family, i) => (
              <FamilyPodiumCard
                key={family.family_id ?? family.family}
                family={family}
                rank={i + 1}
                value={family[metric]}
                valueLabel={unit}
                secondaryLabel={otherUnit}
                secondaryValue={family[other]}
                share={(family[metric] / total) * 100}
                showModels={metric === "entregas"}
              />
            ))}
          </div>

          {withoutImage > 0 && (
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <ImageOff className="size-3.5" />
              {withoutImage} familia{withoutImage > 1 ? "s" : ""} sin imagen.
              Súbelas en{" "}
              <Link
                to={FAMILIES.ABSOLUTE_ROUTE}
                className="font-medium text-primary underline-offset-2 hover:underline"
              >
                Configuración › Familias
              </Link>
              .
            </p>
          )}

          {/* Gráficos compartidos */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <ChartBarMixed
              className={CARD_CLASS}
              title={`Top familias por ${unit}`}
              subtitle={`Las ${Math.min(BAR_TOP, ranking.length)} familias con más ${unit}`}
              data={barData}
              valueLabel={METRICS[metric].label}
            />
            <InteractivePieChart
              key={metric}
              className={CARD_CLASS}
              id={`family-share-${metric}`}
              title="Participación por familia"
              subtitle={`Distribución de ${unit} del periodo`}
              data={pieData}
              config={pieConfig}
              valueLabel={METRICS[metric].label}
              centerLabelAsPercent
              showLegend
              showPercentageInLegend
              showSelectionFooter
            />
          </div>

          {/* Ranking completo con miniaturas */}
          <div className="rounded-xl bg-card p-5 shadow-md">
            <div className="mb-4">
              <h3 className="font-semibold">Ranking completo</h3>
              <p className="text-sm text-muted-foreground">
                Todas las familias con {unit} en el periodo
              </p>
            </div>

            <ul className="space-y-1">
              {ranking.map((family, index) => (
                <motion.li
                  key={family.family_id ?? family.family}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(index, 12) * 0.03 }}
                  className="flex items-center gap-4 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/40"
                >
                  <span className="w-6 text-center text-sm font-semibold tabular-nums text-muted-foreground">
                    {index + 1}
                  </span>
                  <FamilyImage
                    image={family.image}
                    brandLogo={family.brand_logo}
                    alt={family.family}
                    className="h-12 w-20 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="truncate font-medium">
                        {family.family}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {family.brand}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        className="h-full rounded-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(family[metric] / maxValue) * 100}%`,
                        }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                      />
                    </div>
                    {metric === "entregas" && family.modelos.length > 0 && (
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {family.modelos
                          .map((m) => `${m.modelo} (${m.entregas})`)
                          .join(" · ")}
                      </p>
                    )}
                  </div>
                  <div className="w-16 text-right">
                    <div className="text-lg font-bold tabular-nums">
                      {family[metric]}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {unit}
                    </div>
                  </div>
                  <div className="hidden w-16 text-right sm:block">
                    <div className="text-sm font-semibold tabular-nums text-emerald-600">
                      {family[other]}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {otherUnit}
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
      {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}
