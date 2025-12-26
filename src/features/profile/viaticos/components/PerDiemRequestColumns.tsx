"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { PerDiemRequestResource } from "../lib/perDiemRequest.interface";
import { Badge, BadgeVariants } from "@/components/ui/badge";
import { PerDiemRequestRowActions } from "./PerDiemRequestRowActions";

export type PerDiemRequestColumns = ColumnDef<PerDiemRequestResource>;

interface Props {
  onViewDetail: (id: number) => void;
  onViewHotelReservation?: (requestId: number) => void;
}

export const perDiemRequestColumns = ({
  onViewDetail,
  onViewHotelReservation,
}: Props): PerDiemRequestColumns[] => [
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
      return value && <p className="text-wrap text-xs">{value}</p>;
    },
  },
  {
    accessorKey: "dates",
    header: "Fechas",
    cell: ({ row }) => {
      const startDate = new Date(row.original.start_date).toLocaleDateString(
        "es-PE",
        {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }
      );
      const endDate = new Date(row.original.end_date).toLocaleDateString(
        "es-PE",
        {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }
      );
      return (
        <p className="text-xs text-end">
          {startDate} - {endDate}{" "}
          <Badge size="square" variant={"tertiary"}>
            {row.original.days_count}
          </Badge>
        </p>
      );
    },
  },
  {
    accessorKey: "total_budget",
    header: "Presupuesto",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return (
        <div className="flex justify-end">
          <Badge variant="outline" className="text-end font-semibold">
            S/ {value?.toFixed(2) || "0.00"}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "total_spent",
    header: "Gasto",
    cell: ({ row }) => {
      const value = row.original.total_spent as number;
      const isExceeded = value > row.original.total_budget;
      const variant: BadgeVariants = isExceeded ? "destructive" : "blue";
      return (
        <div className="flex justify-end">
          <Badge variant={variant} className="text-end font-semibold">
            S/ {value?.toFixed(2) || "0.00"}
          </Badge>
        </div>
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
        <div className="w-fit mx-auto">
          <Badge className="w-fit" variant={status.variant}>
            {status.label}
          </Badge>
        </div>
      );
    },
  },

  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      return (
        <PerDiemRequestRowActions
          onViewDetail={onViewDetail}
          onViewHotelReservation={onViewHotelReservation}
          request={row.original}
        />
      );
    },
  },
];
