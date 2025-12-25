"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  HotelReservation,
  PerDiemRequestResource,
} from "../lib/perDiemRequest.interface";
import { Badge, BadgeVariants } from "@/components/ui/badge";
import { PerDiemRequestRowActions } from "./PerDiemRequestRowActions";
import { Building, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export type PerDiemRequestColumns = ColumnDef<PerDiemRequestResource>;

interface Props {
  onViewDetail: (id: number) => void;
}

export const perDiemRequestColumns = ({
  onViewDetail,
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
          <Badge size="xs" variant={"tertiary"}>
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
    accessorKey: "paid",
    header: "Pagado",
    cell: ({ getValue }) => {
      const value = getValue() as boolean;
      return (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size={"icon-sm"}
            tooltip={value ? "Pagado" : "Pendiente"}
          >
            {value ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-gray-400" />
            )}
          </Button>
        </div>
      );
    },
  },
  {
    accessorKey: "hotel_reservation",
    header: "Reserva",
    cell: ({ getValue }) => {
      const hotelReservation = getValue() as HotelReservation | undefined;
      const hasHotelReservation = !!hotelReservation;
      return (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size={"icon-sm"}
            tooltip={
              hasHotelReservation ? hotelReservation.hotel_name : "Sin reserva"
            }
          >
            {hasHotelReservation ? (
              <Building className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-gray-400" />
            )}
          </Button>
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
          request={row.original}
        />
      );
    },
  },
];
