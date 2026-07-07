import type { ColumnDef } from "@tanstack/react-table";
import type { ImportInitialStockModelsVnRow } from "../lib/modelsVn.interface";

export type ModelsVnImportInitialStockColumn =
  ColumnDef<ImportInitialStockModelsVnRow>;

function upper(value?: string | null) {
  return value ? value.toUpperCase() : "—";
}

export const modelsVnImportInitialStockColumns: ModelsVnImportInitialStockColumn[] = [
  {
    accessorKey: "row",
    header: "Fila",
  },
  {
    accessorKey: "vin",
    header: "VIN",
    cell: ({ getValue }) => upper(getValue() as string),
  },
  {
    accessorKey: "code",
    header: "Código",
    cell: ({ getValue }) => upper(getValue() as string),
  },
  {
    accessorKey: "sitio",
    header: "Sitio",
    cell: ({ getValue }) => upper(getValue() as string),
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => upper(getValue() as string),
  },
  {
    accessorKey: "final_status",
    header: "Estado Final",
    cell: ({ getValue }) => upper(getValue() as string),
  },
  {
    id: "warehouse",
    header: "Almacén",
    cell: ({ row }) => {
      const { warehouse_name, warehouse_code } = row.original;
      if (!warehouse_name) return "—";
      return upper(
        `${warehouse_name}${warehouse_code ? ` (${warehouse_code})` : ""}`,
      );
    },
  },
  {
    accessorKey: "movements",
    header: "Movimientos",
    cell: ({ getValue }) => {
      const movements = getValue() as string[] | undefined;
      return movements && movements.length > 0
        ? upper(movements.join(", "))
        : "—";
    },
  },
  {
    accessorKey: "po_number",
    header: "N° OC",
    cell: ({ getValue }) => upper(getValue() as string),
  },
  {
    accessorKey: "emission_date",
    header: "Fecha Emisión",
    cell: ({ getValue }) => upper(getValue() as string),
  },
  {
    accessorKey: "exchange_rate",
    header: "T. Cambio",
    cell: ({ getValue }) => upper(getValue() as string),
  },
  {
    accessorKey: "subtotal",
    header: "Subtotal",
    cell: ({ getValue }) => {
      const value = getValue() as number | undefined;
      return value !== undefined ? value.toFixed(2) : "—";
    },
  },
  {
    accessorKey: "igv",
    header: "IGV",
    cell: ({ getValue }) => {
      const value = getValue() as number | undefined;
      return value !== undefined ? value.toFixed(2) : "—";
    },
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ getValue }) => {
      const value = getValue() as number | undefined;
      return value !== undefined ? value.toFixed(2) : "—";
    },
  },
  {
    accessorKey: "error",
    header: "Error",
    cell: ({ getValue }) => {
      const value = getValue() as string | undefined;
      if (!value) return "—";
      return <span className="text-destructive">{value.toUpperCase()}</span>;
    },
  },
];
