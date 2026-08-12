import type { ColumnDef } from "@tanstack/react-table";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { Badge } from "@/components/ui/badge";
import { formatDateShort } from "@/core/core.function";
import { SupportsResource } from "../lib/supports.interface";
import { SUPPORT_TYPE_OPTIONS } from "../lib/supports.constants";

export type SupportsColumns = ColumnDef<SupportsResource>;

interface Props {
  onDelete: (id: number) => void;
  permissions: {
    canDelete: boolean;
  };
}

export const supportsColumns = ({ onDelete, permissions }: Props): SupportsColumns[] => [
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return <Badge color="secondary">{(SUPPORT_TYPE_OPTIONS.find((t) => t.value === value)?.label as string) ?? value}</Badge>;
    },
  },
  {
    id: "document",
    header: "Documento",
    cell: ({ row }) => {
      const { document_series, document_number } = row.original;
      if (!document_series && !document_number) return "-";
      return `${document_series ?? ""}-${document_number ?? ""}`;
    },
  },
  {
    id: "reference",
    header: "Referencia",
    cell: ({ row }) => row.original.activity?.name ?? row.original.purchase_order?.number ?? "-",
  },
  {
    accessorKey: "issue_date",
    header: "Fecha",
    cell: ({ getValue }) => formatDateShort(getValue() as string),
  },
  {
    accessorKey: "amount",
    header: "Monto",
    cell: ({ row }) => {
      const { amount, currency } = row.original;
      if (amount === null) return "-";
      return `${currency?.symbol ?? ""} ${Number(amount).toFixed(2)}`;
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) =>
      permissions.canDelete && <DeleteButton onClick={() => onDelete(row.original.id)} />,
  },
];
