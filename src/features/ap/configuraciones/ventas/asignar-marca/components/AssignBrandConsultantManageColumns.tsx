import { ColumnDef } from "@tanstack/react-table";
import { AssignBrandConsultantResource } from "../lib/assignBrandConsultant.interface";
import { DeleteButton } from "@/src/shared/components/SimpleDeleteDialog";
import { EditableCell } from "@/src/shared/components/EditableCell";

export type AssignBrandConsultantColumns =
  ColumnDef<AssignBrandConsultantResource>;

interface Props {
  onDelete: (id: number) => void;
  onUpdateGoal: (id: number, newObjetivo: number) => void;
}

export const assignBrandConsultantManageColumns = ({
  onDelete,
  onUpdateGoal,
}: Props): AssignBrandConsultantColumns[] => [
  {
    accessorKey: "worker",
    header: "Asesor",
  },
  {
    accessorKey: "sales_target",
    header: "Objetivo",
    cell: ({ row }) => {
      const { id, sales_target } = row.original;

      return (
        <EditableCell
          id={id}
          onUpdate={onUpdateGoal}
          isNumber={true}
          value={sales_target}
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
