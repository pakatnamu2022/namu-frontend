"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ScrumProjectResource } from "../lib/scrumProject.interface";
import { Badge } from "@/components/ui/badge";
import { Archive, CheckCircle, Download, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { SCRUM_PROJECT } from "../lib/scrumProject.constants";
import { ButtonAction } from "@/shared/components/ButtonAction";
import { downloadScrumProjectGanttPdf } from "../lib/scrumProject.actions";
import { errorToast } from "@/core/core.function";

export type ScrumProjectColumns = ColumnDef<ScrumProjectResource>;

export const scrumProjectColumns = ({
  onDelete,
}: {
  onDelete: (id: number) => void;
}): ScrumProjectColumns[] => [
  {
    accessorKey: "name",
    header: "Proyecto",
    cell: ({ row }) => {
      const { color, name } = row.original;
      return (
        <div className="flex items-center gap-2">
          <span
            className="size-3 rounded-full shrink-0"
            style={{ backgroundColor: color ?? "#3B82F6" }}
          />
          <span className="font-semibold">{name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return (
        <Badge variant="outline" className="gap-2 capitalize">
          {value === "activo" ? (
            <CheckCircle className="size-3 text-emerald-500" />
          ) : (
            <Archive className="size-3 text-gray-400" />
          )}
          {value}
        </Badge>
      );
    },
  },
  {
    accessorKey: "sprints_count",
    header: "Sprints",
    cell: ({ getValue }) => (
      <Badge variant="outline">{getValue() as number}</Badge>
    ),
  },
  {
    accessorKey: "items_count",
    header: "Items",
    cell: ({ getValue }) => (
      <Badge variant="outline">{getValue() as number}</Badge>
    ),
  },
  {
    id: "creator",
    header: "Creador",
    cell: ({ row }) => row.original.creator?.name ?? "-",
  },
  {
    accessorKey: "description",
    header: "Descripción",
    cell: ({ getValue }) => {
      const v = getValue() as string | undefined;
      return v ? (
        <span className="text-muted-foreground text-sm line-clamp-1">{v}</span>
      ) : (
        "-"
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const router = useNavigate();
      const { ROUTE_UPDATE } = SCRUM_PROJECT;
      const { id, name } = row.original;
      const [downloading, setDownloading] = useState(false);

      const handleDownloadGantt = async () => {
        setDownloading(true);
        try {
          await downloadScrumProjectGanttPdf(id, name);
        } catch {
          errorToast("Error al descargar el PDF del Gantt");
        } finally {
          setDownloading(false);
        }
      };

      return (
        <div className="flex items-center gap-2">
          <ButtonAction
            icon={Download}
            title="Descargar Gantt en PDF"
            disabled={downloading}
            onClick={handleDownloadGantt}
          />
          <ButtonAction
            icon={Pencil}
            onClick={() => router(`${ROUTE_UPDATE}/${id}`)}
          />
          <DeleteButton onClick={() => onDelete(id)} />
        </div>
      );
    },
  },
];
