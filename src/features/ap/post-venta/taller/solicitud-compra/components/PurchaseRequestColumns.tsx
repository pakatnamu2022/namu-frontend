import type { ColumnDef } from "@tanstack/react-table";
import { PurchaseRequestResource } from "../lib/purchaseRequest.interface";
import { Badge } from "@/components/ui/badge";
import { PURCHASE_REQUEST_STATUS } from "../lib/purchaseRequest.constants";
import { formatDate } from "@/core/core.function";
import { CopyCell } from "@/shared/components/CopyCell";
import { PurchaseRequestActionsCell } from "./PurchaseRequestActionsCell";

export type PurchaseRequestColumns = ColumnDef<PurchaseRequestResource>;

interface Props {
  onDelete: (id: number) => void;
  onUpdate: (id: number) => void;
  onViewDetail?: (purchaseRequest: PurchaseRequestResource) => void;
  onApprove?: (id: number) => void;
  onCancel?: (id: number) => void;
  onNotifyManagers?: (id: number) => void;
  permissions: {
    canNotify: boolean;
    canApprove: boolean;
    canReject: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export const purchaseRequestColumns = ({
  onUpdate,
  onDelete,
  onViewDetail,
  onApprove,
  onCancel,
  onNotifyManagers,
  permissions,
}: Props): PurchaseRequestColumns[] => [
  {
    accessorKey: "request_number",
    header: "Número de Solicitud",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value ? (
        <CopyCell value={value} className="font-semibold" />
      ) : null;
    },
  },
  {
    accessorKey: "requested_date",
    header: "Fecha Solicitud",
    cell: ({ getValue }) => {
      const date = getValue() as string;
      if (!date) return "-";
      try {
        return formatDate(date);
      } catch {
        return date;
      }
    },
  },
  {
    accessorKey: "requested_by",
    header: "Solicitado Por",
  },
  {
    accessorKey: "warehouse_dyn_code",
    header: "Almacén",
  },
  {
    accessorKey: "ap_order_quotation_id",
    header: "Asociado a Cotización",
    cell: ({ getValue, row }) => {
      const value = getValue() as number | null;
      const quotationNumber = row.original.ap_order_quotation?.quotation_number;
      return value !== null ? (
        <div className="flex items-center gap-2">
          {quotationNumber && (
            <CopyCell value={quotationNumber} className="font-medium" />
          )}
        </div>
      ) : (
        <Badge variant="outline" color="gray">
          NO
        </Badge>
      );
    },
  },
  {
    accessorKey: "observations",
    header: "Observaciones",
    cell: ({ getValue }) => {
      const value = getValue() as string | null;
      return value || "N/A";
    },
  },
  {
    accessorKey: "supplier_order_numbers",
    header: "Orden de Proveedor",
    cell: ({ getValue }) => {
      const value = getValue() as string[] | null;
      if (value && value.length > 0) {
        return value.map((num, index) => (
          <CopyCell key={index} value={num} className="font-medium" />
        ));
      }
      return (
        <Badge variant="outline" color="gray">
          NO
        </Badge>
      );
    },
  },
  {
    accessorKey: "notified_at",
    header: "Notificación",
    cell: ({ getValue }) => {
      const notifiedAt = getValue() as string | null;

      if (!notifiedAt) {
        return (
          <Badge variant="outline" color="gray">
            No notificado
          </Badge>
        );
      }

      let formattedDate = notifiedAt;
      try {
        formattedDate = formatDate(notifiedAt);
      } catch {
        formattedDate = notifiedAt;
      }

      return (
        <div className="flex flex-col items-start gap-1">
          <Badge variant="outline" color="blue">
            Notificado
          </Badge>
          <span className="text-xs text-muted-foreground">{formattedDate}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "reviewed_by_name",
    header: "Revisión",
    cell: ({ row }) => {
      const reviewedByName = row.original.reviewed_by_name;
      const reviewedAt = row.original.reviewed_at;

      if (!reviewedByName && !reviewedAt) {
        return (
          <Badge variant="outline" color="gray">
            No revisado
          </Badge>
        );
      }

      let formattedDate = reviewedAt;
      if (reviewedAt) {
        try {
          formattedDate = formatDate(reviewedAt);
        } catch {
          formattedDate = reviewedAt;
        }
      }

      return (
        <div className="flex flex-col items-start gap-1">
          {reviewedByName ? (
            <span className="font-medium text-foreground">
              {reviewedByName}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">Sin nombre</span>
          )}
          {reviewedAt ? (
            <span className="text-xs text-muted-foreground">
              {formattedDate}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">Sin fecha</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const { status } = row.original;
      const statusText =
        PURCHASE_REQUEST_STATUS[
          status as keyof typeof PURCHASE_REQUEST_STATUS
        ] || status;
      const statusColorMap: Record<
        string,
        "yellow" | "blue" | "green" | "red" | "gray"
      > = {
        pending: "gray",
        ordered: "blue",
        received: "green",
        cancelled: "red",
      };
      const color = statusColorMap[status] ?? "gray";
      return (
        <Badge variant="outline" color={color}>
          {statusText}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => (
      <PurchaseRequestActionsCell
        row={row.original}
        permissions={permissions}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onViewDetail={onViewDetail}
        onApprove={onApprove}
        onCancel={onCancel}
        onNotifyManagers={onNotifyManagers}
      />
    ),
  },
];
