"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
  WorkOrderPlanningResource,
  PLANNING_STATUS_LABELS,
  PLANNING_STATUS_COLORS,
} from "../lib/workOrderPlanning.interface";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Clock, Calendar, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

export type WorkOrderPlanningColumns = ColumnDef<WorkOrderPlanningResource>;

interface PlanningColumnsProps {
  onView?: (planning: WorkOrderPlanningResource) => void;
}

export const planningColumns = ({
  onView,
}: PlanningColumnsProps = {}): ColumnDef<WorkOrderPlanningResource>[] => [
  {
    accessorKey: "work_order_correlative",
    header: "Orden de Trabajo",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">
          {row.original.work_order_correlative}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "worker_name",
    header: "Trabajador",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-muted-foreground" />
        <span>{row.original.worker_name}</span>
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: "Descripción",
    cell: ({ row }) => (
      <div className="max-w-[300px]">
        <p className="truncate" title={row.original.description}>
          {row.original.description}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.original.status;
      const colors = PLANNING_STATUS_COLORS[status];
      return (
        <Badge
          className={`${colors.bg} ${colors.text} border ${colors.border}`}
          variant="outline"
        >
          {PLANNING_STATUS_LABELS[status]}
        </Badge>
      );
    },
  },
  {
    accessorKey: "planned_start_datetime",
    header: "Inicio Planificado",
    cell: ({ row }) => {
      const datetime = row.original.planned_start_datetime;
      if (!datetime) return <span className="text-muted-foreground">-</span>;
      return (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {format(parseISO(datetime), "dd/MM/yyyy HH:mm", { locale: es })}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "estimated_hours",
    header: "Hrs Est.",
    cell: ({ row }) => {
      const hours = row.original.estimated_hours;
      return (
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-blue-600">
            {hours ? `${hours}h` : "-"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "actual_hours",
    header: "Hrs Reales",
    cell: ({ row }) => {
      const hours = row.original.actual_hours;
      const estimated = row.original.estimated_hours;
      const isOvertime = estimated && hours > estimated;
      return (
        <div className="flex items-center gap-1">
          <Clock
            className={`h-4 w-4 ${
              isOvertime ? "text-red-600" : "text-green-600"
            }`}
          />
          <span
            className={`font-medium ${
              isOvertime ? "text-red-600" : "text-green-600"
            }`}
          >
            {hours === null ? "-" : `${hours}h`}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "sessions_count",
    header: "Sesiones",
    cell: ({ row }) => (
      <div className="text-center">
        <Badge variant="secondary">{row.original.sessions_count}</Badge>
      </div>
    ),
  },
  {
    accessorKey: "has_active_session",
    header: "Estado Actual",
    cell: ({ row }) => {
      const hasActive = row.original.has_active_session;
      return hasActive ? (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
          En Curso
        </Badge>
      ) : (
        <Badge variant="outline" className="text-muted-foreground">
          Pausado
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onView?.(row.original)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      );
    },
  },
];
