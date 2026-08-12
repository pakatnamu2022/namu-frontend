import { useNavigate } from "react-router-dom";
import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Receipt, X } from "lucide-react";
import { ButtonAction } from "@/shared/components/ButtonAction";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateShort } from "@/core/core.function";
import { PurchaseOrdersResource } from "../lib/purchaseOrders.interface";
import {
  MARKETING_PURCHASE_ORDERS,
  PURCHASE_ORDER_CANCELLABLE_STATUSES,
  PURCHASE_ORDER_NEXT_STATUS,
  PURCHASE_ORDER_STATUS_OPTIONS,
} from "../lib/purchaseOrders.constants";
import { SUPPORTS } from "../../sustentos/lib/supports.constants";

export type PurchaseOrdersColumns = ColumnDef<PurchaseOrdersResource>;

interface Props {
  onDelete: (id: number) => void;
  onChangeStatus: (id: number, status: string) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export const purchaseOrdersColumns = ({
  onDelete,
  onChangeStatus,
  permissions,
}: Props): PurchaseOrdersColumns[] => [
  {
    accessorKey: "number",
    header: "N° OC",
    cell: ({ getValue }) => (getValue() as string) || "-",
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
    accessorKey: "issue_date",
    header: "Fecha de Emisión",
    cell: ({ getValue }) => formatDateShort(getValue() as string),
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [confirmNext, setConfirmNext] = useState(false);
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [confirmCancel, setConfirmCancel] = useState(false);
      const value = row.original.status ?? "draft";
      const next = PURCHASE_ORDER_NEXT_STATUS[value];
      const canCancel = PURCHASE_ORDER_CANCELLABLE_STATUSES.includes(value);
      const label =
        row.original.status_label ??
        (PURCHASE_ORDER_STATUS_OPTIONS.find((s) => s.value === value)?.label as string) ??
        value;
      return (
        <div className="flex items-center gap-2">
          <Badge className="capitalize">{label}</Badge>
          {permissions.canUpdate && next && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-xs"
                onClick={() => setConfirmNext(true)}
              >
                {next.label}
              </Button>
              <ConfirmationDialog
                open={confirmNext}
                onOpenChange={setConfirmNext}
                trigger={<span className="hidden" />}
                title={`¿${next.label}?`}
                description={`La orden de compra pasará de "${label}" a "${next.label}". ¿Confirmas este cambio de estado?`}
                confirmText="Sí, confirmar"
                cancelText="Cancelar"
                icon="info"
                onConfirm={() => onChangeStatus(row.original.id, next.value)}
              />
            </>
          )}
          {permissions.canUpdate && canCancel && (
            <>
              <ButtonAction
                icon={X}
                color="red"
                tooltip="Cancelar orden de compra"
                type="button"
                onClick={() => setConfirmCancel(true)}
              />
              <ConfirmationDialog
                open={confirmCancel}
                onOpenChange={setConfirmCancel}
                trigger={<span className="hidden" />}
                title="¿Cancelar orden de compra?"
                description="Esta acción marcará la orden de compra como cancelada. ¿Estás seguro de que deseas continuar?"
                confirmText="Sí, cancelar"
                cancelText="No, continuar"
                variant="destructive"
                icon="danger"
                onConfirm={() => onChangeStatus(row.original.id, "cancelled")}
              />
            </>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const router = useNavigate();
      const { id } = row.original;
      const { ROUTE_UPDATE } = MARKETING_PURCHASE_ORDERS;

      return (
        <div className="flex items-center gap-2">
          <ButtonAction
            icon={Receipt}
            tooltip="Agregar sustento"
            type="button"
            onClick={() => router(`${SUPPORTS.ROUTE_ADD}?purchase_order_id=${id}`)}
          />
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
