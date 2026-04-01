"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { EquipmentAssignmentResource } from "../lib/assignments.interface";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  PackageOpen,
  FileCheck,
  FileX,
} from "lucide-react";
import ExportButtons from "@/shared/components/ExportButtons";
import { ButtonAction } from "@/shared/components/ButtonAction";

export type EquipmentAssignmentColumn = ColumnDef<EquipmentAssignmentResource>;

const formatDate = (date?: string) =>
  date
    ? new Date(date).toLocaleDateString("es-PE", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      })
    : "-";

export const equipmentAssignmentColumns = (
  onUnassign: (row: EquipmentAssignmentResource) => void,
): EquipmentAssignmentColumn[] => [
  {
    accessorKey: "worker_name",
    header: "Trabajador",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    id: "equipos",
    header: "Equipos",
    cell: ({ row }) => {
      const items = row.original.items;
      return (
        <div className="flex flex-col gap-1">
          {items.map((item) => (
            <Badge key={item.id} variant="outline" className="w-fit text-xs">
              {item.equipment?.equipo ?? `Equipo #${item.equipo_id}`}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "fecha",
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
          variant="default"
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
    accessorKey: "observacion",
    header: "Observación",
    cell: ({ getValue }) => (getValue() as string) || "-",
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
            <ButtonAction
              variant="outline"
              color="orange"
              onClick={() => onUnassign(row.original)}
              tooltip="Desasignar equipo"
              icon={PackageOpen}
            />
          )}
          <ExportButtons
            variant="separate-icon"
            pdfEndpoint={`gp/tics/equipmentAssigment/${id}/pdf/assignment`}
            pdfFileName="acta-asignacion.pdf"
            pdfColor="blue"
            pdfIcon={FileCheck}
          />
          {!isActive && (
            <ExportButtons
              variant="separate-icon"
              pdfEndpoint={`gp/tics/equipmentAssigment/${id}/pdf/unassignment`}
              pdfFileName="acta-devolucion.pdf"
              pdfColor="red"
              pdfIcon={FileX}
            />
          )}
        </div>
      );
    },
  },
];
