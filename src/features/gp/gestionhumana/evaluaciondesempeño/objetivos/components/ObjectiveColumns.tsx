"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ObjectiveResource } from "../lib/objective.interface";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { DeleteButton } from "@/src/shared/components/SimpleDeleteDialog";
import { EditableCell } from "@/src/shared/components/EditableCell";
import { Badge } from "@/components/ui/badge";

export type ObjectiveColumns = ColumnDef<ObjectiveResource>;

export const objectiveColumns = ({
  onDelete,
  onUpdateGoal,
  onUpdateWeight,
}: {
  onDelete: (id: number) => void;
  onUpdateGoal: (id: number, goal: number) => void;
  onUpdateWeight: (id: number, weight: number) => void;
}): ObjectiveColumns[] => [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ getValue }) => (
      <span className="font-semibold line-clamp-1 !text-wrap">
        {getValue() as string}
      </span>
    ),
  },
  {
    accessorKey: "description",
    header: "Descripción",
    cell: ({ getValue }) => (
      <span className="line-clamp-1 !text-wrap">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "goalReference",
    header: "Meta",
    cell: ({ row }) => (
      <EditableCell
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
      <Badge variant={getValue() ? "default" : "destructive"}>
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
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const router = useRouter();
      const id = row.original.id;

      return (
        <div className="flex items-center gap-2">
          {/* Edit */}
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => router.push(`./objetivos/actualizar/${id}`)}
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
