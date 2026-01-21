"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  PerDiemRequestResource,
  PerDiemSettlementStatus,
} from "../lib/perDiemRequest.interface";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Eye } from "lucide-react";
import SettlementStatusBadge from "./PerDiemRequestDetail/SettlementStatusBadge";

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
      return value && <p className="text-wrap">{value}</p>;
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
        },
      );
      const endDate = new Date(row.original.end_date).toLocaleDateString(
        "es-PE",
        {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        },
      );
      return (
        <p className="text-end">
          {startDate} - {endDate}{" "}
          <Badge size="square" color="tertiary">
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
      return value && <Badge variant="outline">{value}</Badge>;
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
        <p
          className={`text-right font-semibold ${
            isNegative ? "text-red-600" : "text-green-600"
          }`}
        >
          S/ {Math.abs(value || 0).toFixed(2)}
        </p>
      );
    },
  },
  {
    accessorKey: "settlement_status",
    header: "Estado Liquidación",
    cell: ({ getValue }) => {
      const value = getValue() as PerDiemSettlementStatus;

      return (
        <div className="w-fit">
          <SettlementStatusBadge settlementStatus={value} />
        </div>
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
