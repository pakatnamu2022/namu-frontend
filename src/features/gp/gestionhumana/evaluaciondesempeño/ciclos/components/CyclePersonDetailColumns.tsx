"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { CyclePersonDetailResource } from "../lib/cyclePersonDetail";
import { EditableCell } from "@/shared/components/EditableCell";

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
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
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
