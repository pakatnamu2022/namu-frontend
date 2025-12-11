import type { ColumnDef } from "@tanstack/react-table";
import { InventoryMovementResource } from "../lib/inventoryMovements.interface";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { translateMovementType } from "../lib/inventory.constants";
import { ArrowDown, ArrowUp } from "lucide-react";
import InventoryMovementActions from "./InventoryMovementActions";

export type InventoryMovementColumns = ColumnDef<InventoryMovementResource>;

export const inventoryMovementsColumns = (): InventoryMovementColumns[] => [
  {
    accessorKey: "movement_date",
    header: "Fecha",
    cell: ({ row, getValue }) => {
      const date = getValue() as string;
      const isInbound = row.original.is_inbound;
      const isOutbound = row.original.is_outbound;

      if (!date) return "-";

      try {
        const formattedDate = format(new Date(date), "dd/MM/yyyy", {
          locale: es,
        });

        if (isInbound) {
          return (
            <div className="flex items-center gap-1 text-green-600">
              <ArrowUp className="h-4 w-4" />
              <span>{formattedDate}</span>
            </div>
          );
        }

        if (isOutbound) {
          return (
            <div className="flex items-center gap-1 text-red-600">
              <ArrowDown className="h-4 w-4" />
              <span>{formattedDate}</span>
            </div>
          );
        }

        return formattedDate;
      } catch {
        return date;
      }
    },
  },
  {
    accessorKey: "movement_type",
    header: "Tipo de Movimiento",
    cell: ({ getValue }) => {
      const type = getValue() as string;
      return (
        <Badge variant="outline" className="whitespace-nowrap">
          {translateMovementType(type)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "movement_number",
    header: "N° Movimiento",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value || "-";
    },
  },
  {
    accessorKey: "warehouse_origin",
    header: "Almacén Origen",
    cell: ({ row }) => {
      const warehouseOrigin = row.original.warehouse_origin;

      if (!warehouseOrigin) return "-";

      if (typeof warehouseOrigin === "object") {
        return (
          <div className="flex flex-col">
            <span>{warehouseOrigin.description}</span>
            {warehouseOrigin.dyn_code && (
              <span className="text-xs text-gray-500">
                {warehouseOrigin.dyn_code}
              </span>
            )}
          </div>
        );
      }

      return warehouseOrigin;
    },
  },
  {
    accessorKey: "warehouse_destination",
    header: "Almacén Destino",
    cell: ({ row }) => {
      const warehouseDestination = row.original.warehouse_destination;

      if (!warehouseDestination) return "-";

      if (typeof warehouseDestination === "object") {
        return (
          <div className="flex flex-col">
            <span>{warehouseDestination.description}</span>
            {warehouseDestination.dyn_code && (
              <span className="text-xs text-gray-500">
                {warehouseDestination.dyn_code}
              </span>
            )}
          </div>
        );
      }

      return warehouseDestination;
    },
  },
  {
    accessorKey: "user_name",
    header: "Usuario",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value || "-";
    },
  },
  {
    accessorKey: "notes",
    header: "Observaciones",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      if (!value) return "-";
      return (
        <span className="text-sm text-muted-foreground truncate max-w-xs block">
          {value}
        </span>
      );
    },
  },
  {
    accessorKey: "quantity_in",
    header: "Cant. Ingresada",
  },
  {
    accessorKey: "quantity_out",
    header: "Cant. Salida",
  },
  {
    accessorKey: "balance",
    header: "Saldo",
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const movement = row.original;
      return <InventoryMovementActions movement={movement} />;
    },
  },
];
