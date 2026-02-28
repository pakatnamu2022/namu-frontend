import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Pencil, Eye, Download } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { PurchaseRequestResource } from "../lib/purchaseRequest.interface";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PURCHASE_REQUEST_STATUS } from "../lib/purchaseRequest.constants";
import { errorToast, successToast } from "@/core/core.function";
import { downloadPurchaseRequestPdf } from "../lib/purchaseRequest.actions";
import { CopyCell } from "@/shared/components/CopyCell";

export type PurchaseRequestColumns = ColumnDef<PurchaseRequestResource>;

interface Props {
  onDelete: (id: number) => void;
  onUpdate: (id: number) => void;
  onViewDetail?: (purchaseRequest: PurchaseRequestResource) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export const purchaseRequestColumns = ({
  onUpdate,
  onDelete,
  onViewDetail,
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
    enableSorting: false,
  },
  {
    accessorKey: "requested_date",
    header: "Fecha Solicitud",
    cell: ({ getValue }) => {
      const date = getValue() as string;
      if (!date) return "-";
      try {
        return format(new Date(date), "dd/MM/yyyy", { locale: es });
      } catch {
        return date;
      }
    },
    enableSorting: false,
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
    cell: ({ row }) => {
      const { id, ap_order_quotation_id, supplier_order_numbers } =
        row.original;

      const handleDownloadPdf = async (id: number) => {
        try {
          await downloadPurchaseRequestPdf(id);
          successToast(
            `PDF descargado correctamente para la solicitud de compra`,
          );
        } catch {
          errorToast("Error al descargar el PDF");
        }
      };

      return (
        <div className="flex items-center gap-2">
          {onViewDetail && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              tooltip="Ver Detalle"
              onClick={() => onViewDetail(row.original)}
            >
              <Eye className="size-5" />
            </Button>
          )}

          <Button
            variant="outline"
            size="icon"
            className="size-7"
            tooltip="Descargar PDF"
            onClick={() => handleDownloadPdf(id)}
          >
            <Download className="size-5" />
          </Button>

          {permissions.canUpdate && ap_order_quotation_id === null && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              tooltip="Editar"
              onClick={() => onUpdate(id)}
            >
              <Pencil className="size-5" />
            </Button>
          )}

          {permissions.canDelete &&
            (!supplier_order_numbers ||
              (Array.isArray(supplier_order_numbers) &&
                supplier_order_numbers.length === 0)) && (
              <DeleteButton onClick={() => onDelete(id)} />
            )}
        </div>
      );
    },
  },
];
