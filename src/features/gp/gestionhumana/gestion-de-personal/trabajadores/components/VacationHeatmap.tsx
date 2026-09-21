"use client";

import { useMemo, useState } from "react";
import { eachDayOfInterval, format, getDay, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { WorkerVacationResource } from "../lib/worker.interface";

/** config_status: 17 = PENDIENTE, 19 = APROBADO. */
const STATUS_PENDING = 17;
const STATUS_APPROVED = 19;

type DayState = "approved" | "pending";

const CELL = 12;
const GAP = 3;
const STEP = CELL + GAP;
/** Etiquetas de filas (lunes primero); solo se rotulan lun, mié y vie como en GitHub. */
const WEEKDAY_LABELS = ["Lun", "", "Mié", "", "Vie", "", ""];

const CELL_COLOR: Record<DayState | "empty", string> = {
  approved: "bg-primary",
  pending: "bg-orange-400",
  empty: "bg-foreground/10",
};

const monthLabel = (month: number) =>
  new Date(2000, month, 1).toLocaleDateString("es-PE", { month: "short" });

const longDate = (date: Date) =>
  date.toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

/** Marca cada día calendario cubierto por una vacación (aprobada gana a pendiente). */
function buildDayMap(vacations: WorkerVacationResource[]) {
  const days = new Map<string, DayState>();
  for (const vacation of vacations) {
    const state: DayState | null =
      vacation.status_id === STATUS_APPROVED
        ? "approved"
        : vacation.status_id === STATUS_PENDING
          ? "pending"
          : null;
    if (!state || !vacation.fecha_inicio || !vacation.fecha_fin) continue;

    const start = parseISO(vacation.fecha_inicio);
    const end = parseISO(vacation.fecha_fin);
    // El legacy trae fechas invertidas o absurdas: se ignoran.
    if (start > end || end.getTime() - start.getTime() > 400 * 86_400_000)
      continue;

    for (const day of eachDayOfInterval({ start, end })) {
      const key = format(day, "yyyy-MM-dd");
      if (days.get(key) !== "approved") days.set(key, state);
    }
  }
  return days;
}

export default function VacationHeatmap({
  vacations,
}: {
  vacations: WorkerVacationResource[];
}) {
  const dayMap = useMemo(() => buildDayMap(vacations), [vacations]);

  const years = useMemo(() => {
    const set = new Set<number>([new Date().getFullYear()]);
    dayMap.forEach((_, key) => set.add(Number(key.slice(0, 4))));
    return [...set].sort((a, b) => b - a);
  }, [dayMap]);

  const [year, setYear] = useState(() => {
    const withVacations = years.find((y) =>
      [...dayMap.keys()].some((k) => k.startsWith(`${y}-`)),
    );
    return withVacations ?? years[0];
  });

  const { cells, months, totals } = useMemo(() => {
    const days = eachDayOfInterval({
      start: new Date(year, 0, 1),
      end: new Date(year, 11, 31),
    });
    // Semana que empieza el lunes: cuántas celdas vacías antes del 1 de enero.
    const offset = (getDay(days[0]) + 6) % 7;

    const totals = { approved: 0, pending: 0 };
    const cells = days.map((date) => {
      const state = dayMap.get(format(date, "yyyy-MM-dd")) ?? null;
      if (state) totals[state] += 1;
      return { date, state };
    });

    const months = Array.from({ length: 12 }, (_, month) => ({
      month,
      week: Math.floor(
        (offset + Math.round((new Date(year, month, 1).getTime() - days[0].getTime()) / 86_400_000)) / 7,
      ),
    }));

    return { cells: { offset, days: cells }, months, totals };
  }, [dayMap, year]);

  const weeks = Math.ceil((cells.offset + cells.days.length) / 7);
  const gridWidth = weeks * STEP - GAP;

  return (
    <div className="flex flex-col gap-4 p-4 md:flex-row">
      <div className="min-w-0 flex-1 space-y-3">
        <p className="text-sm font-medium">
          {totals.approved} {totals.approved === 1 ? "día" : "días"} de
          vacaciones en {year}
          {totals.pending > 0 && (
            <span className="font-normal text-muted-foreground">
              {" "}
              · {totals.pending} pendientes de aprobación
            </span>
          )}
        </p>

        <div className="overflow-x-auto pb-1">
          <div className="flex gap-2">
            {/* Etiquetas de días de la semana */}
            <div
              className="grid shrink-0 text-[10px] leading-none text-muted-foreground"
              style={{
                marginTop: STEP,
                gridTemplateRows: `repeat(7, ${CELL}px)`,
                rowGap: GAP,
              }}
            >
              {WEEKDAY_LABELS.map((label, i) => (
                <span key={i} className="flex items-center">
                  {label}
                </span>
              ))}
            </div>

            <div>
              {/* Etiquetas de meses */}
              <div
                className="relative text-[10px] leading-none text-muted-foreground"
                style={{ height: STEP, width: gridWidth }}
              >
                {months.map(({ month, week }) => (
                  <span
                    key={month}
                    className="absolute top-0 capitalize"
                    style={{ left: week * STEP }}
                  >
                    {monthLabel(month).replace(".", "")}
                  </span>
                ))}
              </div>

              <div
                className="grid grid-flow-col"
                style={{
                  gridTemplateRows: `repeat(7, ${CELL}px)`,
                  gridAutoColumns: `${CELL}px`,
                  gap: GAP,
                }}
              >
                {Array.from({ length: cells.offset }, (_, i) => (
                  <span key={`pad-${i}`} />
                ))}
                {cells.days.map(({ date, state }) => (
                  <span
                    key={date.getTime()}
                    title={`${longDate(date)}${
                      state
                        ? ` · Vacaciones (${state === "approved" ? "aprobadas" : "pendientes"})`
                        : ""
                    }`}
                    className={cn(
                      "rounded-[3px]",
                      CELL_COLOR[state ?? "empty"],
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
          {(
            [
              ["empty", "Sin vacaciones"],
              ["approved", "Aprobadas"],
              ["pending", "Pendientes"],
            ] as const
          ).map(([state, label]) => (
            <span key={state} className="flex items-center gap-1.5">
              <span
                className={cn("size-3 rounded-[3px]", CELL_COLOR[state])}
              />
              {label}
            </span>
          ))}
        </div>
      </div>

      {years.length > 1 && (
        <div className="flex gap-1.5 md:w-20 md:flex-col">
          {years.map((y) => (
            <Button
              key={y}
              size="sm"
              variant={y === year ? "default" : "ghost"}
              onClick={() => setYear(y)}
            >
              {y}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
