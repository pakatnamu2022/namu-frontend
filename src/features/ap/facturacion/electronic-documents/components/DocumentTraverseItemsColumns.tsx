import type { ColumnDef } from "@tanstack/react-table";
import { formatMoney } from "@/core/core.function";
import { ElectronicDocumentItem } from "../lib/electronicDocument.interface";

export type DocumentTraverseItemsColumn = ColumnDef<ElectronicDocumentItem>;

export const documentTraverseItemsColumns =
  (): DocumentTraverseItemsColumn[] => [
    {
      accessorKey: "codigo",
      header: "Código",
      cell: ({ row }) => (
        <span className="text-sm font-mono">{row.original.codigo}</span>
      ),
    },
    {
      accessorKey: "descripcion",
      header: "Descripción",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.descripcion}</span>
      ),
    },
    {
      accessorKey: "cantidad",
      header: "Cantidad",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.cantidad}</span>
      ),
    },
    {
      accessorKey: "precio_unitario",
      header: "P. Unitario",
      cell: ({ row }) => (
        <span className="text-sm">
          {formatMoney(row.original.precio_unitario)}
        </span>
      ),
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => (
        <span className="font-semibold text-sm">
          {formatMoney(row.original.total)}
        </span>
      ),
    },
  ];
