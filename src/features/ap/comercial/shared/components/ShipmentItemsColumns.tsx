import type { ColumnDef } from "@tanstack/react-table";

export interface ShipmentItem {
  codigo: string;
  descripcion: string;
  unidad: string;
  cantidad: string;
}

export const shipmentItemsColumns: ColumnDef<ShipmentItem>[] = [
  {
    accessorKey: "codigo",
    header: "Código",
  },
  {
    accessorKey: "descripcion",
    header: "Descripción",
  },
  {
    accessorKey: "unidad",
    header: "Unidad",
  },
  {
    accessorKey: "cantidad",
    header: "Cantidad",
    cell: ({ row }) => (
      <span className="font-semibold">{row.original.cantidad}</span>
    ),
  },
];
