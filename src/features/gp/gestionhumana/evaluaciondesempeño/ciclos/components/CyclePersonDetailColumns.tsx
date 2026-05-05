"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { CyclePersonDetailResource } from "../lib/cyclePersonDetail";
import { EditableCell } from "@/shared/components/EditableCell";
import { ChevronDown, ChevronUp } from "lucide-react";

export type CyclePersonDetailColumn = ColumnDef<CyclePersonDetailResource>;

export const CyclePersonDetailColumns = ({
  onDelete,
  onUpdateGoal,
  onUpdateWeight,
}: {
  onDelete: (id: number) => void;
  onUpdateGoal: (id: number, goal: number) => void;
  onUpdateWeight: (id: number, weight: number) => void;
}): CyclePersonDetailColumn[] => [
  {
    accessorKey: "person",
    header: "Nombres Completos",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-semibold text-primary dark:text-primary-foreground">
          {row.original.person}
        </span>
        <span className="text-xs text-muted-foreground uppercase">
          {row.original.category}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "chief",
    header: "Jefe",
  },
  {
    accessorKey: "position",
    header: "Cargo",
  },
  {
    accessorKey: "sede",
    header: "Sede",
  },
  {
    accessorKey: "area",
    header: "Area",
  },
  {
    accessorKey: "category",
    header: "Categoría",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "objective",
    header: "Objetivo",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-semibold">{row.original.objective}</span>
        <div className="flex gap-1 text-xs text-muted-foreground truncate">
          {row.original.isAscending ? (
            <ChevronUp className="size-4 text-green-600" />
          ) : (
            <ChevronDown className="size-4 text-red-600" />
          )}
          <span>{row.original.objective_description}</span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "goal",
    header: "Meta",
    cell: ({ row }) => (
      <EditableCell
        id={row.original.id}
        value={row.original.goal}
        onUpdate={onUpdateGoal}
      />
    ),
  },
  {
    accessorKey: "weight",
    header: "Peso",
    cell: ({ row }) => (
      <EditableCell
        id={row.original.id}
        value={row.original.weight}
        onUpdate={onUpdateWeight}
      />
    ),
  },
  {
    id: "actions",
    header: "Acciones",
    size: 60,
    cell: ({ row }) => {
      const id = row.original.id;

      return (
        <div className="flex items-center gap-2">
          {/* Delete */}
          <DeleteButton onClick={() => onDelete(id)} />
        </div>
      );
    },
  },
];
