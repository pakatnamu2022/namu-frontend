"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { PerDiemRequestResource } from "../lib/perDiemRequest.interface";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

export type PendingApprovalsColumns = ColumnDef<PerDiemRequestResource>;

interface Props {
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}

export const pendingApprovalsColumns = ({
  onApprove,
  onReject,
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
    accessorKey: "employee",
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
    accessorKey: "destination",
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
      return value && <p className="max-w-xs truncate">{value}</p>;
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
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const { id, status } = row.original;

      console.log("Row status:", status); // Debug: verificar el valor del status

      // Solo mostrar botones si está pendiente
      if (status !== "pending") {
        return <p className="text-sm text-muted-foreground">-</p>;
      }

      return (
        <div className="flex items-center gap-2">
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
        </div>
      );
    },
  },
];
