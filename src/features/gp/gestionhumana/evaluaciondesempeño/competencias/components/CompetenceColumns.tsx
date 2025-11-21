"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CompetenceResource } from "../lib/competence.interface";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { COMPETENCE } from "../lib/competence.constans";

export type CompetenceColumns = ColumnDef<CompetenceResource>;

export const competenceColumns = ({
  onDelete,
}: {
  onDelete: (id: number) => void;
}): CompetenceColumns[] => [
  {
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ getValue }) => (
      <span className="font-semibold text-wrap! line-clamp-1">
        {getValue() as string}
      </span>
    ),
  },
  {
    accessorKey: "subcompetences",
    header: "Subcompetencias",
    cell: ({ row }) => {
      const subcompetences = row.original.subcompetences;
      return (
        <span className="text-wrap! line-clamp-1">
          {subcompetences.map((sub) => sub.nombre).join(", ")}
        </span>
      );
    },
  },
  {
    accessorKey: "subcompetencesWithoutDescription",
    header: "Sin descripción",
    cell: ({ row }) => {
      const subcompetencesWithoutDescription = row.original.subcompetences;
      const count = subcompetencesWithoutDescription.filter(
        (sub) => sub.definicion || sub.definicion.trim() !== ""
      ).length;
      return (
        <Badge variant={count > 0 ? "default" : "destructive"}>{count}</Badge>
      );
    },
  },

  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const router = useNavigate();
      const id = row.original.id;
      const { ROUTE_UPDATE } = COMPETENCE;

      return (
        <div className="flex items-center gap-2">
          {/* Edit */}
          <Button
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
