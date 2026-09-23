"use client";

import { useMemo } from "react";
import { addDays, differenceInCalendarDays, format, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import { TrendingUp } from "lucide-react";
import { ChartAreaDefault } from "@/shared/charts/ChartAreaDefault";
import { ScrumItemResource } from "@/features/gp/tics/pm/scrumItem/lib/scrumItem.interface";

interface Props {
  items: ScrumItemResource[];
  isLoading: boolean;
}

// Reparte el esfuerzo (horas estimadas, o puntos si no hay horas) de cada
// item entre los días de su rango start_date..due_date, y agrupa el total
// por semana para ver dónde se concentra la carga del proyecto.
function buildEffortSeries(items: ScrumItemResource[]) {
  const dailyLoad = new Map<string, number>();

  for (const item of items) {
    if (!item.start_date || !item.due_date) continue;
    const start = new Date(item.start_date);
    const end = new Date(item.due_date);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) continue;

    const effort = item.estimated_hours ?? item.story_points ?? 0;
    if (!effort) continue;

    const days = differenceInCalendarDays(end, start) + 1;
    const perDay = effort / days;

    for (let i = 0; i < days; i++) {
      const day = addDays(start, i);
      const weekKey = format(startOfWeek(day, { weekStartsOn: 1 }), "yyyy-MM-dd");
      dailyLoad.set(weekKey, (dailyLoad.get(weekKey) ?? 0) + perDay);
    }
  }

  return [...dailyLoad.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekKey, value]) => ({
      name: format(new Date(weekKey), "dd MMM", { locale: es }),
      value: Math.round(value * 10) / 10,
    }));
}

export function EffortView({ items, isLoading }: Props) {
  const data = useMemo(() => buildEffortSeries(items), [items]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center px-6">
        <TrendingUp className="size-8 text-muted-foreground/50" />
        <p className="text-sm font-medium">Sin datos suficientes</p>
        <p className="text-xs text-muted-foreground max-w-xs">
          Asigna fecha de inicio, fecha de fin y horas estimadas (o puntos) a los items para ver la curva de esfuerzo.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-2">
      <ChartAreaDefault
        title="Curva de esfuerzo del proyecto"
        description="Carga de trabajo estimada por semana, según el rango de fechas de cada item"
        data={data}
        valueLabel="Esfuerzo"
        showYAxis
        showDots
        defaultRange="all"
        fillHeight
      />
    </div>
  );
}
