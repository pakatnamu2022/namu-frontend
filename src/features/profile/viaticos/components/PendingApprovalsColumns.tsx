"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { PerDiemRequestResource } from "../lib/perDiemRequest.interface";
import { Badge, BadgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Eye } from "lucide-react";

export type PendingApprovalsColumns = ColumnDef<PerDiemRequestResource>;

interface Props {
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onViewDetail: (id: number) => void;
}

export const pendingApprovalsColumns = ({
  onApprove,
  onReject,
  onViewDetail,
}: Props): PendingApprovalsColumns[] => [
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
    accessorKey: "district.name",
    header: "Destino",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p>{value}</p>;
    },
  },
  {
    accessorKey: "purpose",
    header: "Propósito",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="max-w-xs text-wrap">{value}</p>;
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
        cancelled: { label: "Cancelado", variant: "gray" },
      };
      const status = statusMap[value] || {
        label: value,
        variant: "secondary",
      };
      return (
        <div className="w-fit">
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
      const { id, status } = row.original;

      return (
        <div className="flex items-center gap-2">
          {/* Ver Detalle */}
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => onViewDetail(id)}
            tooltip="Ver detalle"
          >
            <Eye className="size-4" />
          </Button>

          {/* Solo mostrar botones de aprobación si está pendiente */}
          {status === "pending" && (
            <>
              {/* Aprobar */}
              <Button
                variant="default"
                size="icon"
                className="size-7"
                onClick={() => onApprove(id)}
                tooltip="Aprobar solicitud"
              >
                <Check className="size-4" />
              </Button>

              {/* Rechazar */}
              <Button
                variant="destructive"
                size="icon"
                className="size-7"
                onClick={() => onReject(id)}
                tooltip="Rechazar solicitud"
              >
                <X className="size-4" />
              </Button>
            </>
          )}
        </div>
      );
    },
  },
];
