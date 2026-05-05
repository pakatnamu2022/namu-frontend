import type { ColumnDef } from "@tanstack/react-table";

export interface ReceptionAccessory {
  id: number;
  description: string;
  quantity: number;
  unit_measurement: string;
}

export const receptionAccessoriesColumns: ColumnDef<ReceptionAccessory>[] = [
  {
    accessorKey: "description",
    header: "Descripción",
  },
  {
    accessorKey: "quantity",
    header: "Cant.",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.quantity}</span>
    ),
  },
  {
    accessorKey: "unit_measurement",
    header: "Unidad",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.unit_measurement}
      </span>
    ),
  },
];
