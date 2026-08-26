import type { ColumnDef } from "@tanstack/react-table";
import { CampaignScheduleResource } from "../lib/campaignSchedule.interface";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";

export type CampaignScheduleColumns = ColumnDef<CampaignScheduleResource>;

interface Props {
  onDelete: (id: number) => void;
  permissions: {
    canDelete: boolean;
  };
}

export const campaignScheduleColumns = ({
  onDelete,
  permissions,
}: Props): CampaignScheduleColumns[] => [
  {
    accessorKey: "sede",
    header: "Sede",
    cell: ({ row }) => {
      const sede = row.original.sede;
      return sede && <p className="font-semibold">{sede.abreviatura}</p>;
    },
  },
  {
    accessorKey: "date",
    header: "Fecha",
  },
  {
    accessorKey: "worker",
    header: "Técnico",
    cell: ({ row }) => {
      const worker = row.original.worker;
      return worker && <p>{worker.nombre_completo}</p>;
    },
  },
  {
    accessorKey: "creator",
    header: "Registrado por",
    cell: ({ row }) => {
      const creator = row.original.creator;
      return <p className="text-muted-foreground">{creator?.name ?? "-"}</p>;
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const { id } = row.original;

      return (
        <div className="flex items-center justify-center gap-2">
          {permissions.canDelete && (
            <DeleteButton onClick={() => onDelete(id)} />
          )}
        </div>
      );
    },
  },
];
