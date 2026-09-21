"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { AuditTimelineEvent } from "../lib/vehicle-sale-audit.interface";
import {
  GraphEventRow,
  GraphRow,
  buildGraph,
  describeEvent,
  timeOf,
} from "../lib/vehicle-sale-audit.graph";

const LANE_W = 24;
/** Altura (px) desde el borde superior de la fila hasta el centro del punto. */
const DOT_Y = 20;

/** Estilos por carril: 0 = línea principal del vehículo, 1+ = ramas de traslado. */
const LANE_STYLE = [
  {
    line: "bg-muted-foreground/30",
    dot: "bg-muted-foreground/70",
    chip: "bg-muted text-muted-foreground",
  },
  {
    line: "bg-amber-400",
    dot: "bg-amber-500",
    chip: "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200",
  },
  {
    line: "bg-violet-400",
    dot: "bg-violet-500",
    chip: "bg-violet-50 text-violet-800 dark:bg-violet-950/40 dark:text-violet-200",
  },
  {
    line: "bg-teal-400",
    dot: "bg-teal-500",
    chip: "bg-teal-50 text-teal-800 dark:bg-teal-950/40 dark:text-teal-200",
  },
];
const laneStyle = (lane: number) =>
  lane === 0
    ? LANE_STYLE[0]
    : LANE_STYLE[((lane - 1) % (LANE_STYLE.length - 1)) + 1];

const x = (lane: number) => lane * LANE_W + LANE_W / 2;

export function AuditTimelineLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <span className="h-0.5 w-4 rounded bg-muted-foreground/40" />
        Vehículo
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-0.5 w-4 rounded bg-amber-400" />
        Traslado abierto (rama por guía)
      </span>
      <span className="flex items-center gap-1.5">
        <span className="size-2.5 rounded-full bg-blue-500" />
        Venta
      </span>
      <span className="flex items-center gap-1.5">
        <span className="size-2.5 rounded-full bg-red-500" />
        Lo devolvió a inventario
      </span>
    </div>
  );
}

function Gutter({ row, lanes }: { row: GraphRow; lanes: number }) {
  const isEvent = row.kind === "event";
  const event = isEvent ? (row as GraphEventRow) : null;
  const bad = event?.event.flag === "bad";
  const sale = event?.event.flag === "sale";
  const moved = event?.event.simulated === "moved";

  return (
    <div
      className="relative shrink-0 self-stretch"
      style={{ width: lanes * LANE_W }}
    >
      {row.segments.map((segment, lane) => {
        const line = laneStyle(lane).line;
        if (!isEvent) {
          return (
            segment.top && (
              <span
                key={lane}
                className={cn("absolute inset-y-0 w-0.5", line)}
                style={{ left: x(lane) - 1 }}
              />
            )
          );
        }
        return (
          <span key={lane}>
            {segment.top && (
              <span
                className={cn("absolute top-0 w-0.5", line)}
                style={{ left: x(lane) - 1, height: DOT_Y }}
              />
            )}
            {segment.bottom && (
              <span
                className={cn("absolute bottom-0 w-0.5", line)}
                style={{ left: x(lane) - 1, top: DOT_Y }}
              />
            )}
          </span>
        );
      })}

      {event && event.branchLane !== null && (
        <span
          className={cn(
            "absolute h-0.5",
            bad
              ? "bg-red-400"
              : moved
                ? "bg-emerald-400"
                : laneStyle(event.branchLane).line,
          )}
          style={{
            left: x(0),
            width: x(event.branchLane) - x(0),
            top: DOT_Y - 1,
          }}
        />
      )}

      {event && (
        <span
          className={cn(
            "absolute size-3.5 rounded-full ring-4 ring-card",
            bad
              ? "bg-red-500"
              : moved
                ? "bg-emerald-500"
                : sale
                ? "bg-blue-500"
                : laneStyle(event.dotLane).dot,
          )}
          style={{ left: x(event.dotLane) - 7, top: DOT_Y - 7 }}
        />
      )}
    </div>
  );
}

function EventContent({
  row,
  pulse,
}: {
  row: GraphEventRow;
  pulse: boolean;
}) {
  const { event } = row;
  const { title, text } = describeEvent(event);
  const bad = event.flag === "bad";
  const sale = event.flag === "sale";
  const moved = event.simulated === "moved";
  const chip = row.guideLane !== null ? laneStyle(row.guideLane).chip : null;

  return (
    <div
      className={cn(
        "space-y-1 rounded-lg px-3 py-2",
        bad && "bg-red-50 dark:bg-red-950/30",
        sale && "bg-blue-50 dark:bg-blue-950/30",
        moved && "bg-emerald-50 dark:bg-emerald-950/30",
        pulse && "animate-pulse ring-2 ring-red-400/70",
      )}
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="text-xs tabular-nums text-muted-foreground">
          {timeOf(event.at)}
        </span>
        <span
          className={cn(
            "text-sm font-semibold",
            bad && "text-red-700 dark:text-red-300",
            sale && "text-blue-700 dark:text-blue-300",
            moved && "text-emerald-700 dark:text-emerald-300",
          )}
        >
          {title}
        </span>
        {chip && row.guide && (
          <span
            className={cn(
              "rounded-md px-1.5 py-0.5 text-[11px] font-medium",
              chip,
            )}
          >
            {row.role === "fork"
              ? "abre traslado"
              : row.role === "merge"
                ? "cierra traslado"
                : "traslado"}{" "}
            {row.guide}
          </span>
        )}
      </div>
      <p className="break-words text-sm leading-relaxed text-muted-foreground">
        {text}
      </p>
      <p className="text-xs tabular-nums text-muted-foreground/70">
        {event.type} · {event.status}
        {event.wh ? ` · ${event.wh}` : ""}
      </p>
    </div>
  );
}

export default function AuditTimeline({
  events,
  pulseIds = [],
}: {
  events: AuditTimelineEvent[];
  pulseIds?: number[];
}) {
  const { rows, lanes } = useMemo(() => buildGraph(events), [events]);

  return (
    <div className="relative pt-1">
      <AnimatePresence initial={false} mode="popLayout">
        {rows.map((row) => (
          <motion.div
            key={row.kind === "day" ? `day-${row.label}` : row.event.id}
            layout="position"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: 48, transition: { duration: 0.35 } }}
            transition={{ type: "spring", stiffness: 140, damping: 22 }}
            className="flex gap-3"
          >
            <Gutter row={row} lanes={lanes} />
            {row.kind === "day" ? (
              <div className="min-w-0 flex-1 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide">
                {row.label}
              </div>
            ) : (
              <div className="min-w-0 flex-1 pb-2">
                <EventContent
                  row={row}
                  pulse={pulseIds.includes(row.event.id)}
                />
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
