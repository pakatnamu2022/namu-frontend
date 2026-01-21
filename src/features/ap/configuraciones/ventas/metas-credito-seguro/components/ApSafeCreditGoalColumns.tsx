import type { ColumnDef } from "@tanstack/react-table";
import { ApSafeCreditGoalResource } from "../lib/apSafeCreditGoal.interface";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";

export type ApSafeCreditGoalColumns = ColumnDef<ApSafeCreditGoalResource>;

interface Props {
  onDelete: (id: number) => void;
  onUpdate: (id: number) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export const apSafeCreditGoalColumns = ({
  onUpdate,
  onDelete,
  permissions,
}: Props): ApSafeCreditGoalColumns[] => [
  {
    accessorKey: "period",
    header: "Período",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="font-semibold">{value}</p>;
    },
  },
  {
    accessorKey: "sede",
    header: "Sede",
  },
  {
    accessorKey: "goal_amount",
    header: "Objetivo",
  },
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return (
        <Badge
          color={value == "CREDITO" ? "default" : "secondary"}
          className="capitalize w-20 flex items-center justify-center"
        >
          {value == "CREDITO" ? "CREDITO" : "SEGURO"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const { id } = row.original;

      return (
        <div className="flex items-center gap-2">
          {/* Edit */}
          {permissions.canUpdate && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => onUpdate(id)}
            >
              <Pencil className="size-5" />
            </Button>
          )}

          {/* Delete */}
          {permissions.canDelete && (
            <DeleteButton onClick={() => onDelete(id)} />
          )}
        </div>
      );
    },
  },
];
