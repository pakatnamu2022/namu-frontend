"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { HierarchicalCategoryObjectiveResource } from "@/features/gp/gestionhumana/evaluaciondesempeño/categoria-objetivo-detalle/lib/hierarchicalCategoryObjective.interface";
import { EditableCell } from "@/shared/components/EditableCell";

export type HierarchicalCategoryObjectiveColumns =
  ColumnDef<HierarchicalCategoryObjectiveResource>;

export const hierarchicalCategoryObjectiveColumns = ({
  onDeleteAction,
  onUpdateGoal,
  onUpdateWeight,
}: {
  onDeleteAction: (id: number) => void;
  onUpdateGoal: (id: number, value: number) => void;
  onUpdateWeight: (id: number, value: number) => void;
}): HierarchicalCategoryObjectiveColumns[] => [
  {
    accessorKey: "objective",
    header: "Objetivo",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
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
    cell: ({ row }) => {
      const id = row.original.id;

      return (
        <div className="flex items-center gap-2">
          {/* Delete */}
          <DeleteButton onClick={() => onDeleteAction(id)} />
        </div>
      );
    },
  },
];
