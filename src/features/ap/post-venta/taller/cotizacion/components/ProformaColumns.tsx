import type { ColumnDef } from "@tanstack/react-table";
import { Calendar } from "lucide-react";
import { OrderQuotationResource } from "../lib/proforma.interface";
import { Badge } from "@/components/ui/badge";
import { ProformaActionsCell } from "./ProformaActionsCell";
import { CopyCell } from "@/shared/components/CopyCell";
import { formatDate } from "@/core/core.function";

export type OrderQuotationColumns = ColumnDef<OrderQuotationResource>;

interface Props {
  onDelete: (id: number) => void;
  onUpdate: (id: number) => void;
  onManage: (id: number) => void;
  onApprove: (id: number) => void;
  onDuplicate: (id: number) => void;
  onSendNotification: (id: number) => void;
  permissions: {
    canApprove: boolean;
    canDuplicate: boolean;
    canManage: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  };
}

const getQuotationStatus = (
  quotationDate: string | null | undefined,
  isTakeOt: boolean,
): "Aperturada" | "Vencida" | "Aceptada" => {
  if (!quotationDate) return "Aperturada";

  const createdAt = new Date(quotationDate);
  if (Number.isNaN(createdAt.getTime())) return "Aperturada";

  const expirationByRule = new Date(createdAt);
  expirationByRule.setDate(expirationByRule.getDate() + 15);

  const today = new Date();
  const expired = today > expirationByRule;

  if (isTakeOt) return "Aceptada";
  if (expired) return "Vencida";
  return "Aperturada";
};

export const orderQuotationColumns = ({
  onUpdate,
  onManage,
  onDelete,
  onApprove,
  onDuplicate,
  onSendNotification,
  permissions,
}: Props): OrderQuotationColumns[] => [
  {
    accessorKey: "quotation_number",
    header: "Número de Cotización",
    cell: ({ getValue, row }) => {
      const value = getValue() as string;
      const plate = row.original.vehicle?.plate;
      return (
        <div className="flex flex-col gap-0.5">
          {value && <CopyCell className="font-semibold" value={value} />}
          {plate && (
            <CopyCell
              className="text-muted-foreground"
              size="xs"
              value={plate}
            />
          )}
        </div>
      );
    },
  },
  {
    id: "dates",
    header: "Fechas",
    cell: ({ row }) => {
      const opening = row.original.quotation_date;
      const estimated = row.original.expiration_date;
      const fmt = (v: string) => {
        try {
          return formatDate(v);
        } catch {
          return v;
        }
      };
      return (
        <div className="flex flex-col gap-0.5 text-xs">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Apertura:</span>
            {opening ? fmt(opening) : "-"}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Vencimiento:</span>
            {estimated ? fmt(estimated) : "-"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "client.full_name",
    header: "Cliente",
  },
  {
    accessorKey: "type_currency.name",
    header: "Moneda",
  },
  {
    accessorKey: "total_amount",
    header: "Total Monto",
    cell: ({ getValue, row }) => {
      const amount = getValue() as number;
      const currencySymbol = row.original.type_currency?.symbol || "S/.";
      return `${currencySymbol} ${Number(amount || 0).toFixed(2)}`;
    },
  },
  {
    accessorKey: "observations",
    header: "Observaciones",
  },
  {
    accessorKey: "created_by_name",
    header: "Creado por",
  },
  {
    accessorKey: "has_management_discount",
    header: "Dcto. Gerencial",
    cell: ({ getValue }) => {
      const value = getValue() as boolean;
      return (
        <Badge variant="outline" color={value ? "green" : "gray"}>
          {value ? "Sí" : "No"}
        </Badge>
      );
    },
  },
  {
    id: "approvals",
    header: "Aprobado por",
    cell: ({ row }) => {
      const approvals = [
        {
          label: "Jefe",
          name: row.original.chief_approval_by_name,
        },
        {
          label: "Gerente",
          name: row.original.manager_approval_by_name,
        },
      ].filter((approval) => !!approval.name);

      if (approvals.length === 0) {
        return <span className="text-muted-foreground">-</span>;
      }

      return (
        <div className="flex flex-col gap-1.5 min-w-0">
          {approvals.map((approval) => (
            <div
              key={approval.label}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-muted/50 px-2 py-1 text-xs"
            >
              <Badge variant="outline" color="blue" className="shrink-0">
                {approval.label}
              </Badge>
              <span className="truncate font-medium text-foreground">
                {approval.name}
              </span>
            </div>
          ))}
        </div>
      );
    },
  },
  {
    id: "status",
    header: "Estado",
    cell: ({ row }) => {
      const isTakeOt = Boolean(row.original.is_take_ot);
      const status = getQuotationStatus(row.original.quotation_date, isTakeOt);

      return (
        <Badge
          variant="outline"
          color={
            status === "Aceptada"
              ? "green"
              : status === "Vencida"
                ? "red"
                : "blue"
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => (
      <ProformaActionsCell
        row={row.original}
        permissions={permissions}
        onManage={onManage}
        onSendNotification={onSendNotification}
        onApprove={onApprove}
        onDuplicate={onDuplicate}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    ),
  },
];
