import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Receipt } from "lucide-react";
import { ButtonAction } from "@/shared/components/ButtonAction";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { formatDateShort } from "@/core/core.function";
import { PurchaseOrdersResource } from "../lib/purchaseOrders.interface";
import {
  MARKETING_PURCHASE_ORDERS,
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
      const value = row.original.status ?? "draft";
      if (!permissions.canUpdate) {
        return (
          <span className="capitalize text-xs">
            {(PURCHASE_ORDER_STATUS_OPTIONS.find((s) => s.value === value)?.label as string) ?? value}
          </span>
        );
      }
      return (
        <select
          className="text-xs border rounded-md px-2 py-1 bg-background"
          value={value}
          onChange={(e) => onChangeStatus(row.original.id, e.target.value)}
        >
          {PURCHASE_ORDER_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label as string}
            </option>
          ))}
        </select>
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
