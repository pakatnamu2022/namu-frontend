import type { ColumnDef } from "@tanstack/react-table";
import { Eye, ThumbsUp, ThumbsDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { NumberFormat } from "@/shared/components/NumberFormat";
import { ButtonAction } from "@/shared/components/ButtonAction";
import { AdjustmentRequestResource } from "../lib/purchaseRequestQuoteAdjustment.interface";
import {
  ADJUSTMENT_STATUS_COLOR,
  ADJUSTMENT_STATUS_LABEL,
  ADJUSTMENT_STATUS_PENDING,
} from "../lib/purchaseRequestQuoteAdjustment.constants";

export type AdjustmentRequestColumns = ColumnDef<AdjustmentRequestResource>;

interface Props {
  onViewDetail: (id: number) => void;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  permissions: {
    canApproveAdjustment: boolean;
    canRejectAdjustment: boolean;
  };
}

export const adjustmentRequestColumns = ({
  onViewDetail,
  onApprove,
  onReject,
  permissions,
}: Props): AdjustmentRequestColumns[] => [
  {
    accessorKey: "quote_correlative",
    header: "Cotización",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "holder_name",
    header: "Titular",
  },
  {
    accessorKey: "requested_by_name",
    header: "Solicitado por",
  },
  {
    accessorKey: "created_at",
    header: "Fecha",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return <span>{new Date(value).toLocaleDateString("es-PE")}</span>;
    },
  },
  {
    id: "margin",
    header: "Margen Antes → Después",
    cell: ({ row }) => {
      const { margin_amount_before, margin_amount_after } = row.original;
      const delta = margin_amount_after - margin_amount_before;
      return (
        <div className="flex flex-col text-xs">
          <span>
            S/ <NumberFormat value={margin_amount_before.toFixed(2)} /> → S/{" "}
            <NumberFormat value={margin_amount_after.toFixed(2)} />
          </span>
          <span
            className={`font-semibold ${delta >= 0 ? "text-emerald-600" : "text-red-600"}`}
          >
            {delta >= 0 ? "+" : ""}
            <NumberFormat value={delta.toFixed(2)} />
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const status = getValue() as string;
      return (
        <Badge color={ADJUSTMENT_STATUS_COLOR[status] ?? "gray"}>
          {ADJUSTMENT_STATUS_LABEL[status] ?? status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const { id, status } = row.original;
      const isPending = status === ADJUSTMENT_STATUS_PENDING;
      return (
        <div className="flex items-center gap-2">
          <ButtonAction
            icon={Eye}
            tooltip="Ver Detalle"
            onClick={() => onViewDetail(id)}
          />
          <ButtonAction
            icon={ThumbsUp}
            tooltip="Aprobar"
            color="emerald"
            onClick={() => onApprove(id)}
            canRender={isPending && permissions.canApproveAdjustment}
          />
          <ButtonAction
            icon={ThumbsDown}
            tooltip="Rechazar"
            color="red"
            onClick={() => onReject(id)}
            canRender={isPending && permissions.canRejectAdjustment}
          />
        </div>
      );
    },
  },
];
