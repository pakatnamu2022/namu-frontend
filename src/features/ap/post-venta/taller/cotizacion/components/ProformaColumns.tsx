import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Pencil, Download, Settings, ClipboardCheck } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { errorToast, successToast } from "@/core/core.function";
import { OrderQuotationResource } from "../lib/proforma.interface";
import { downloadOrderQuotationPdf } from "../lib/proforma.actions";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type OrderQuotationColumns = ColumnDef<OrderQuotationResource>;

interface Props {
  onDelete: (id: number) => void;
  onUpdate: (id: number) => void;
  onManage: (id: number) => void;
  onApprove: (id: number) => void;
  permissions: {
    canApprove: boolean;
    canManage: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  };
}

const getQuotationStatus = (
  quotationDate: string | null | undefined,
  isTake: boolean,
): "Aperturada" | "Vencida" | "Aceptada" => {
  if (!quotationDate) return "Aperturada";

  const createdAt = new Date(quotationDate);
  if (Number.isNaN(createdAt.getTime())) return "Aperturada";

  const expirationByRule = new Date(createdAt);
  expirationByRule.setDate(expirationByRule.getDate() + 15);

  const today = new Date();
  const expired = today > expirationByRule;

  if (expired && isTake) return "Aceptada";
  if (expired) return "Vencida";
  return "Aperturada";
};

export const orderQuotationColumns = ({
  onUpdate,
  onManage,
  onDelete,
  onApprove,
  permissions,
}: Props): OrderQuotationColumns[] => [
  {
    accessorKey: "quotation_number",
    header: "Número de Cotización",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="font-semibold">{value}</p>;
    },
  },
  {
    accessorKey: "client.full_name",
    header: "Cliente",
  },
  {
    accessorKey: "quotation_date",
    header: "Fecha de Cotización",
    cell: ({ getValue }) => {
      const date = getValue() as string;
      if (!date) return "-";
      try {
        return format(new Date(date), "dd/MM/yyyy", { locale: es });
      } catch {
        return date;
      }
    },
  },
  {
    accessorKey: "expiration_date",
    header: "Fecha de Vencimiento",
    cell: ({ getValue }) => {
      const date = getValue() as string;
      if (!date) return "-";
      try {
        return format(new Date(date), "dd/MM/yyyy", { locale: es });
      } catch {
        return date;
      }
    },
  },
  {
    accessorKey: "vehicle.plate",
    header: "Placa",
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
    accessorKey: "is_take",
    header: "Aceptada",
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
    accessorKey: "chief_approval_by",
    header: "Aprob. Jefe",
    cell: ({ getValue }) => {
      const value = getValue() as string | null;
      return (
        <Badge variant="outline" color={value ? "green" : "red"}>
          {value ? "Sí" : "No"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "manager_approval_by",
    header: "Aprob. Gerente",
    cell: ({ getValue }) => {
      const value = getValue() as string | null;
      return (
        <Badge variant="outline" color={value ? "green" : "red"}>
          {value ? "Sí" : "No"}
        </Badge>
      );
    },
  },
  {
    id: "status",
    header: "Estado",
    cell: ({ row }) => {
      const isTake = !!(row.getValue("is_take") as boolean | undefined);
      const status = getQuotationStatus(row.original.quotation_date, isTake);

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
    cell: ({ row }) => {
      const {
        id,
        chief_approval_by,
        manager_approval_by,
        has_management_discount,
      } = row.original;
      const isFullyApproved = !!chief_approval_by && !!manager_approval_by;
      const isLocked = isFullyApproved || !!has_management_discount;

      const handleDownloadPdf = async (withCode: boolean) => {
        try {
          await downloadOrderQuotationPdf(id, withCode);
          successToast("PDF descargado correctamente");
        } catch {
          errorToast("Error al descargar el PDF");
        }
      };

      return (
        <div className="flex items-center gap-2">
          {permissions.canManage && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => onManage(id)}
              tooltip="Gestionar"
            >
              <Settings className="size-5" />
            </Button>
          )}

          {permissions.canApprove && !isFullyApproved && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => onApprove(id)}
              tooltip="Aprobar"
            >
              <ClipboardCheck className="size-5" />
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-7"
                tooltip="Descargar PDF"
              >
                <Download className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleDownloadPdf(true)}>
                <Download className="size-4 mr-2" />
                PDF con código
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDownloadPdf(false)}>
                <Download className="size-4 mr-2" />
                PDF sin código
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {permissions.canUpdate && !isLocked && (
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

          {permissions.canDelete && !isLocked && (
            <DeleteButton onClick={() => onDelete(id)} />
          )}
        </div>
      );
    },
  },
];
