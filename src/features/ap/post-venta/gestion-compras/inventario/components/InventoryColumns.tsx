import type { ColumnDef } from "@tanstack/react-table";
import { InventoryResource } from "../lib/inventory.interface";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowRightLeft } from "lucide-react";

export type InventoryColumns = ColumnDef<InventoryResource>;

interface Props {
  onMovements: (id: number, warehouse_id: number) => void;
}

export const inventoryColumns = ({
  onMovements,
}: Props): InventoryColumns[] => [
  {
    accessorKey: "product.code",
    header: "Código",
    enableSorting: false,
  },
  {
    accessorKey: "product.name",
    header: "Producto",
    enableSorting: false,
  },
  {
    accessorKey: "product.brand_name",
    header: "Marca",
    enableSorting: false,
  },
  {
    accessorKey: "product.category_name",
    header: "Categoría",
    enableSorting: false,
  },
  {
    accessorKey: "warehouse.dyn_code",
    header: "Almacén",
    enableSorting: false,
  },
  {
    accessorKey: "quantity",
    header: "Stock Total",
    enableSorting: true,
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return value?.toFixed(2) || "0.00";
    },
  },
  {
    accessorKey: "available_quantity",
    header: "Stock Disponible",
    enableSorting: false,
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return value?.toFixed(2) || "0.00";
    },
  },
  {
    accessorKey: "reserved_quantity",
    header: "Stock Reservado",
    enableSorting: false,
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return value?.toFixed(2) || "0.00";
    },
  },
  {
    accessorKey: "quantity_in_transit",
    header: "En Tránsito",
    enableSorting: false,
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return value?.toFixed(2) || "0.00";
    },
  },
  {
    accessorKey: "quantity_pending_credit_note",
    header: "Pendiente Nota de Crédito",
    enableSorting: false,
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return value?.toFixed(2) || "0.00";
    },
  },
  {
    accessorKey: "minimum_stock",
    header: "Stock Mínimo",
    enableSorting: false,
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return value?.toFixed(2) || "0.00";
    },
  },
  {
    accessorKey: "maximum_stock",
    header: "Stock Máximo",
    enableSorting: false,
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return value?.toFixed(2) || "0.00";
    },
  },
  {
    accessorKey: "stock_status",
    header: "Estado",
    enableSorting: false,
    cell: ({ row }) => {
      const status = row.original.stock_status;
      const isLowStock = row.original.is_low_stock;
      const isOutOfStock = row.original.is_out_of_stock;

      if (isOutOfStock || status === "OUT_OF_STOCK") {
        return (
          <Badge
            variant="destructive"
            className="w-28 flex items-center justify-center"
          >
            Sin Stock
          </Badge>
        );
      }

      if (isLowStock || status === "LOW_STOCK") {
        return (
          <Badge
            variant="secondary"
            className="w-28 flex items-center justify-center bg-yellow-500 text-white hover:bg-yellow-600"
          >
            Stock Bajo
          </Badge>
        );
      }

      return (
        <Badge
          variant="secondary"
          className="w-28 flex items-center justify-center bg-green-500 text-white hover:bg-green-600"
        >
          Normal
        </Badge>
      );
    },
  },
  {
    accessorKey: "last_movement_date",
    header: "Último Movimiento",
    enableSorting: false,
    cell: ({ getValue }) => {
      const date = getValue() as string;
      if (!date) return "-";
      try {
        return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: es });
      } catch {
        return date;
      }
    },
  },
  {
    id: "actions",
    header: "Acciones",
    enableSorting: false,
    cell: ({ row }) => {
      const productId = row.original.product_id;
      const warehouseId = row.original.warehouse_id;

      return (
        <Button
          variant="outline"
          size="icon"
          className="size-7"
          tooltip="Ver Movimientos"
          onClick={() => onMovements?.(productId, warehouseId)}
        >
          <ArrowRightLeft className="size-5" />
        </Button>
      );
    },
  },
];
