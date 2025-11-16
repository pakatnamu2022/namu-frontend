import type { ColumnDef } from "@tanstack/react-table";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { EditableCell } from "@/shared/components/EditableCell";
import { ApGoalSellOutInResource } from "../lib/apGoalSellOutIn.interface";

export type ApGoalSellOutInColumns = ColumnDef<ApGoalSellOutInResource>;

interface Props {
  onDelete: (id: number) => void;
  onUpdateGoal: (id: number, newObjetivo: number) => void;
}

export const apGoalSellOutInManageColumns = ({
  onDelete,
  onUpdateGoal,
}: Props): ApGoalSellOutInColumns[] => [
  {
    accessorKey: "shop",
    header: "Tienda",
  },
  {
    accessorKey: "brand",
    header: "Marca",
  },
  {
    accessorKey: "goal",
    header: "Objetivo",
    cell: ({ row }) => {
      const { id, goal } = row.original;

      return (
        <EditableCell
          id={id}
          onUpdate={onUpdateGoal}
          isNumber={true}
          value={goal}
        />
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const { id } = row.original;

      return (
        <div className="flex items-center gap-2 ">
          {/* Delete */}
          <DeleteButton onClick={() => onDelete(id)} />
        </div>
      );
    },
  },
];
