import type { ColumnDef } from "@tanstack/react-table";
import { ProductResource } from "@/features/ap/post-venta/gestion-almacen/productos/lib/product.interface.ts";
import { Button } from "@/components/ui/button.tsx";
import { Eye, Warehouse, RefreshCw, Pencil } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select.tsx";
import { CopyCell } from "@/shared/components/CopyCell";
import {
  PRODUCT_STATUS_CONFIG,
  STOCK_STATUS_CONFIG,
} from "@/features/ap/post-venta/gestion-almacen/productos/lib/product.constants.ts";

export type ProductColumns = ColumnDef<ProductResource>;

interface Props {
  onAssignWarehouse?: (id: number) => void;
  onUpdate: (id: number) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, newStatus: string) => void;
  onView: (id: number) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export const productColumns = ({
  onAssignWarehouse,
  onUpdate,
  onDelete,
  onStatusChange,
  onView,
  permissions,
}: Props): ProductColumns[] => [
  {
    accessorKey: "code",
    header: "Cód.",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value ? (
        <CopyCell value={value} className="font-semibold" />
      ) : null;
    },
  },
  {
    accessorKey: "dyn_code",
    header: "Cód. Dynamic",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value ? <CopyCell value={value} /> : null;
    },
  },
  {
    accessorKey: "name",
    header: "Nombre",
  },
  {
    accessorKey: "brand_name",
    header: "Marca",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value || "-";
    },
  },
  {
    accessorKey: "category_name",
    header: "Categoría",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value || "-";
    },
  },
  {
    accessorKey: "unit_measurement_name",
    header: "U. Medida",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value || "-";
    },
  },
  {
    accessorKey: "total_stock",
    header: "Stock Total",
    cell: ({ getValue, row }) => {
      const stock = getValue() as number | undefined;
      const warehouseStocks = row.original.warehouse_stocks;

      const stockStatus = warehouseStocks?.some((ws) => ws.is_out_of_stock)
        ? "OUT_OF_STOCK"
        : warehouseStocks?.some((ws) => ws.is_low_stock)
          ? "LOW_STOCK"
          : "NORMAL";
      const config = STOCK_STATUS_CONFIG[stockStatus];

      return (
        <Badge variant="outline" color={config.color}>
          {stock ?? 0}
        </Badge>
      );
    },
  },
  {
    accessorKey: "total_available_stock",
    header: "Stock Disponible",
    cell: ({ getValue }) => {
      const stock = getValue() as number | undefined;
      return (
        <span className="font-medium text-muted-foreground">{stock ?? 0}</span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const value = getValue() as "ACTIVE" | "INACTIVE" | "DISCONTINUED";

      const config =
        PRODUCT_STATUS_CONFIG[value] ?? PRODUCT_STATUS_CONFIG.INACTIVE;

      return (
        <Badge variant="outline" color={config.color}>
          {config.label}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const { id, status, has_purchase_order } = row.original;

      return (
        <div className="flex items-center gap-2">
          {/* Status Selector */}
          {permissions.canUpdate && (
            <Select
              value={status}
              onValueChange={(value) => onStatusChange(id, value)}
            >
              <SelectTrigger className="h-8 w-[70px] gap-1.5">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`size-2.5 rounded-full ${
                      status === "ACTIVE"
                        ? "bg-green-500"
                        : status === "INACTIVE"
                          ? "bg-gray-400"
                          : "bg-secondary"
                    }`}
                  />
                  <RefreshCw className="size-3.5" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-green-500" />
                    <span>Activo</span>
                  </div>
                </SelectItem>
                <SelectItem value="INACTIVE">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-gray-400" />
                    <span>Inactivo</span>
                  </div>
                </SelectItem>
                <SelectItem value="DISCONTINUED">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-secondary" />
                    <span>Descontinuado</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* View Details */}
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => onView(id)}
          >
            <Eye className="size-4" />
          </Button>

          {permissions.canUpdate && !has_purchase_order && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              tooltip="Editar"
              onClick={() => onUpdate(id)}
            >
              <Pencil className="size-5" />
            </Button>
          )}

          {/* Assign Warehouse */}
          {permissions.canUpdate && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              tooltip="Asignar Almacén"
              onClick={() => onAssignWarehouse!(id)}
            >
              <Warehouse className="size-4" />
            </Button>
          )}

          {/* Delete */}
          {permissions.canDelete && !has_purchase_order && (
            <DeleteButton onClick={() => onDelete(id)} />
          )}
        </div>
      );
    },
  },
];
