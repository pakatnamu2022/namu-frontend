"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { EquipmentAssignmentResource } from "../lib/assignments.interface";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, PackageOpen } from "lucide-react";
import ExportButtons from "@/shared/components/ExportButtons";

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
        <Badge variant="outline" className="gap-2">
          {isActive ? (
            <CheckCircle className="size-3.5 text-primary" />
          ) : (
            <XCircle className="size-3.5 text-muted-foreground" />
          )}
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
            <Button
              size="icon-sm"
              variant="outline"
              color="rose"
              onClick={() => onUnassign(row.original)}
              title="Desasignar equipo"
            >
              <PackageOpen className="size-3.5" />
            </Button>
          )}
          <ExportButtons
            variant="separate-icon"
            pdfEndpoint={
              isActive
                ? `gp/tics/equipmentAssigment/${id}/pdf/assignment`
                : `gp/tics/equipmentAssigment/${id}/pdf/unassignment`
            }
            pdfFileName={isActive ? "acta-asignacion.pdf" : "acta-devolucion.pdf"}
          />
        </div>
      );
    },
  },
];
