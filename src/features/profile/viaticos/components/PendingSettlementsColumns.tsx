"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { PerDiemRequestResource } from "../lib/perDiemRequest.interface";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Eye } from "lucide-react";

export type PendingSettlementsColumns = ColumnDef<PerDiemRequestResource>;

interface Props {
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onViewDetail: (id: number) => void;
}

export const pendingSettlementsColumns = ({
  onApprove,
  onReject,
  onViewDetail,
}: Props): PendingSettlementsColumns[] => [
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
    accessorKey: "district.name",
    header: "Destino",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p>{value}</p>;
    },
  },
  {
    accessorKey: "total_spent",
    header: "Total Gastado",
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
    accessorKey: "balance_to_return",
    header: "Saldo a Devolver",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      const isNegative = value < 0;
      return (
        <p className={`text-right font-semibold ${isNegative ? 'text-red-600' : 'text-green-600'}`}>
          S/ {Math.abs(value || 0).toFixed(2)}
        </p>
      );
    },
  },
  {
    accessorKey: "settlement_status",
    header: "Estado Liquidación",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      const statusMap: Record<string, { label: string; variant: any }> = {
        submitted: { label: "Enviada", variant: "secondary" },
        approved_by_boss: { label: "Aprobada por Jefe", variant: "default" },
        approved: { label: "Aprobada", variant: "outline" },
        rejected: { label: "Rechazada", variant: "destructive" },
      };
      const status = statusMap[value] || {
        label: value || "Sin liquidar",
        variant: "secondary",
      };
      return (
        <Badge
          variant={status.variant}
          className="capitalize w-auto flex items-center justify-center"
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
      const { id, settlement_status } = row.original;

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

          {/* Solo mostrar botones de aprobación si está en estado submitted */}
          {settlement_status === "submitted" && (
            <>
              {/* Aprobar */}
              <Button
                variant="default"
                size="icon"
                className="size-7"
                onClick={() => onApprove(id)}
                tooltip="Aprobar liquidación"
              >
                <Check className="size-4" />
              </Button>

              {/* Rechazar */}
              <Button
                variant="destructive"
                size="icon"
                className="size-7"
                onClick={() => onReject(id)}
                tooltip="Rechazar liquidación"
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
