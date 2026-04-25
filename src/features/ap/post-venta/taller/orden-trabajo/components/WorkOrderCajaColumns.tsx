import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {  StickyNote, Receipt } from "lucide-react";
import { WorkOrderResource } from "../lib/workOrder.interface";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { WORK_ORDER_STATUS_COLORS } from "../lib/workOrder.constants";
import { WorkOrderItemResource } from "../../orden-trabajo-item/lib/workOrderItem.interface";

export type WorkOrderColumns = ColumnDef<WorkOrderResource>;

interface Props {
  onBill?: (id: number) => void;
  permissions: {
    canReceive: boolean;
    canManage: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    canBill?: boolean;
  };
  showCheckbox?: boolean;
  showActions?: boolean;
}

export const workOrderCajaColumns = ({
  onBill,
  permissions,
  showCheckbox = false,
  showActions = true,
}: Props): WorkOrderColumns[] => [
  ...(showCheckbox
    ? ([
        {
          id: "select",
          header: ({ table }) => (
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
              }
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(!!value)
              }
              aria-label="Seleccionar todos"
            />
          ),
          cell: ({ row }) => (
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Seleccionar fila"
            />
          ),
          enableSorting: false,
          enableHiding: false,
        },
      ] as WorkOrderColumns[])
    : []),
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
  ...(showActions
    ? ([
        {
          id: "actions",
          header: "Acciones",
          cell: ({ row }) => {
            const { id } = row.original;

            return (
              <div className="flex items-center gap-2">
                {permissions.canBill && onBill && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-7"
                    tooltip="Facturar"
                    onClick={() => onBill(id)}
                  >
                    <Receipt className="size-5" />
                  </Button>
                )}
              </div>
            );
          },
        },
      ] as WorkOrderColumns[])
    : []),
];
