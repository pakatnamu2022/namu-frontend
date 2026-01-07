"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  PerDiemRequestResource,
  PerDiemRequestStatus,
} from "../lib/perDiemRequest.interface";
import { Badge } from "@/components/ui/badge";
import { PerDiemRequestRowActions } from "./PerDiemRequestRowActions";
import { RequestStatusBadge } from "./PerDiemRequestDetail";

export type PerDiemRequestColumns = ColumnDef<PerDiemRequestResource>;

interface Props {
  onViewDetail: (id: number) => void;
  onViewHotelReservation?: (requestId: number) => void;
  module: "gh" | "contabilidad";
  permissions?: {
    canSend?: boolean;
  };
}

export const perDiemRequestColumns = ({
  onViewDetail,
  onViewHotelReservation,
  module,
  permissions: { canSend = false } = {},
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
        <div className="text-xs text-end">
          {startDate} - {endDate}{" "}
          <Badge size="square" variant={"tertiary"}>
            {row.original.days_count}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "district.name",
    header: "Destino",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p>{value}</p>;
    },
  },
  {
    accessorKey: "total_budget",
    header: "Presupuesto",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return (
        <div className="flex justify-end">S/ {value?.toFixed(2) || "0.00"}</div>
      );
    },
  },
  {
    accessorKey: "total_spent",
    header: "Gasto",
    cell: ({ row }) => {
      const value = row.original.total_spent as number;
      return (
        <div className="flex justify-end">S/ {value?.toFixed(2) || "0.00"}</div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const value = getValue() as PerDiemRequestStatus;

      return (
        <div className="w-fit">
          <RequestStatusBadge status={value} />
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
          module={module}
          permissions={{
            canSend: canSend,
          }}
        />
      );
    },
  },
];
