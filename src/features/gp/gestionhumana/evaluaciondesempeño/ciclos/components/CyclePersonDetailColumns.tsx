"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { DeleteButton } from "@/src/shared/components/SimpleDeleteDialog";
import { CyclePersonDetailResource } from "../lib/cyclePersonDetail";
import { EditableCell } from "@/src/shared/components/EditableCell";

export type CyclePersonDetailColumn = ColumnDef<CyclePersonDetailResource>;

export const CyclePersonDetailColumns = ({
  onDelete,
  onUpdateGoal,
}: {
  onDelete: (id: number) => void;
  onUpdateGoal: (id: number, goal: number) => void;
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
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    id: "actions",
    header: "Acciones",
    size: 60,
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
            onClick={() => router.push(`./ciclos/actualizar/${id}`)}
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
