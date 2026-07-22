"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CurrentInventoryItem } from "../lib/daily-delivery.interface";

export type CurrentInventoryColumns = ColumnDef<CurrentInventoryItem>;

const getStockDaysColor = (days: number | null) => {
  if (days === null) return "text-muted-foreground";
  if (days > 90) return "text-red-600";
  if (days > 30) return "text-yellow-600";
  return "text-emerald-600";
};

export const currentInventoryColumns: CurrentInventoryColumns[] = [
  {
    accessorKey: "estado",
    header: "Estado",
    enableSorting: true,
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return (
        value && (
          <Badge variant="outline" className="font-medium">
            {value}
          </Badge>
        )
      );
    },
  },
  {
    accessorKey: "marca",
    header: "Marca",
    enableSorting: true,
  },
  {
    accessorKey: "modelo",
    header: "Modelo",
    enableSorting: true,
  },
  {
    accessorKey: "color",
    header: "Color",
    enableSorting: true,
  },
  {
    accessorKey: "anio_modelo",
    header: "Año",
    enableSorting: true,
  },
  {
    accessorKey: "combustible",
    header: "Combustible",
    enableSorting: true,
  },
  {
    accessorKey: "vin",
    header: "VIN",
    enableSorting: true,
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="font-semibold">{value}</p>;
    },
  },
  {
    accessorKey: "serie_motor",
    header: "# Motor",
    enableSorting: true,
  },
  {
    accessorKey: "sede",
    header: "Sede",
    enableSorting: true,
  },
  {
    accessorKey: "almacen",
    header: "Almacén",
    enableSorting: true,
  },
  {
    accessorKey: "dias_en_stock",
    header: "Días en Stock",
    enableSorting: true,
    cell: ({ getValue }) => {
      const value = getValue() as number | null;
      return (
        <span className={cn("font-semibold", getStockDaysColor(value))}>
          {value ?? "-"}
        </span>
      );
    },
  },
  {
    accessorKey: "importe_inicial",
    header: "Importe Inicial",
    enableSorting: true,
    cell: ({ getValue }) => {
      const value = getValue() as string | null;
      return value ? (
        <span className="tabular-nums">S/ {value}</span>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
  },
  {
    accessorKey: "numero_factura",
    header: "# Factura",
    enableSorting: true,
    cell: ({ getValue }) => {
      const value = getValue() as string | null;
      return value || <span className="text-muted-foreground">-</span>;
    },
  },
  {
    accessorKey: "fecha_emision",
    header: "Fecha Emisión",
    enableSorting: true,
    cell: ({ getValue }) => {
      const value = getValue() as string | null;
      if (!value) return <span className="text-muted-foreground">-</span>;
      try {
        return format(parseISO(value), "d MMM yyyy");
      } catch {
        return value;
      }
    },
  },
  {
    accessorKey: "solicitud",
    header: "Solicitud",
    enableSorting: true,
    cell: ({ getValue }) => {
      const value = getValue() as string | null;
      return value || <span className="text-muted-foreground">-</span>;
    },
  },
  {
    accessorKey: "cliente",
    header: "Cliente",
    enableSorting: true,
    cell: ({ getValue }) => {
      const value = getValue() as string | null;
      return value || <span className="text-muted-foreground">-</span>;
    },
  },
  {
    accessorKey: "asesor",
    header: "Asesor",
    enableSorting: true,
    cell: ({ getValue }) => {
      const value = getValue() as string | null;
      return value || <span className="text-muted-foreground">-</span>;
    },
  },
];
