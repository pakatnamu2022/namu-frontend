"use client";

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
import {
  ScrumItemResource,
  ScrumItemType,
  ScrumItemPriority,
  ScrumItemStatus,
} from "@/features/gp/tics/pm/scrumItem/lib/scrumItem.interface";

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
}

function ListRow({ item, onItemClick, onFocusInGantt }: ListRowProps) {
  const TypeIcon = TYPE_ICON[item.type] ?? Zap;
  const status = STATUS_CONFIG[item.status];
  const priority = item.priority ? PRIORITY_CONFIG[item.priority as ScrumItemPriority] : null;

  return (
    <tr
      className="group border-b hover:bg-muted/30 cursor-pointer transition-colors"
      onClick={() => onItemClick(item.id)}
    >
      <td className="py-2 px-3">
        <TypeIcon className="size-3.5 text-muted-foreground" title={TYPE_LABEL[item.type]} />
      </td>
      <td className="py-2 px-3 font-medium max-w-xs">
        <span className="line-clamp-1">{item.title}</span>
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
  isLoading: boolean;
  onItemClick: (id: number) => void;
  onFocusInGantt?: (id: number) => void;
}

export function ListView({ items, isLoading, onItemClick, onFocusInGantt }: Props) {
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
          <tr className="border-b bg-muted/40">
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
          {items.map((item) => (
            <ListRow
              key={item.id}
              item={item}
              onItemClick={onItemClick}
              onFocusInGantt={onFocusInGantt}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
