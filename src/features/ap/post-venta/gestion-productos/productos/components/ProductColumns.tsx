import type { ColumnDef } from "@tanstack/react-table";
import { ProductResource } from "../lib/product.interface";
import { Button } from "@/components/ui/button";
import { Eye, Warehouse, RefreshCw } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

export type ProductColumns = ColumnDef<ProductResource>;

interface Props {
  onAssignWarehouse?: (id: number) => void;
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
      return value && <p className="font-semibold">{value}</p>;
    },
  },
  {
    accessorKey: "dyn_code",
    header: "Cód. Dynamic",
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

      // Check if any warehouse has low stock
      const hasLowStock =
        warehouseStocks?.some((ws) => ws.is_low_stock) || false;
      const hasOutOfStock =
        warehouseStocks?.some((ws) => ws.is_out_of_stock) || false;

      const displayStock = stock ?? 0;

      return (
        <Badge
          color={
            hasOutOfStock
              ? "destructive"
              : hasLowStock
                ? "secondary"
                : "default"
          }
        >
          {displayStock}
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
    accessorKey: "sale_price",
    header: "P. Venta",
    cell: ({ getValue, row }) => {
      const value = getValue();
      const priceWithTax = row.original.price_with_tax;

      if (value == null || value === "") return "S/ 0.00";
      const numValue =
        typeof value === "string" ? parseFloat(value) : Number(value);
      const basePrice = isNaN(numValue) ? 0 : numValue;

      return (
        <div className="flex flex-col">
          <span className="font-medium">S/ {basePrice.toFixed(2)}</span>
          {priceWithTax != null && priceWithTax !== basePrice && (
            <span className="text-xs text-muted-foreground">
              c/IGV: S/ {priceWithTax.toFixed(2)}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const value = getValue() as "ACTIVE" | "INACTIVE" | "DISCONTINUED";

      const statusConfig = {
        ACTIVE: {
          color: "default" as const,
          label: "Activo",
        },
        INACTIVE: {
          color: "secondary" as const,
          label: "Inactivo",
        },
        DISCONTINUED: {
          color: "destructive" as const,
          label: "Descontinuado",
        },
      };

      const config = statusConfig[value] || statusConfig.INACTIVE;

      return (
        <Badge
          color={config.color}
          className="capitalize w-32 flex items-center justify-center gap-2"
        >
          {config.label}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const { id, status } = row.original;

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
          {permissions.canDelete && (
            <DeleteButton onClick={() => onDelete(id)} />
          )}
        </div>
      );
    },
  },
];
