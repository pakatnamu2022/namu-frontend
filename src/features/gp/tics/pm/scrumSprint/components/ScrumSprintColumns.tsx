"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ScrumSprintResource } from "../lib/scrumSprint.interface";
import { Badge, BadgeColor } from "@/components/ui/badge";
import { Clock, LucideIcon, Pencil, Play, XCircle, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { SCRUM_SPRINT } from "../lib/scrumSprint.constants";
import { ButtonAction } from "@/shared/components/ButtonAction";

const STATUS_BADGE: Record<
  string,
  { label: string; color: BadgeColor; icon: LucideIcon }
> = {
  planeado: { label: "Planeado", color: "blue", icon: Clock },
  activo: { label: "Activo", color: "emerald", icon: Play },
  cerrado: { label: "Cerrado", color: "gray", icon: XCircle },
};

export type ScrumSprintColumns = ColumnDef<ScrumSprintResource>;

export const scrumSprintColumns = ({
  onDelete,
  onActivate,
  onClose,
}: {
  onDelete: (id: number) => void;
  onActivate: (id: number) => void;
  onClose: (id: number) => void;
}): ScrumSprintColumns[] => [
  {
    accessorKey: "name",
    header: "Sprint",
    cell: ({ getValue }) => (
      <span className="font-semibold flex items-center gap-2">
        <Zap className="size-4 text-amber-500" />
        {getValue() as string}
      </span>
    ),
  },
  {
    id: "project",
    header: "Proyecto",
    cell: ({ row }) => {
      const { project } = row.original;
      if (!project) return "-";
      return (
        <div className="flex items-center gap-2">
          {project.color && (
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: project.color }}
            />
          )}
          <span>{project.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      const cfg = STATUS_BADGE[value] ?? STATUS_BADGE.planeado;
      const Icon = cfg.icon;
      return (
        <Badge
          variant="outline"
          className={`gap-2 capitalize`}
          color={cfg.color}
          icon={Icon}
        >
          {cfg.label}
        </Badge>
      );
    },
  },
  {
    id: "progress",
    header: "Progreso",
    cell: ({ row }) => {
      const { items_count, done_count, completion_percentage } = row.original;
      const pct =
        completion_percentage ??
        (items_count > 0 ? Math.round((done_count / items_count) * 100) : 0);
      return (
        <div className="flex items-center gap-2 min-w-20">
          <div className="flex-1 bg-muted rounded-full h-1.5">
            <div
              className="bg-primary h-1.5 rounded-full"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{pct}%</span>
        </div>
      );
    },
  },
  {
    accessorKey: "start_date",
    header: "Inicio",
    cell: ({ getValue }) => (getValue() as string | undefined) ?? "-",
  },
  {
    accessorKey: "end_date",
    header: "Fin",
    cell: ({ getValue }) => (getValue() as string | undefined) ?? "-",
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const router = useNavigate();
      const { ROUTE_UPDATE } = SCRUM_SPRINT;
      const { id, status } = row.original;
      return (
        <div className="flex items-center gap-1">
          <ButtonAction
            icon={Pencil}
            onClick={() => router(`${ROUTE_UPDATE}/${id}`)}
          />
          {status === "planeado" && (
            <ButtonAction
              icon={Play}
              onClick={() => onActivate(id)}
              title="Activar"
              className="text-emerald-600"
            />
          )}
          {status === "activo" && (
            <ButtonAction
              icon={XCircle}
              onClick={() => onClose(id)}
              title="Cerrar"
              className="text-gray-500"
            />
          )}
          <DeleteButton onClick={() => onDelete(id)} />
        </div>
      );
    },
  },
];
