"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { PhoneLineWorkerResource } from "../lib/assignments.interface";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, PhoneOff, FileCheck, FileX, Link2 } from "lucide-react";
import ExportButtons from "@/shared/components/ExportButtons";

export type PhoneLineAssignmentColumn = ColumnDef<PhoneLineWorkerResource>;

const formatDate = (date?: string) =>
  date
    ? new Date(date).toLocaleDateString("es-PE", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      })
    : "-";

export const phoneLineAssignmentColumns = (
  onUnassign: (row: PhoneLineWorkerResource) => void,
  onLinkEquipment: (row: PhoneLineWorkerResource) => void,
): PhoneLineAssignmentColumn[] => [
  {
    accessorKey: "worker_name",
    header: "Trabajador",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "phone_line",
    header: "Línea",
    cell: ({ getValue }) => (
      <Badge variant="outline">{getValue() as number}</Badge>
    ),
  },
  {
    accessorKey: "equipo_nombre",
    header: "Equipo",
    cell: ({ getValue }) => {
      const value = getValue() as string | null | undefined;
      return value ? (
        <span className="text-sm">{value}</span>
      ) : (
        <span className="text-muted-foreground text-xs">—</span>
      );
    },
  },
  {
    accessorKey: "assigned_at",
    header: "Fecha asignación",
    cell: ({ getValue }) => formatDate(getValue() as string),
  },
  {
    accessorKey: "unassigned_at",
    header: "Fecha devolución",
    cell: ({ getValue }) => formatDate(getValue() as string | undefined),
  },
  {
    id: "estado",
    header: "Estado",
    cell: ({ row }) => {
      const isActive = !row.original.unassigned_at;
      return (
        <Badge
          variant="outline"
          className="gap-2"
          icon={isActive ? CheckCircle : XCircle}
          color={isActive ? "green" : "red"}
        >
          {isActive ? "Activo" : "Devuelto"}
        </Badge>
      );
    },
  },
  {
    id: "acciones",
    header: "Acta",
    cell: ({ row }) => {
      const { id, unassigned_at } = row.original;
      const isActive = !unassigned_at;
      return (
        <div className="flex items-center gap-1">
          {isActive && (
            <Button
              size="icon-sm"
              variant="outline"
              color="violet"
              onClick={() => onLinkEquipment(row.original)}
              title="Vincular equipo"
            >
              <Link2 className="size-3.5" />
            </Button>
          )}
          {isActive && (
            <Button
              size="icon-sm"
              variant="outline"
              color="rose"
              onClick={() => onUnassign(row.original)}
              title="Desasignar línea"
            >
              <PhoneOff className="size-3.5" />
            </Button>
          )}

          <ExportButtons
            variant="separate-icon"
            pdfEndpoint={`gp/tics/phoneLineWorker/${id}/pdf/assignment`}
            pdfFileName="acta-asignacion.pdf"
            pdfColor="blue"
            pdfVariant="outline"
            pdfIcon={FileCheck}
          />
          {!isActive && (
            <ExportButtons
              variant="separate-icon"
              pdfEndpoint={`gp/tics/phoneLineWorker/${id}/pdf/unassignment`}
              pdfFileName="acta-devolucion.pdf"
              pdfColor="red"
              pdfVariant="outline"
              pdfIcon={FileX}
            />
          )}
        </div>
      );
    },
  },
];
