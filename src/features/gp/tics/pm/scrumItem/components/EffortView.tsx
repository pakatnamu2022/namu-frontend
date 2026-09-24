"use client";

import { useMemo, useState } from "react";
import { addDays, differenceInCalendarDays, format, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import { TrendingUp, X } from "lucide-react";
import { ChartAreaDefault } from "@/shared/charts/ChartAreaDefault";
import { ScrumItemResource } from "@/features/gp/tics/pm/scrumItem/lib/scrumItem.interface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Props {
  items: ScrumItemResource[];
  isLoading: boolean;
}

interface WeekContribution {
  item: ScrumItemResource;
  points: number;
}

type WeekPoint = {
  name: string;
  value: number;
  weekKey: string;
};

// El esfuerzo de una semana es la suma de story points de las tareas activas
// en esa semana (repartiendo el punto de cada tarea entre los días de su
// rango start_date..due_date). Tareas sin story points cuentan como 1 (el
// mínimo, no cero), para que toda tarea con fechas pese en la curva.
function buildEffortSeries(items: ScrumItemResource[]) {
  const dailyLoad = new Map<string, number>();
  const weekContributions = new Map<string, Map<number, WeekContribution>>();

  // `items` trae TODO el árbol (historias + sus propias subtareas). Si una
  // historia tiene subtareas, sus story points ya están repartidos entre
  // ellas (ver MejoraProcesosApSeeder::splitStoryPoints) — sumar también el
  // de la historia duplicaría ese esfuerzo. Solo se pesan las hojas: items
  // que ningún otro item referencia como parent_id.
  const parentIds = new Set(items.filter((i) => i.parent_id).map((i) => i.parent_id));
  const leafItems = items.filter((i) => !parentIds.has(i.id));

  for (const item of leafItems) {
    if (!item.start_date || !item.due_date) continue;
    const start = new Date(item.start_date);
    const end = new Date(item.due_date);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) continue;

    const points = item.story_points ?? 1;
    const days = differenceInCalendarDays(end, start) + 1;
    const perDay = points / days;

    for (let i = 0; i < days; i++) {
      const day = addDays(start, i);
      const weekKey = format(startOfWeek(day, { weekStartsOn: 1 }), "yyyy-MM-dd");
      dailyLoad.set(weekKey, (dailyLoad.get(weekKey) ?? 0) + perDay);

      if (!weekContributions.has(weekKey)) weekContributions.set(weekKey, new Map());
      const weekMap = weekContributions.get(weekKey)!;
      const existing = weekMap.get(item.id);
      weekMap.set(item.id, { item, points: (existing?.points ?? 0) + perDay });
    }
  }

  const series: WeekPoint[] = [...dailyLoad.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekKey, value]) => ({
      name: format(new Date(weekKey), "dd MMM", { locale: es }),
      value: Math.round(value * 10) / 10,
      weekKey,
    }));

  return { series, weekContributions };
}

export function EffortView({ items, isLoading }: Props) {
  const { series, weekContributions } = useMemo(() => buildEffortSeries(items), [items]);
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);

  const detail = useMemo(() => {
    if (!selectedWeek) return null;
    const weekMap = weekContributions.get(selectedWeek);
    if (!weekMap) return null;
    return [...weekMap.values()].sort((a, b) => b.points - a.points);
  }, [selectedWeek, weekContributions]);

  const selectedLabel = useMemo(() => {
    if (!selectedWeek) return null;
    return series.find((p) => p.weekKey === selectedWeek)?.name ?? null;
  }, [selectedWeek, series]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (series.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center px-6">
        <TrendingUp className="size-8 text-muted-foreground/50" />
        <p className="text-sm font-medium">Sin datos suficientes</p>
        <p className="text-xs text-muted-foreground max-w-xs">
          Asigna fecha de inicio y fecha de fin a los items para ver la curva de esfuerzo (ponderada por story points).
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-2 flex flex-col gap-3">
      <ChartAreaDefault
        title="Curva de esfuerzo del proyecto"
        description="Story points activos por semana, según el rango de fechas de cada item. Haz clic en un punto para ver el detalle."
        data={series}
        valueLabel="Story points"
        showYAxis
        showDots
        defaultRange="all"
        onPointClick={(point) => setSelectedWeek(point.weekKey as string)}
      />

      {detail && (
        <Card className="pt-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b py-3">
            <CardTitle className="text-sm">
              Detalle de la semana del {selectedLabel}
            </CardTitle>
            <Button variant="ghost" size="icon-sm" onClick={() => setSelectedWeek(null)}>
              <X className="size-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-col gap-2">
              {detail.map(({ item, points }) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 text-sm border-b last:border-b-0 pb-2 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.start_date} — {item.due_date}
                    </p>
                  </div>
                  <Badge variant="outline" className="whitespace-nowrap">
                    {Math.round(points * 10) / 10} pts esta semana
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
