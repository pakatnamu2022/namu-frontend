"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ManualResource } from "../lib/manual.interface";
import { Button } from "@/components/ui/button";
import { ExternalLink, Pencil } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { Badge } from "@/components/ui/badge";

export type ManualColumns = ColumnDef<ManualResource>;

interface Props {
  onDelete: (id: number) => void;
  onUpdate: (id: number) => void;
}

export const manualColumns = ({ onUpdate, onDelete }: Props): ManualColumns[] => [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ getValue }) => (
      <p className="font-semibold">{getValue() as number}</p>
    ),
  },
  {
    accessorKey: "title",
    header: "Título",
    cell: ({ getValue }) => (
      <p className="font-medium">{getValue() as string}</p>
    ),
  },
  {
    accessorKey: "module_slug",
    header: "Módulo",
    cell: ({ getValue }) => (
      <Badge variant="outline" className="capitalize">
        {getValue() as string}
      </Badge>
    ),
  },
  {
    accessorKey: "description",
    header: "Descripción",
    cell: ({ getValue }) => {
      const value = getValue() as string | null;
      return value ? (
        <p className="text-muted-foreground text-sm truncate max-w-48">{value}</p>
      ) : (
        <span className="text-muted-foreground/50 text-xs">—</span>
      );
    },
  },
  {
    accessorKey: "order",
    header: "Orden",
    cell: ({ getValue }) => (
      <p className="text-center">{getValue() as number}</p>
    ),
  },
  {
    accessorKey: "s3_url",
    header: "Archivo",
    cell: ({ getValue }) => {
      const url = getValue() as string;
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-primary text-xs underline-offset-2 hover:underline"
        >
          <ExternalLink className="size-3" />
          Ver .md
        </a>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const id = row.original.id;
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => onUpdate(id)}
          >
            <Pencil className="size-4" />
          </Button>
          <DeleteButton onClick={() => onDelete(id)} />
        </div>
      );
    },
  },
];
