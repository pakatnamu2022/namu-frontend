"use client";

import { Fragment, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Bug,
  Minus,
  Zap,
  Calendar,
  Clock,
  Crosshair,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ScrumItemResource,
  ScrumItemType,
  ScrumItemPriority,
  ScrumItemStatus,
} from "@/features/gp/tics/pm/scrumItem/lib/scrumItem.interface";
import { ScrumSprintResource } from "@/features/gp/tics/pm/scrumSprint/lib/scrumSprint.interface";

const TYPE_ICON: Record<ScrumItemType, React.FC<any>> = {
  tarea: Zap,
  historia: Zap,
  funcion: Zap,
  solicitud: AlertTriangle,
  error: Bug,
};

const TYPE_LABEL: Record<ScrumItemType, string> = {
  tarea: "Tarea",
  historia: "Historia",
  funcion: "Función",
  solicitud: "Solicitud",
  error: "Error",
};

const STATUS_CONFIG: Record<ScrumItemStatus, { label: string; className: string }> = {
  backlog: { label: "Backlog", className: "bg-slate-100 text-slate-700" },
  por_hacer: { label: "Por hacer", className: "bg-blue-100 text-blue-700" },
  en_progreso: { label: "En progreso", className: "bg-amber-100 text-amber-700" },
  en_revision: { label: "En revisión", className: "bg-purple-100 text-purple-700" },
  hecho: { label: "Hecho", className: "bg-emerald-100 text-emerald-700" },
};

const PRIORITY_CONFIG: Record<ScrumItemPriority, { Icon: React.FC<any>; className: string }> = {
  alta: { Icon: ArrowUp, className: "text-red-500" },
  media: { Icon: Minus, className: "text-amber-500" },
  baja: { Icon: ArrowDown, className: "text-blue-400" },
};

interface ListRowProps {
  item: ScrumItemResource;
  onItemClick: (id: number) => void;
  onFocusInGantt?: (id: number) => void;
  emphasized?: boolean;
  indented?: boolean;
}

function ListRow({ item, onItemClick, onFocusInGantt, emphasized, indented }: ListRowProps) {
  const TypeIcon = TYPE_ICON[item.type] ?? Zap;
  const status = STATUS_CONFIG[item.status];
  const priority = item.priority ? PRIORITY_CONFIG[item.priority as ScrumItemPriority] : null;

  return (
    <tr
      className={cn(
        "group border-b hover:bg-muted/30 cursor-pointer transition-colors",
        emphasized && "bg-muted/20",
      )}
      onClick={() => onItemClick(item.id)}
      data-scrum-item
    >
      <td className={cn("py-2 px-3", indented && "pl-8")}>
        <TypeIcon className="size-3.5 text-muted-foreground" title={TYPE_LABEL[item.type]} />
      </td>
      <td className={cn("py-2 px-3 max-w-xs", emphasized ? "font-semibold" : "font-medium")}>
        <div className="flex items-center gap-1.5">
          <span className="line-clamp-1">{item.title}</span>
          {item.tags?.map((tag) => (
            <Badge key={tag.id} size="xxs" variant="default" color={tag.color} className="shrink-0">
              {tag.name}
            </Badge>
          ))}
        </div>
      </td>
      <td className="py-2 px-3">
        <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", status.className)}>
          {status.label}
        </span>
      </td>
      <td className="py-2 px-3">
        {priority && (
          <div className={cn("flex items-center gap-1", priority.className)}>
            <priority.Icon className="size-3.5" />
            <span className="text-xs capitalize">{item.priority}</span>
          </div>
        )}
      </td>
      <td className="py-2 px-3 text-muted-foreground">
        {item.story_points ?? <span className="text-xs">—</span>}
      </td>
      <td className="py-2 px-3 text-muted-foreground text-xs truncate max-w-36">
        {item.assignee?.name ?? "—"}
      </td>
      <td className="py-2 px-3 text-muted-foreground text-xs">
        {item.due_date ? (
          <div className="flex items-center gap-1">
            <Calendar className="size-3" />
            {item.due_date}
          </div>
        ) : "—"}
      </td>
      <td className="py-2 px-3 text-muted-foreground text-xs">
        {item.estimated_hours ? (
          <div className="flex items-center gap-1">
            <Clock className="size-3" />
            {item.estimated_hours}h
          </div>
        ) : "—"}
      </td>
      {onFocusInGantt && (
        <td className="py-2 px-2">
          <Button
            variant="ghost"
            size="icon"
            className="size-6 opacity-0 group-hover:opacity-100"
            title="Ver en Gantt"
            onClick={(e) => { e.stopPropagation(); onFocusInGantt(item.id); }}
          >
            <Crosshair className="size-3.5" />
          </Button>
        </td>
      )}
    </tr>
  );
}

interface Props {
  items: ScrumItemResource[];
  sprints: ScrumSprintResource[];
  isLoading: boolean;
  onItemClick: (id: number) => void;
  onFocusInGantt?: (id: number) => void;
}

const NO_SPRINT = "sin_sprint" as const;
const NO_HISTORIA = "sin_historia" as const;

export function ListView({ items, sprints, isLoading, onItemClick, onFocusInGantt }: Props) {
  const groups = useMemo(() => {
    const itemsById = new Map(items.map((i) => [i.id, i]));

    const bySprint = new Map<number | typeof NO_SPRINT, ScrumItemResource[]>();
    for (const item of items) {
      const key = item.sprint_id ?? NO_SPRINT;
      if (!bySprint.has(key)) bySprint.set(key, []);
      bySprint.get(key)!.push(item);
    }

    const sortedSprints = [...sprints].sort((a, b) =>
      (a.start_date ?? "").localeCompare(b.start_date ?? ""),
    );
    const sprintKeys: (number | typeof NO_SPRINT)[] = [
      ...sortedSprints.map((s) => s.id).filter((id) => bySprint.has(id)),
      ...(bySprint.has(NO_SPRINT) ? [NO_SPRINT] : []),
    ];

    return sprintKeys.map((sprintKey) => {
      const sprintItems = bySprint.get(sprintKey)!;
      const sprintName =
        sprintKey === NO_SPRINT
          ? "Sin sprint / Backlog"
          : (sortedSprints.find((s) => s.id === sprintKey)?.name ?? `Sprint ${sprintKey}`);

      const byHistoria = new Map<number | typeof NO_HISTORIA, ScrumItemResource[]>();
      for (const item of sprintItems) {
        const historiaKey = item.type === "historia" ? item.id : (item.parent_id ?? NO_HISTORIA);
        if (!byHistoria.has(historiaKey)) byHistoria.set(historiaKey, []);
        byHistoria.get(historiaKey)!.push(item);
      }

      const historiaGroups = [...byHistoria.entries()]
        .map(([key, groupItems]) => {
          const historia = key !== NO_HISTORIA ? itemsById.get(key) : undefined;
          const rows = groupItems
            .filter((i) => i.id !== historia?.id)
            .sort((a, b) => a.order - b.order);
          const order = historia?.order ?? Math.min(...groupItems.map((i) => i.order));
          return { key, historia, rows, order };
        })
        .sort((a, b) => a.order - b.order);

      return { sprintKey, sprintName, count: sprintItems.length, historiaGroups };
    });
  }, [items, sprints]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        No hay items para mostrar
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/40 sticky top-0 z-10">
            <th className="text-left py-2 px-3 font-medium text-muted-foreground w-8"></th>
            <th className="text-left py-2 px-3 font-medium text-muted-foreground">Título</th>
            <th className="text-left py-2 px-3 font-medium text-muted-foreground w-32">Estado</th>
            <th className="text-left py-2 px-3 font-medium text-muted-foreground w-24">Prioridad</th>
            <th className="text-left py-2 px-3 font-medium text-muted-foreground w-16">Pts</th>
            <th className="text-left py-2 px-3 font-medium text-muted-foreground w-36">Asignado</th>
            <th className="text-left py-2 px-3 font-medium text-muted-foreground w-28">Vence</th>
            <th className="text-left py-2 px-3 font-medium text-muted-foreground w-20">Horas</th>
            {onFocusInGantt && <th className="w-8" />}
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <Fragment key={group.sprintKey}>
              <tr className="bg-muted/60">
                <td
                  colSpan={onFocusInGantt ? 9 : 8}
                  className="py-1.5 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                >
                  {group.sprintName}{" "}
                  <span className="font-normal normal-case text-muted-foreground/70">
                    · {group.count} item{group.count === 1 ? "" : "s"}
                  </span>
                </td>
              </tr>
              {group.historiaGroups.map(({ key, historia, rows }) => (
                <Fragment key={key}>
                  {historia && (
                    <ListRow
                      item={historia}
                      onItemClick={onItemClick}
                      onFocusInGantt={onFocusInGantt}
                      emphasized
                    />
                  )}
                  {rows.map((item) => (
                    <ListRow
                      key={item.id}
                      item={item}
                      onItemClick={onItemClick}
                      onFocusInGantt={onFocusInGantt}
                      indented={!!historia}
                    />
                  ))}
                </Fragment>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
