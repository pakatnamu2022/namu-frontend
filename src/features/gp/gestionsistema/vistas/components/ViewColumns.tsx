"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ViewResource } from "../lib/view.interface";
import { Button } from "@/components/ui/button";
import { Pencil, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { Badge } from "@/components/ui/badge";
import { EditableSelectCell } from "@/shared/components/EditableSelectCell";
import { EditableCell } from "@/shared/components/EditableCell";
import { VIEW } from "../lib/view.constants";

export type ViewColumns = ColumnDef<ViewResource>;

interface Props {
  views: ViewResource[];
  onUpdateCell: (id: number, key: string, value: any) => void;
  onDelete: (id: number) => void;
}

export const viewColumns = ({
  views,
  onUpdateCell,
  onDelete,
}: Props): ViewColumns[] => [
  {
    accessorKey: "id",
    header: "Id",
  },
  {
    accessorKey: "descripcion",
    header: "Vista",
    cell: ({ row }) => {
      const descripcion = row.original.descripcion;
      const id = row.original.id;

      return (
        <EditableCell
          id={id}
          value={descripcion}
          isNumber={false}
          onUpdate={(id, value) => onUpdateCell(id, "descripcion", value)}
          widthClass="w-auto text-xs"
        />
      );
    },
  },
  {
    accessorKey: "parent",
    header: "Módulo Superior",
    cell: ({ row }) => {
      const parent_id = row.original.parent_id;
      const id = row.original.id;

      return (
        <EditableSelectCell
          id={id}
          options={views.map((v) => ({
            label: v.descripcion,
            value: String(v.id),
            description: v.parent ?? v.company,
          }))}
          value={parent_id}
          onUpdate={(id, value) =>
            onUpdateCell(id, "parent_id", value ? Number(value) : "")
          }
          widthClass="w-auto"
        />
      );
    },
  },
  {
    accessorKey: "company",
    header: "Empresa",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <Badge className="capitalize gap-2">{value}</Badge>;
    },
  },
  {
    accessorKey: "padre",
    header: "Padre",
    cell: ({ row }) => {
      const idPadre = row.original.idPadre;
      const id = row.original.id;

      return (
        <EditableSelectCell
          id={id}
          options={views.map((v) => ({
            label: v.descripcion,
            value: String(v.id),
            description: v.parent,
          }))}
          value={idPadre}
          onUpdate={(id, value) =>
            onUpdateCell(id, "idPadre", value ? Number(value) : "")
          }
          widthClass="w-auto"
        />
      );
    },
  },
  {
    accessorKey: "subPadre",
    header: "Sub Padre",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return (
        value && (
          <Badge variant="outline" className="capitalize gap-2">
            {value}
          </Badge>
        )
      );
    },
  },

  {
    accessorKey: "hijo",
    header: "Hijo",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return (
        value && (
          <Badge variant="outline" className="capitalize gap-2">
            {value}
          </Badge>
        )
      );
    },
  },
  {
    accessorKey: "submodule",
    header: "Es Submódulo",
    cell: ({ getValue }) => {
      const value = (getValue() as boolean) ? "Sí" : "No";
      return (
        <Badge variant="outline" className="capitalize gap-2">
          {value}
        </Badge>
      );
    },
  },
  {
    accessorKey: "slug",
    header: "Slug",
  },
  {
    accessorKey: "route",
    header: "Ruta",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <Badge className="gap-2">{value}</Badge>;
    },
  },
  {
    accessorKey: "ruta",
    header: "Ruta Milla",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return (
        value && (
          <Badge variant="secondary" className="gap-2">
            {value}
          </Badge>
        )
      );
    },
  },
  {
    accessorKey: "icono",
    header: "Ícono Milla",
  },
  {
    accessorKey: "icon",
    header: "Ícono",
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const router = useNavigate();
      const id = row.original.id;
      const submodule = row.original.submodule;
      const route = row.original.route;
      const { ROUTE_UPDATE, ABSOLUTE_ROUTE } = VIEW;

      return (
        <div className="flex items-center gap-2">
          {/* Permissions */}
          <Button
            tooltip="Gestionar Permisos"
            variant="outline"
            size="icon"
            className="size-7"
            disabled={Boolean(submodule) || route === null}
            onClick={() => router(`${ABSOLUTE_ROUTE}/permisos/${id}`)}
          >
            <ShieldCheck className="size-5" />
          </Button>
          {/* Edit */}
          <Button
            tooltip="Editar"
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => router(`${ROUTE_UPDATE}/${id}`)}
          >
            <Pencil className="size-5" />
          </Button>
          {/* Delete */}
          <DeleteButton onClick={() => onDelete(id)} />
        </div>
      );
    },
  },
];
