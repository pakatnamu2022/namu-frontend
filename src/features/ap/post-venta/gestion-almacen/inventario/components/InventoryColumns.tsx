import type { ColumnDef } from "@tanstack/react-table";
import { InventoryResource } from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventory.interface.ts";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { ArrowRightLeft, History, Lock, Pencil } from "lucide-react";
import { CopyCell } from "@/shared/components/CopyCell";
import { formatDateTime, formatMoney } from "@/core/core.function";
import { STOCK_STATUS_CONFIG } from "@/features/ap/post-venta/gestion-almacen/productos/lib/product.constants.ts";

export type InventoryColumns = ColumnDef<InventoryResource>;

interface Props {
  onUpdateStockMinMax: (row: InventoryResource) => void;
  onMovements: (id: number, warehouse_id: number) => void;
  onPurchaseHistory: (id: number, warehouse_id: number) => void;
  onReservedStock: (id: number, warehouse_id: number) => void;
}

export const inventoryColumns = ({
  onUpdateStockMinMax,
  onMovements,
  onPurchaseHistory,
  onReservedStock,
}: Props): InventoryColumns[] => [
  {
    accessorKey: "product.code",
    header: "Cód.",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value ? (
        <CopyCell value={value} className="font-semibold" />
      ) : null;
    },
  },
  {
    accessorKey: "product.dyn_code",
    header: "Cód. Dynamic",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value ? <CopyCell value={value} /> : null;
    },
  },
  {
    accessorKey: "product.name",
    header: "Nombre",
  },
  {
    accessorKey: "product.brand_name",
    header: "Marca",
  },
  {
    accessorKey: "product.category_name",
    header: "Categoría",
  },
  {
    accessorKey: "sale_price",
    header: "PVP",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return formatMoney(value);
    },
  },
  {
    accessorKey: "sale_price_min",
    header: "PVP min",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return formatMoney(value);
    },
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
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return value?.toFixed(2) || "0.00";
    },
  },
  {
    accessorKey: "quantity_pending_credit_note",
    header: "Pendiente Nota de Crédito",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return value?.toFixed(2) || "0.00";
    },
  },
  {
    accessorKey: "minimum_stock",
    header: "Stock Mínimo",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return value?.toFixed(2) || "0.00";
    },
  },
  {
    accessorKey: "maximum_stock",
    header: "Stock Máximo",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return value?.toFixed(2) || "0.00";
    },
  },
  {
    accessorKey: "stock_status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.original.is_out_of_stock
        ? "OUT_OF_STOCK"
        : row.original.is_low_stock
          ? "LOW_STOCK"
          : "NORMAL";
      const config = STOCK_STATUS_CONFIG[status];
      return (
        <Badge variant="outline" color={config.color}>
          {config.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "last_movement_date",
    header: "Último Movimiento",
    cell: ({ getValue }) => {
      const date = getValue() as string;
      if (!date) return "-";
      try {
        return formatDateTime(date);
      } catch {
        return date;
      }
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const productId = row.original.product_id;
      const warehouseId = row.original.warehouse_id;
      const hasReservedStock = (row.original.reserved_quantity || 0) > 0;

      return (
        <div className="flex gap-1">
          {/* Edit */}
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => onUpdateStockMinMax(row.original)}
            tooltip="Actualizar Stock Mínimo/Máximo"
          >
            <Pencil className="size-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="size-7"
            tooltip="Ver Movimientos"
            onClick={() => onMovements?.(productId, warehouseId)}
          >
            <ArrowRightLeft className="size-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            tooltip="Ver Histórico de Compras"
            onClick={() => onPurchaseHistory?.(productId, warehouseId)}
          >
            <History className="size-5" />
          </Button>
          {hasReservedStock && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              tooltip="Ver Stock Reservado"
              onClick={() => onReservedStock?.(productId, warehouseId)}
            >
              <Lock className="size-5" />
            </Button>
          )}
        </div>
      );
    },
  },
];
