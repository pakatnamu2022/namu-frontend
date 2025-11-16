import { ColumnDef } from "@tanstack/react-table";
import { ProductResource } from "../lib/product.interface";
import { Button } from "@/components/ui/button";
import { Pencil, RefreshCw } from "lucide-react";
import { DeleteButton } from "@/src/shared/components/SimpleDeleteDialog";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

export type ProductColumns = ColumnDef<ProductResource>;

interface Props {
  onDelete: (id: number) => void;
  onStatusChange: (id: number, newStatus: string) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export const productColumns = ({
  onDelete,
  onStatusChange,
  permissions,
}: Props): ProductColumns[] => [
  {
    accessorKey: "code",
    header: "Código",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="font-semibold">{value}</p>;
    },
  },
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="font-medium">{value}</p>;
    },
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
    accessorKey: "current_stock",
    header: "Stock",
    cell: ({ getValue, row }) => {
      const stock = getValue() as number;
      const minimum_stock = row.original.minimum_stock;
      const isLowStock = stock <= minimum_stock;
      return (
        <Badge variant={isLowStock ? "destructive" : "default"}>{stock}</Badge>
      );
    },
  },
  {
    accessorKey: "sale_price",
    header: "P. Venta",
    cell: ({ getValue }) => {
      const value = getValue();
      if (value == null || value === "") return "S/ 0.00";
      const numValue =
        typeof value === "string" ? parseFloat(value) : Number(value);
      return isNaN(numValue) ? "S/ 0.00" : `S/ ${numValue.toFixed(2)}`;
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const value = getValue() as "ACTIVE" | "INACTIVE" | "DISCONTINUED";

      const statusConfig = {
        ACTIVE: {
          variant: "default" as const,
          label: "Activo",
        },
        INACTIVE: {
          variant: "secondary" as const,
          label: "Inactivo",
        },
        DISCONTINUED: {
          variant: "destructive" as const,
          label: "Descontinuado",
        },
      };

      const config = statusConfig[value] || statusConfig.INACTIVE;

      return (
        <Badge
          variant={config.variant}
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

          {/* Edit */}
          {permissions.canUpdate && (
            <Link href={`./productos/actualizar/${id}`}>
              <Button variant="outline" size="icon" className="size-7">
                <Pencil className="size-5" />
              </Button>
            </Link>
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
