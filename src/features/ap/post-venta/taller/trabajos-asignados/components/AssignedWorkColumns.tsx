"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  WorkOrderPlanningResource,
  PLANNING_STATUS_LABELS,
} from "../../planificacion-orden-trabajo/lib/workOrderPlanning.interface";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  Clock,
  Calendar,
  FileText,
  Eye,
  PlayCircle,
  PauseCircle,
  CheckCircle,
  Pause,
  Play,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AssignedWorkColumnsProps {
  onView?: (planning: WorkOrderPlanningResource) => void;
  onStart?: (planning: WorkOrderPlanningResource) => void;
  onContinue?: (planning: WorkOrderPlanningResource) => void;
  onPause?: (planning: WorkOrderPlanningResource) => void;
  onComplete?: (planning: WorkOrderPlanningResource) => void;
}

export const assignedWorkColumns = ({
  onView,
  onStart,
  onContinue,
  onPause,
  onComplete,
}: AssignedWorkColumnsProps = {}): ColumnDef<WorkOrderPlanningResource>[] => [
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
      <div className="max-w-[400px]">
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
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.original.status;
      const hasActive = row.original.has_active_session;

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
          {status === "in_progress" && hasActive && (
            <Play className="size-5 inline-block ml-2" />
          )}
          {status === "in_progress" && !hasActive && (
            <Pause className="size-5 inline-block ml-2" />
          )}
        </>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const planning = row.original;
      const status = planning.status;
      const hasActive = row.original.has_active_session;

      // Verificar si hay sesiones pausadas
      const hasPausedSession =
        planning.sessions &&
        planning.sessions.length > 0 &&
        planning.sessions.some((session) => session.status === "paused");

      // Lógica de estados según requerimientos
      const showStart = status === "planned" && !hasPausedSession;
      const showContinue =
        hasPausedSession && status === "in_progress" && !hasActive;
      const showPauseAndComplete =
        status === "in_progress" && planning.has_active_session;

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView?.(planning)}
          >
            <Eye className="h-4 w-4" />
          </Button>

          {(showStart || showContinue || showPauseAndComplete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {showStart && (
                  <DropdownMenuItem onClick={() => onStart?.(planning)}>
                    <PlayCircle className="h-4 w-4 mr-2 text-green-600" />
                    Iniciar
                  </DropdownMenuItem>
                )}
                {showContinue && (
                  <DropdownMenuItem onClick={() => onContinue?.(planning)}>
                    <PlayCircle className="h-4 w-4 mr-2 text-primary" />
                    Continuar
                  </DropdownMenuItem>
                )}
                {showPauseAndComplete && (
                  <>
                    <DropdownMenuItem onClick={() => onPause?.(planning)}>
                      <PauseCircle className="h-4 w-4 mr-2 text-yellow-600" />
                      Pausar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onComplete?.(planning)}>
                      <CheckCircle className="h-4 w-4 mr-2 text-primary" />
                      Completar
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      );
    },
  },
];
