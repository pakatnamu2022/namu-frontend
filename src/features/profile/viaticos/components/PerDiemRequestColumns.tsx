"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { PerDiemRequestResource } from "../lib/perDiemRequest.interface";
import { Badge, BadgeVariants } from "@/components/ui/badge";
import { PerDiemRequestRowActions } from "./PerDiemRequestRowActions";

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
    accessorKey: "employee.full_name",
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
        <Badge variant="outline" className="text-right font-semibold">
          S/ {value?.toFixed(2) || "0.00"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      const statusMap: Record<
        string,
        { label: string; variant: BadgeVariants }
      > = {
        pending: { label: "Pendiente", variant: "blue" },
        approved: { label: "Aprobado", variant: "purple" },
        rejected: { label: "Rechazado", variant: "red" },
        completed: { label: "Completado", variant: "green" },
        pending_settlement: {
          label: "Liquidación Pendiente",
          variant: "indigo",
        },
        in_progress: { label: "En Progreso", variant: "orange" },
      };
      const status = statusMap[value] || {
        label: value,
        variant: "secondary",
      };
      return (
        <div className="text-wrap! w-fit mx-auto">
          <Badge className="w-fit" variant={status.variant}>
            {status.label}
          </Badge>
        </div>
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
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      return <PerDiemRequestRowActions request={row.original} />;
    },
  },
];
