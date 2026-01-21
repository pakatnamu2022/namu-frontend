"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { PerDiemPolicyResource } from "../lib/perDiemPolicy.interface";
import { Button } from "@/components/ui/button";
import { Pencil, FileText } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { Badge } from "@/components/ui/badge";

export type PerDiemPolicyColumns = ColumnDef<PerDiemPolicyResource>;

interface Props {
  onDelete: (id: number) => void;
  onUpdate: (id: number) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export const perDiemPolicyColumns = ({
  onUpdate,
  onDelete,
  permissions,
}: Props): PerDiemPolicyColumns[] => [
  {
    accessorKey: "version",
    header: "Versión",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="font-semibold">{value}</p>;
    },
  },
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p>{value}</p>;
    },
  },
  {
    accessorKey: "effective_from",
    header: "Vigencia Desde",
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
    accessorKey: "effective_to",
    header: "Vigencia Hasta",
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
    accessorKey: "is_current",
    header: "Estado",
    cell: ({ getValue }) => {
      const value = getValue() as boolean;
      return (
        <Badge
          color={value ? "default" : "secondary"}
          className="capitalize w-20 flex items-center justify-center"
        >
          {value ? "Vigente" : "Inactivo"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "document_path",
    header: "Documento",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return (
        value && (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-primary hover:underline"
          >
            <FileText className="h-4 w-4" />
            <span className="text-sm">Ver PDF</span>
          </a>
        )
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const { id } = row.original;

      return (
        <div className="flex items-center gap-2">
          {/* Edit */}
          {permissions.canUpdate && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => onUpdate(id)}
            >
              <Pencil className="size-5" />
            </Button>
          )}

          {/* Delete */}
          {permissions.canDelete && (
            <DeleteButton onClick={() => onDelete(id)} />
          )}
        </div>
      );
    },
  },
];
