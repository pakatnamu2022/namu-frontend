import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, ThumbsDown, ThumbsUp } from "lucide-react";
import { ButtonAction } from "@/shared/components/ButtonAction";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { Badge } from "@/components/ui/badge";
import { ProposalsResource } from "../lib/proposals.interface";
import { PROPOSALS } from "../lib/proposals.constants";

export type ProposalsColumns = ColumnDef<ProposalsResource>;

interface Props {
  onDelete: (id: number) => void;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
    canApprove: boolean;
    canReject: boolean;
  };
}

const statusColor: Record<string, "default" | "secondary" | "destructive"> = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
};

export const proposalsColumns = ({
  onDelete,
  onApprove,
  onReject,
  permissions,
}: Props): ProposalsColumns[] => [
  {
    id: "activity",
    header: "Actividad",
    cell: ({ row }) => row.original.activity?.name ?? "-",
  },
  {
    id: "supplier",
    header: "Proveedor",
    cell: ({ row }) => row.original.supplier?.full_name ?? "-",
  },
  {
    accessorKey: "amount",
    header: "Monto",
    cell: ({ row }) => {
      const { amount, currency } = row.original;
      return `${currency?.symbol ?? ""} ${Number(amount).toFixed(2)}`;
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const value = (getValue() as string) ?? "pending";
      return (
        <Badge color={statusColor[value] ?? "secondary"} className="capitalize">
          {value}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const router = useNavigate();
      const { id, status } = row.original;
      const { ROUTE_UPDATE } = PROPOSALS;
      const isPending = (status ?? "pending") === "pending";

      return (
        <div className="flex items-center gap-2">
          {isPending && permissions.canApprove && (
            <ButtonAction icon={ThumbsUp} color="green" tooltip="Aprobar" type="button" onClick={() => onApprove(id)} />
          )}
          {isPending && permissions.canReject && (
            <ButtonAction icon={ThumbsDown} color="red" tooltip="Rechazar" type="button" onClick={() => onReject(id)} />
          )}
          {permissions.canUpdate && (
            <ButtonAction
              icon={Pencil}
              tooltip="Editar"
              type="button"
              onClick={() => router(`${ROUTE_UPDATE}/${id}`)}
            />
          )}
          {permissions.canDelete && <DeleteButton onClick={() => onDelete(id)} />}
        </div>
      );
    },
  },
];
