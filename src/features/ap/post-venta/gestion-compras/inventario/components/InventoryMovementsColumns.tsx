import type { ColumnDef } from "@tanstack/react-table";
import { InventoryMovementResource } from "../lib/inventoryMovements.interface";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export type InventoryMovementColumns = ColumnDef<InventoryMovementResource>;

export const inventoryMovementsColumns = (): InventoryMovementColumns[] => [
  {
    accessorKey: "movement_date",
    header: "Fecha",
    cell: ({ getValue }) => {
      const date = getValue() as string;
      if (!date) return "-";
      try {
        return format(new Date(date), "dd/MM/yyyy", { locale: es });
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
          {type}
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
    accessorKey: "document_number",
    header: "N° Documento",
    cell: ({ row }) => {
      const docType = row.original.document_type;
      const docNumber = row.original.document_number;
      if (!docNumber) return "-";
      return (
        <div className="flex flex-col">
          {docType && (
            <span className="text-xs text-muted-foreground">{docType}</span>
          )}
          <span>{docNumber}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "quantity_in",
    header: "Entrada",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      if (!value || value === 0) return "-";
      return (
        <span className="text-green-600 font-medium">+{value.toFixed(2)}</span>
      );
    },
  },
  {
    accessorKey: "quantity_out",
    header: "Salida",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      if (!value || value === 0) return "-";
      return (
        <span className="text-red-600 font-medium">-{value.toFixed(2)}</span>
      );
    },
  },
  {
    accessorKey: "balance",
    header: "Saldo",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return (
        <span className="font-semibold">{value?.toFixed(2) || "0.00"}</span>
      );
    },
  },
  {
    accessorKey: "unit_cost",
    header: "Costo Unitario",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      if (!value) return "-";
      return `S/ ${value.toFixed(2)}`;
    },
  },
  {
    accessorKey: "total_cost",
    header: "Costo Total",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      if (!value) return "-";
      return `S/ ${value.toFixed(2)}`;
    },
  },
  // {
  //   accessorKey: "warehouse_origin",
  //   header: "Almacén Origen",
  //   cell: ({ getValue }) => {
  //     const value = getValue() as string;
  //     return value || "-";
  //   },
  // },
  // {
  //   accessorKey: "warehouse_destination",
  //   header: "Almacén Destino",
  //   cell: ({ getValue }) => {
  //     const value = getValue() as string;
  //     return value || "-";
  //   },
  // },
  // {
  //   accessorKey: "supplier",
  //   header: "Proveedor/Cliente",
  //   cell: ({ row }) => {
  //     const supplier = row.original.supplier;
  //     const customer = row.original.customer;
  //     return supplier || customer || "-";
  //   },
  // },
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
];
