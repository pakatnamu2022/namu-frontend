import { ColumnDef } from "@tanstack/react-table";
import { GoalTravelControlResource } from "../lib/GoalTravelControl.interface";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Pencil, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";

export type GoalTravelColumns = ColumnDef<GoalTravelControlResource>;

interface Props {
  onDelete: (id: number) => void;
  onUpdate: (id: number) => void;
}

export const goalTravelColumns = ({
  onUpdate,
  onDelete,
}: Props): GoalTravelColumns[] => [
  {
    accessorKey: "date",
    header: "Periodo",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return <Badge variant="outline">{value}</Badge>;
    },
  },
  {
    accessorKey: "total",
    header: "Meta Total",
  },
  {
    accessorKey: "driver_goal",
    header: "Meta Conductor",
  },
  {
    accessorKey: "vehicle_goal",
    header: "Meta Conductor",
  },
  {
    accessorKey: "total_units",
    header: "Total Unidades",
  },
  {
    accessorKey: "status_deleted",
    header: "Estado",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return (
        <Badge variant="outline" className="capitalize gap-2">
          {value === 1 ? (
            <CheckCircle className="size-4 text-primary" />
          ) : (
            <XCircle className="size-4 text-secondary" />
          )}
          {value === 1 ? "Activo" : "Inactivo"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const id = row.original.id;

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => onUpdate(id)}
          >
            <Pencil className="size-5" />
          </Button>

          <DeleteButton onClick={() => onDelete(id)} />
        </div>
      );
    },
  },
];
