import { useNavigate } from "react-router-dom";
import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, ThumbsDown, ThumbsUp } from "lucide-react";
import { ButtonAction } from "@/shared/components/ButtonAction";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { Badge } from "@/components/ui/badge";
import { ProposalsResource } from "../lib/proposals.interface";
import { PROPOSALS, PROPOSAL_STATUS_OPTIONS } from "../lib/proposals.constants";

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
    cell: ({ row }) => {
      const value = row.original.status ?? "pending";
      const label =
        row.original.status_label ??
        (PROPOSAL_STATUS_OPTIONS.find((s) => s.value === value)?.label as string) ??
        value;
      return (
        <Badge color={statusColor[value] ?? "secondary"} className="capitalize">
          {label}
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
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [confirmApprove, setConfirmApprove] = useState(false);
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [confirmReject, setConfirmReject] = useState(false);
      const { id, status } = row.original;
      const { ROUTE_UPDATE } = PROPOSALS;
      const isPending = (status ?? "pending") === "pending";

      return (
        <div className="flex items-center gap-2">
          {isPending && permissions.canApprove && (
            <>
              <ButtonAction icon={ThumbsUp} color="green" tooltip="Aprobar" type="button" onClick={() => setConfirmApprove(true)} />
              <ConfirmationDialog
                open={confirmApprove}
                onOpenChange={setConfirmApprove}
                trigger={<span className="hidden" />}
                title="¿Aprobar propuesta?"
                description="Esta acción aprobará la propuesta del proveedor. ¿Estás seguro de que deseas continuar?"
                confirmText="Sí, aprobar"
                cancelText="Cancelar"
                icon="info"
                onConfirm={() => onApprove(id)}
              />
            </>
          )}
          {isPending && permissions.canReject && (
            <>
              <ButtonAction icon={ThumbsDown} color="red" tooltip="Rechazar" type="button" onClick={() => setConfirmReject(true)} />
              <ConfirmationDialog
                open={confirmReject}
                onOpenChange={setConfirmReject}
                trigger={<span className="hidden" />}
                title="¿Rechazar propuesta?"
                description="Esta acción rechazará la propuesta del proveedor. ¿Estás seguro de que deseas continuar?"
                confirmText="Sí, rechazar"
                cancelText="No, continuar"
                variant="destructive"
                icon="danger"
                onConfirm={() => onReject(id)}
              />
            </>
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
