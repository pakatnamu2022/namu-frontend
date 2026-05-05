import { CheckCircle, XCircle } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

export interface ReceptionChecklistItem {
  id: number;
  receiving_description: string;
  quantity: number;
}

export const receptionChecklistColumns: ColumnDef<ReceptionChecklistItem>[] = [
  {
    accessorKey: "receiving_description",
    header: "Producto",
  },
  {
    accessorKey: "quantity",
    header: "Cant.",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.quantity}</span>
    ),
  },
  {
    id: "estado",
    header: "Estado",
    cell: ({ row }) =>
      row.original.quantity > 0 ? (
        <CheckCircle className="h-4 w-4 text-green-600" />
      ) : (
        <XCircle className="h-4 w-4 text-muted-foreground" />
      ),
  },
];
