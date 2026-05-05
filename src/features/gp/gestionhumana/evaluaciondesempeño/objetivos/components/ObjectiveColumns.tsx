"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ObjectiveResource } from "../lib/objective.interface";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, Pencil } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { EditableCell } from "@/shared/components/EditableCell";
import { Badge } from "@/components/ui/badge";

export type ObjectiveColumns = ColumnDef<ObjectiveResource>;

export const objectiveColumns = ({
  onDelete,
  onEdit,
  onUpdateGoal,
  onUpdateWeight,
}: {
  onDelete: (id: number) => void;
  onEdit: (objective: ObjectiveResource) => void;
  onUpdateGoal: (id: number, goal: number) => void;
  onUpdateWeight: (id: number, weight: number) => void;
}): ObjectiveColumns[] => [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ row }) => {
      const name = row.original.name;
      const description = row.original.description;
      return (
        <div>
          <span className="font-semibold line-clamp-1 text-wrap!">{name}</span>
          <span className="text-xs line-clamp-1 text-wrap!">{description}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Descripción",
    cell: ({ getValue }) => (
      <span className="line-clamp-1 text-wrap!">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "goalReference",
    header: "Meta",
    cell: ({ row }) => (
      <EditableCell
        widthClass="w-28"
        id={row.original.id}
        value={row.original.goalReference}
        onUpdate={onUpdateGoal}
      />
    ),
  },
  {
    accessorKey: "fixedWeight",
    header: "Peso Fijo",
    cell: ({ row }) => (
      <EditableCell
        id={row.original.id}
        value={row.original.fixedWeight}
        onUpdate={onUpdateWeight}
      />
    ),
  },
  {
    accessorKey: "isAscending",
    header: "Lógica",
    cell: ({ getValue }) => (
      <Badge color={getValue() ? "default" : "destructive"}>
        {getValue() ? (
          <ArrowUp className="size-4" />
        ) : (
          <ArrowDown className="size-4" />
        )}
        {getValue() ? "Ascendente" : "Descendente"}
      </Badge>
    ),
  },
  {
    accessorKey: "metric",
    header: "Métrica",
    cell: ({ getValue }) => (
      <Badge className="px-4" variant="outline">
        {getValue() as string}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const objective = row.original;

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => onEdit(objective)}
          >
            <Pencil className="size-5" />
          </Button>
          <DeleteButton onClick={() => onDelete(objective.id)} />
        </div>
      );
    },
  },
];
