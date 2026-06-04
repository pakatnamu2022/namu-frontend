"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge, BadgeColor } from "@/components/ui/badge";
import {
  WorkOrderPlanningResource,
  PLANNING_STATUS_LABELS,
  PLANNING_STATUS_COLORS,
} from "../lib/workOrderPlanning.interface";
import { PLANNING_TYPE_LABELS } from "../lib/workOrderPlanning.constants";
import { Clock, User, FileText, Ban, Play, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, ShieldCheck } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { ElapsedTimer } from "./ElapsedTimer";
import { formatDateTime, formatHours } from "@/core/core.function";

export type WorkOrderPlanningColumns = ColumnDef<WorkOrderPlanningResource>;

interface PlanningColumnsProps {
  onView?: (planning: WorkOrderPlanningResource) => void;
  onEdit?: (planning: WorkOrderPlanningResource) => void;
  onDelete?: (id: number) => void;
  onSupervisorComplete?: (planning: WorkOrderPlanningResource) => void;
  onCancel?: (planning: WorkOrderPlanningResource) => void;
  permissions?: {
    canUpdate: boolean;
    canDelete: boolean;
    canAnnul: boolean;
    canCompletePlannedWork: boolean;
  };
}

export const planningColumns = ({
  onView,
  onEdit,
  onDelete,
  onSupervisorComplete,
  onCancel,
  permissions = {
    canUpdate: false,
    canDelete: false,
    canAnnul: false,
    canCompletePlannedWork: false,
  },
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
    id: "planned_range",
    header: "Planificación",
    cell: ({ row }) => {
      const startDatetime = row.original.planned_start_datetime;
      const endDatetime = row.original.planned_end_datetime;

      if (!startDatetime && !endDatetime) {
        return <span className="text-muted-foreground">-</span>;
      }

      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Play className="h-4 w-4 text-emerald-600" />
            <span className="text-sm">
              {startDatetime ? formatDateTime(startDatetime) : "-"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Flag className="h-4 w-4 text-rose-600" />
            <span className="text-sm">
              {endDatetime ? formatDateTime(endDatetime) : "-"}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "estimated_hours",
    header: "Hrs Programadas",
    cell: ({ row }) => {
      const hours = row.original.estimated_hours;
      return (
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4 text-primary" />
          <span className="font-medium text-primary">
            {hours ? `${formatHours(hours)}` : "-"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "actual_hours",
    header: "Hrs Trabajadas",
    cell: ({ row }) => {
      const hours = row.original.actual_hours;
      const estimated = row.original.estimated_hours;
      const isOvertime = estimated && hours > estimated;

      if (hours == null) {
        return <span className="text-muted-foreground">-</span>;
      }

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
            {hours === null ? "-" : `${formatHours(hours)}`}
          </span>
        </div>
      );
    },
  },
  {
    id: "elapsed_time",
    header: "Tiempo Transcurrido",
    cell: ({ row }) => <ElapsedTimer planning={row.original} />,
  },
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ row }) => {
      const type = row.original.type;
      return (
        <span className="text-sm">
          {type ? PLANNING_TYPE_LABELS[type] || type : "-"}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.original.status;

      const colors = PLANNING_STATUS_COLORS[status];

      return (
        <>
          <Badge color={colors.color as BadgeColor}>
            {PLANNING_STATUS_LABELS[status]}
          </Badge>
        </>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const visibleEdit =
        permissions.canUpdate && row.original.status === "planned";
      const visibleDelete =
        permissions.canDelete && row.original.status === "planned";
      const visibleCancel =
        permissions.canAnnul &&
        row.original.status !== "canceled" &&
        row.original.status !== "planned";
      const visibleSupervisorComplete =
        permissions.canCompletePlannedWork &&
        row.original.status === "in_progress";

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onView?.(row.original)}
            tooltip="Ver detalles"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {visibleEdit && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => onEdit?.(row.original)}
              tooltip="Editar planificación"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {visibleSupervisorComplete && (
            <Button
              variant="outline"
              size="icon"
              color="orange"
              onClick={() => onSupervisorComplete?.(row.original)}
              tooltip="Marcar como completada por supervisor"
            >
              <ShieldCheck className="h-4 w-4" />
            </Button>
          )}
          {visibleDelete && (
            <DeleteButton onClick={() => onDelete?.(row.original.id)} />
          )}
          {visibleCancel && (
            <Button
              variant="outline"
              size="icon"
              color="red"
              onClick={() => onCancel?.(row.original)}
              tooltip="Cancelar planificación"
            >
              <Ban className="h-4 w-4" />
            </Button>
          )}
        </div>
      );
    },
  },
];
