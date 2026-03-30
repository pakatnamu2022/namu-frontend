import type { ColumnDef } from "@tanstack/react-table";
import { WorkOrderResource } from "../lib/workOrder.interface";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { StickyNote } from "lucide-react";
import { WorkOrderActionCell } from "./WorkOrderActionCell";
import { WorkOrderItemResource } from "../../orden-trabajo-item/lib/workOrderItem.interface";
import { WORK_ORDER_STATUS_COLORS } from "../lib/workOrder.constants";

export type WorkOrderColumns = ColumnDef<WorkOrderResource>;

interface Props {
  onInternalNote: (id: number) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number) => void;
  onManage: (id: number) => void;
  onInspect: (id: number) => void;
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
  permissions,
}: Props): WorkOrderColumns[] => [
  {
    accessorKey: "correlative",
    header: "Correlativo",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="font-semibold">{value}</p>;
    },
  },
  {
    accessorKey: "vehicle_plate",
    header: "Placa",
  },
  {
    accessorKey: "vehicle_vin",
    header: "VIN",
  },
  {
    accessorKey: "mileage",
    header: "Kilometraje",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value ? `${value} km` : "-";
    },
  },
  {
    accessorKey: "fuel_level",
    header: "Nivel de Combustible",
  },
  {
    accessorKey: "opening_date",
    header: "Fecha de Apertura",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      if (!value) return "-";
      try {
        const date = new Date(value.replace(" ", "T"));
        return format(date, "dd/MM/yyyy", { locale: es });
      } catch {
        return value;
      }
    },
  },
  {
    accessorKey: "estimated_delivery_date",
    header: "Fecha Est. Entrega",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      if (!value) return "-";
      try {
        const date = new Date(value.replace(" ", "T"));
        return format(date, "dd/MM/yyyy", { locale: es });
      } catch {
        return value;
      }
    },
  },
  {
    accessorKey: "actual_delivery_date",
    header: "Fecha Real Entrega",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      if (!value) return "-";
      try {
        const date = new Date(value.replace(" ", "T"));
        return format(date, "dd/MM/yyyy", { locale: es });
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
      const type_planning = items[0]?.type_planning.description || "-";
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
    accessorKey: "is_guarantee",
    header: "Garantía",
    cell: ({ getValue }) => {
      const value = getValue() as boolean;
      return (
        <Badge variant="outline" color={value ? "green" : "blue"}>
          {value ? "Sí" : "No"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "is_recall",
    header: "Recall",
    cell: ({ getValue }) => {
      const value = getValue() as boolean;
      return (
        <Badge variant="outline" color={value ? "green" : "blue"}>
          {value ? "Sí" : "No"}
        </Badge>
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
    accessorKey: "delivery_by_name",
    header: "Entregado Por",
  },
  {
    accessorKey: "status.description",
    header: "Estado",
    cell: ({ getValue, row }) => {
      const description = getValue() as string;
      const internalNote = row.original.internal_note;
      const color = WORK_ORDER_STATUS_COLORS[description] ?? "gray";
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
      />
    ),
  },
];
