import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { FileText, Pencil, Receipt, X } from "lucide-react";
import { ButtonAction } from "@/shared/components/ButtonAction";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatDateShort } from "@/core/core.function";
import { PurchaseOrdersResource } from "../lib/purchaseOrders.interface";
import {
  MARKETING_PURCHASE_ORDERS,
  PURCHASE_ORDER_CANCELLABLE_STATUSES,
  PURCHASE_ORDER_EDITABLE_STATUSES,
  PURCHASE_ORDER_DELETABLE_STATUSES,
  PURCHASE_ORDER_NEXT_STATUS,
  PURCHASE_ORDER_STATUS_OPTIONS,
} from "../lib/purchaseOrders.constants";
import { SUPPORTS } from "../../sustentos/lib/supports.constants";
import { useElectronicDocuments } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.hook";

export type PurchaseOrdersColumns = ColumnDef<PurchaseOrdersResource>;

interface Props {
  onDelete: (id: number) => void;
  onChangeStatus: (id: number, status: string, electronicDocumentId?: number) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
}

function BilledDocumentPicker({
  selectedId,
  onSelect,
}: {
  selectedId: number | null;
  onSelect: (id: number, fullNumber: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading } = useElectronicDocuments({
    search: debouncedSearch,
    status: "accepted",
    per_page: 10,
  });
  const documents = data?.data ?? [];

  return (
    <div className="space-y-2">
      <Input
        placeholder="Buscar documento electrónico aceptado..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="max-h-48 overflow-y-auto rounded-md border divide-y">
        {isLoading && (
          <div className="p-3 text-center text-sm text-muted-foreground">Buscando...</div>
        )}
        {!isLoading && documents.length === 0 && (
          <div className="p-3 text-center text-sm text-muted-foreground">
            No hay documentos aceptados por SUNAT.
          </div>
        )}
        {documents.map((doc) => (
          <button
            key={doc.id}
            type="button"
            onClick={() => onSelect(doc.id, doc.full_number)}
            className={cn(
              "w-full px-3 py-2 text-left text-sm hover:bg-muted",
              selectedId === doc.id && "bg-muted font-medium",
            )}
          >
            <div>{doc.full_number}</div>
            <div className="text-xs text-muted-foreground">{doc.cliente_denominacion}</div>
          </button>
        ))}
      </div>
    </div>
  );
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
    id: "electronic_document",
    header: "Doc. Electrónico",
    cell: ({ row }) => {
      const doc = row.original.electronic_document;
      if (!doc) return "-";
      return doc.pdf_url ? (
        <a
          href={doc.pdf_url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-xs text-blue-600 underline"
        >
          <FileText className="h-3 w-3" />
          {doc.full_number}
        </a>
      ) : (
        <span className="flex items-center gap-1 text-xs">
          <FileText className="h-3 w-3" />
          {doc.full_number}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [confirmNext, setConfirmNext] = useState(false);
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [confirmCancel, setConfirmCancel] = useState(false);
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
      const value = row.original.status ?? "draft";
      const next = PURCHASE_ORDER_NEXT_STATUS[value];
      const isBillingTransition = next?.value === "billed";
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
                onClick={() => {
                  setSelectedDocId(null);
                  setConfirmNext(true);
                }}
              >
                {next.label}
              </Button>
              <ConfirmationDialog
                open={confirmNext}
                onOpenChange={setConfirmNext}
                trigger={<span className="hidden" />}
                title={`¿${next.label}?`}
                description={
                  isBillingTransition
                    ? "Selecciona el documento electrónico aceptado por SUNAT asociado a esta orden de compra."
                    : `La orden de compra pasará de "${label}" a "${next.label}". ¿Confirmas este cambio de estado?`
                }
                confirmText="Sí, confirmar"
                cancelText="Cancelar"
                icon="info"
                confirmDisabled={isBillingTransition && !selectedDocId}
                onConfirm={() =>
                  onChangeStatus(row.original.id, next.value, selectedDocId ?? undefined)
                }
              >
                {isBillingTransition && (
                  <BilledDocumentPicker
                    selectedId={selectedDocId}
                    onSelect={(id) => setSelectedDocId(id)}
                  />
                )}
              </ConfirmationDialog>
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
      const status = row.original.status ?? "draft";
      const canEditStatus = PURCHASE_ORDER_EDITABLE_STATUSES.includes(status);
      const canDeleteStatus = PURCHASE_ORDER_DELETABLE_STATUSES.includes(status);
      const { ROUTE_UPDATE } = MARKETING_PURCHASE_ORDERS;

      return (
        <div className="flex items-center gap-2">
          <ButtonAction
            icon={Receipt}
            tooltip="Agregar sustento"
            type="button"
            onClick={() => router(`${SUPPORTS.ROUTE_ADD}?purchase_order_id=${id}`)}
          />
          {permissions.canUpdate && canEditStatus && (
            <ButtonAction
              icon={Pencil}
              tooltip="Editar"
              type="button"
              onClick={() => router(`${ROUTE_UPDATE}/${id}`)}
            />
          )}
          {permissions.canDelete && canDeleteStatus && (
            <DeleteButton onClick={() => onDelete(id)} />
          )}
        </div>
      );
    },
  },
];
