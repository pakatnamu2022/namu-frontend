"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { PerDiemRequestResource } from "../lib/perDiemRequest.interface";
import { Badge } from "@/components/ui/badge";

export type PerDiemRequestColumns = ColumnDef<PerDiemRequestResource>;

export const perDiemRequestColumns = (): PerDiemRequestColumns[] => [
  {
    accessorKey: "code",
    header: "Código",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="font-semibold">{value}</p>;
    },
  },
  {
    accessorKey: "employee_id",
    header: "Empleado",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p>{value}</p>;
    },
  },
  {
    accessorKey: "start_date",
    header: "Fecha Inicio",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      if (!value) return "-";
      const date = new Date(value);
      return date.toLocaleDateString("es-PE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    },
  },
  {
    accessorKey: "end_date",
    header: "Fecha Fin",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      if (!value) return "-";
      const date = new Date(value);
      return date.toLocaleDateString("es-PE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    },
  },
  {
    accessorKey: "days_count",
    header: "Días",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return <p className="text-center">{value || 0}</p>;
    },
  },
  {
    accessorKey: "total_budget",
    header: "Presupuesto Total",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return (
        <p className="text-right font-semibold">
          S/ {value?.toFixed(2) || "0.00"}
        </p>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      const statusMap: Record<string, { label: string; variant: any }> = {
        pending: { label: "Pendiente", variant: "secondary" },
        approved: { label: "Aprobado", variant: "default" },
        rejected: { label: "Rechazado", variant: "destructive" },
        completed: { label: "Completado", variant: "outline" },
      };
      const status = statusMap[value] || {
        label: value,
        variant: "secondary",
      };
      return (
        <Badge
          variant={status.variant}
          className="capitalize w-24 flex items-center justify-center"
        >
          {status.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "paid",
    header: "Pagado",
    cell: ({ getValue }) => {
      const value = getValue() as boolean;
      return (
        <Badge
          variant={value ? "default" : "secondary"}
          className="capitalize w-16 flex items-center justify-center"
        >
          {value ? "Sí" : "No"}
        </Badge>
      );
    },
  },
];
