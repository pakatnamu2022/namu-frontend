import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Calendar, Settings, StickyNote } from "lucide-react";
import { WorkOrderResource } from "../lib/workOrder.interface";
import { Badge } from "@/components/ui/badge";
import { CopyCell } from "@/shared/components/CopyCell";
import { formatDate } from "@/core/core.function";
import { WORK_ORDER_STATUS_COLORS } from "../lib/workOrder.constants";

export type WorkOrderColumns = ColumnDef<WorkOrderResource>;

interface Props {
  onManage: (id: number) => void;
  permissions: {
    canReceive: boolean;
    canManage: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export const workOrderReceptionColumns = ({
  onManage,
  permissions,
}: Props): WorkOrderColumns[] => [
  {
    accessorKey: "correlative",
    header: "Correlativo",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <CopyCell className="font-semibold" value={value} />;
    },
  },
  {
    id: "plate_mileage",
    header: "Placa",
    cell: ({ row }) => {
      const plate = row.original.vehicle_plate;
      const mileage = row.original.mileage;
      return (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium">{plate || "-"}</span>
          <span className="text-xs text-muted-foreground">
            {mileage ? `${mileage} km` : "-"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "vehicle_vin",
    header: "VIN",
  },
  {
    id: "dates",
    header: "Fechas",
    cell: ({ row }) => {
      const opening = row.original.opening_date;
      const estimated = row.original.estimated_delivery_date;
      const fmt = (v: string) => {
        try {
          return formatDate(v);
        } catch {
          return v;
        }
      };
      return (
        <div className="flex flex-col gap-0.5 text-xs">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Apertura:</span>
            {opening ? fmt(opening) : "-"}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Est. Entrega:</span>
            {estimated ? fmt(estimated) : "-"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "actual_delivery_date",
    header: "Fecha Real Entrega",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      if (!value) return "-";
      try {
        return formatDate(value);
      } catch {
        return value;
      }
    },
  },
  {
    id: "guarantee_recall",
    header: "Garantía / Recall",
    cell: ({ row }) => {
      const isGuarantee = row.original.is_guarantee;
      const isRecall = row.original.is_recall;
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground w-14">Garantía:</span>
            <Badge variant="outline" color={isGuarantee ? "green" : "gray"}>
              {isGuarantee ? "Sí" : "No"}
            </Badge>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground w-14">Recall:</span>
            <Badge variant="outline" color={isRecall ? "green" : "gray"}>
              {isRecall ? "Sí" : "No"}
            </Badge>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "is_invoiced",
    header: "Facturado",
    cell: ({ getValue }) => {
      const value = getValue() as boolean;
      return (
        <Badge color={value ? "default" : "secondary"}>
          {value ? "Sí" : "No"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "created_by_name",
    header: "Creado Por",
  },
  {
    accessorKey: "delivery_by_name",
    header: "Entregado Por",
  },
  {
    accessorKey: "status.description",
    header: "Estado",
    cell: ({ getValue, row }) => {
      const description = getValue() as string;
      const internalNote = row.original.internal_note;
      const color = WORK_ORDER_STATUS_COLORS[row.original.status.id] ?? "gray";
      return (
        <div className="flex flex-col gap-1">
          <Badge variant="outline" color={color}>
            {description}
          </Badge>
          {internalNote && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-medium pl-1">
              <StickyNote className="size-3" />
              {internalNote.number}
            </span>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const { id } = row.original;

      return (
        <div className="flex items-center gap-2">
          {permissions.canManage && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              tooltip="Gestionar"
              onClick={() => onManage(id)}
            >
              <Settings className="size-5" />
            </Button>
          )}
        </div>
      );
    },
  },
];
