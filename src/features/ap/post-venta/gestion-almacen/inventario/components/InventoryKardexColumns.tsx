import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge.tsx";
import { CopyCell } from "@/shared/components/CopyCell";
import { InventoryKardexResource } from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventoryMovements.interface.ts";

export type InventoryKardexColumns = ColumnDef<InventoryKardexResource>;

export const inventoryKardexColumns = (): InventoryKardexColumns[] => [
  {
    accessorKey: "code",
    header: "Cód.",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value ? (
        <CopyCell value={value} className="font-semibold" />
      ) : (
        "-"
      );
    },
  },
  {
    accessorKey: "dyn_code",
    header: "Cód. Dynamic",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value ? <CopyCell value={value} /> : "-";
    },
  },
  {
    accessorKey: "description",
    header: "Descripción",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value || "-";
    },
  },
  {
    accessorKey: "category",
    header: "Categoría",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value || "-";
    },
  },
  {
    accessorKey: "brand",
    header: "Marca",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value || "-";
    },
  },
  {
    accessorKey: "article_class",
    header: "Clase",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value ? (
        <Badge variant="outline" className="whitespace-nowrap">
          {value}
        </Badge>
      ) : (
        "-"
      );
    },
  },
  {
    accessorKey: "unit_measurement",
    header: "U. Medida",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value || "-";
    },
  },
  {
    accessorKey: "balance",
    header: "Saldo",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return value != null ? Number(value).toFixed(2) : "0.00";
    },
  },
];
