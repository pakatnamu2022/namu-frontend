import type { ColumnDef } from "@tanstack/react-table";
import { WorkOrderResource } from "../lib/workOrder.interface";
import { Badge } from "@/components/ui/badge";
import { StickyNote } from "lucide-react";
import { WorkOrderActionCell } from "./WorkOrderActionCell";
import { WorkOrderItemResource } from "../../orden-trabajo-item/lib/workOrderItem.interface";
import { WORK_ORDER_STATUS_COLORS } from "../lib/workOrder.constants";
import { formatDate } from "@/core/core.function";
import { Calendar } from "lucide-react";
import { CopyCell } from "@/shared/components/CopyCell";

export type WorkOrderColumns = ColumnDef<WorkOrderResource>;

interface Props {
  onInternalNote: (id: number) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number) => void;
  onManage: (id: number) => void;
  onInspect: (id: number) => void;
  onCancel: (id: number) => void;
  permissions: {
    canReceive: boolean;
    canManage: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export const workOrderColumns = ({
  onInternalNote,
  onDelete,
  onUpdate,
  onManage,
  onInspect,
  onCancel,
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
    accessorKey: "type_currency.name",
    header: "Moneda",
  },
  {
    accessorKey: "final_amount",
    header: "Total Monto",
    cell: ({ getValue, row }) => {
      const amount = getValue() as number;
      const currencySymbol = row.original.type_currency?.symbol || "S/.";
      return `${currencySymbol} ${Number(amount || 0).toFixed(2)}`;
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
    id: "type_planning",
    accessorKey: "items",
    header: "Tipo de Planificación",
    cell: ({ getValue }) => {
      const items = getValue() as WorkOrderItemResource[];
      const type_planning = items[0]?.type_planning?.description || "-";
      return type_planning;
    },
  },
  {
    id: "type_operation",
    accessorKey: "items",
    header: "Tipo de Operación",
    cell: ({ getValue }) => {
      const items = getValue() as WorkOrderItemResource[];
      const type_operation = items[0]?.type_operation_name || "-";
      return type_operation;
    },
  },
  {
    id: "items_description",
    accessorKey: "items",
    header: "Descripción",
    cell: ({ getValue }) => {
      const items = getValue() as WorkOrderItemResource[];
      const description_work = items[0]?.description || "-";
      return description_work;
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
    accessorKey: "has_management_discount",
    header: "Dcto. Gerencial",
    cell: ({ getValue }) => {
      const value = getValue() as boolean;
      return (
        <Badge
          variant="outline"
          color={value ? "green" : "gray"}
          className="capitalize w-8 flex items-center justify-center"
        >
          {value ? "Sí" : "No"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "is_invoiced",
    header: "Facturado",
    cell: ({ getValue }) => {
      const value = getValue() as boolean;
      return (
        <Badge variant="outline" color={value ? "green" : "gray"}>
          {value ? "Sí" : "No"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "is_delivery",
    header: "Entregado",
    cell: ({ getValue }) => {
      const value = getValue() as boolean;
      return (
        <Badge variant="outline" color={value ? "green" : "gray"}>
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
    cell: ({ row }) => (
      <WorkOrderActionCell
        row={row.original}
        permissions={permissions}
        onInternalNote={onInternalNote}
        onDelete={onDelete}
        onUpdate={onUpdate}
        onManage={onManage}
        onInspect={onInspect}
        onCancel={onCancel}
      />
    ),
  },
];
