"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
  WorkOrderPlanningResource,
  PLANNING_STATUS_LABELS,
} from "../lib/workOrderPlanning.interface";
import { PLANNING_TYPE_LABELS } from "../lib/workOrderPlanning.constants";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Clock, Calendar, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Eye, Pencil } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";

export type WorkOrderPlanningColumns = ColumnDef<WorkOrderPlanningResource>;

interface PlanningColumnsProps {
  onView?: (planning: WorkOrderPlanningResource) => void;
  onEdit?: (planning: WorkOrderPlanningResource) => void;
  onDelete?: (id: number) => void;
  permissions?: {
    canEdit: boolean;
    canDelete: boolean;
  };
}

export const planningColumns = ({
  onView,
  onEdit,
  onDelete,
  permissions = { canEdit: false, canDelete: false },
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
    accessorKey: "planned_start_datetime",
    header: "Fecha Planificada",
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
          <Clock className="h-4 w-4 text-primary" />
          <span className="font-medium text-primary">
            {hours ? `${hours}h` : "-"}
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
            {hours === null ? "-" : `${hours}h`}
          </span>
        </div>
      );
    },
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

      const variantMap = {
        planned: "blue" as const,
        in_progress: "orange" as const,
        completed: "green" as const,
        canceled: "destructive" as const,
      };

      return (
        <>
          <Badge variant={variantMap[status]}>
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
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView?.(row.original)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {permissions.canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit?.(row.original)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {permissions.canDelete && (
            <DeleteButton onClick={() => onDelete?.(row.original.id)} />
          )}
        </div>
      );
    },
  },
];
