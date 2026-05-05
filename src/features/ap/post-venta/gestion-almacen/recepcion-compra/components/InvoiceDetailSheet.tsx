import GeneralSheet from "@/shared/components/GeneralSheet.tsx";
import { VehiclePurchaseOrderResource } from "@/features/ap/comercial/ordenes-compra-vehiculo/lib/vehiclePurchaseOrder.interface.ts";
import { formatDate } from "@/core/core.function.ts";
import { Badge } from "@/components/ui/badge.tsx";
import { Calendar, DollarSign, FileText, Package } from "lucide-react";
import { PAYMENT_TERMS_OPTIONS } from "../lib/purchaseOrderProducts.constants";
import { CopyCell } from "@/shared/components/CopyCell";
import { PurchaseOrderItem } from "@/features/ap/comercial/ordenes-compra-vehiculo/lib/vehiclePurchaseOrder.interface.ts";
import {
  DetailSheetTable,
  DetailSheetTableColumn,
} from "@/shared/components/DetailSheetTable";

interface InvoiceDetailSheetProps {
  open: boolean;
  onClose: () => void;
  invoice: VehiclePurchaseOrderResource;
}

export function InvoiceDetailSheet({
  open,
  onClose,
  invoice,
}: InvoiceDetailSheetProps) {
  const getPaymentTermsLabel = (value: string | undefined | null) => {
    if (!value) return "N/A";
    const option = PAYMENT_TERMS_OPTIONS.find((opt) => opt.value === value);
    return option ? option.label : value;
  };

  const itemColumns: DetailSheetTableColumn<PurchaseOrderItem>[] = [
    {
      header: "#",
      render: (_, index) => index + 1,
    },
    {
      header: "Código",
      render: (item) => (
        <div className="space-y-1">
          {item.product_code && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Cód:
              </span>
              <CopyCell
                value={item.product_code}
                className="font-mono text-xs"
              />
            </div>
          )}
          {item.product_dyn_code && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Dyn:
              </span>
              <CopyCell
                value={item.product_dyn_code}
                className="font-mono text-xs"
              />
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Descripción",
      render: (item) => (
        <div>
          <p className="font-medium">{item.product_name}</p>
          {item.description && (
            <p className="text-xs text-muted-foreground">{item.description}</p>
          )}
        </div>
      ),
    },
    {
      header: "Cantidad",
      className: "text-right",
      render: (item) => item.quantity,
    },
    {
      header: "Precio Unit.",
      className: "text-right",
      render: (item) => `${invoice.currency_symbol} ${Number(item.unit_price)}`,
    },
    {
      header: "Total",
      className: "text-right font-semibold",
      render: (item) => `${invoice.currency_symbol}${Number(item.total)}`,
    },
  ];

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title={`Factura ${invoice.invoice_series}-${invoice.invoice_number}`}
      subtitle="Detalle de la factura registrada"
      icon="FileText"
      size="5xl"
    >
      <div className="space-y-6">
        {/* Información de la Factura */}
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">
              Información de la Factura
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">Serie</p>
              <CopyCell
                className="text-sm font-semibold text-foreground"
                value={invoice.invoice_series}
              />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">
                Número
              </p>
              <CopyCell
                className="text-sm font-semibold text-foreground"
                value={invoice.invoice_number}
              />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <Calendar className="size-3" />
                Fecha de Emisión
              </p>
              <p className="text-sm font-semibold text-foreground">
                {formatDate(invoice.emission_date)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <Calendar className="size-3" />
                Fecha de Vencimiento
              </p>
              <p className="text-sm font-semibold text-foreground">
                {invoice.due_date ? formatDate(invoice.due_date) : "N/A"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">
                Orden de Compra
              </p>
              <CopyCell
                className="text-sm font-semibold text-foreground"
                value={invoice.number}
              />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">
                Nota de Ingreso
              </p>
              <CopyCell
                className="text-sm font-semibold text-foreground"
                value={invoice.number_guide}
              />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">
                Moneda
              </p>
              {invoice.currency}
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">
                Términos de Pago
              </p>
              {getPaymentTermsLabel(invoice.payment_terms)}
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">
                Estado
              </p>
              <Badge>{invoice.status ? "Activo" : "Inactivo"}</Badge>
            </div>
          </div>
        </div>

        {/* Información del Proveedor */}
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b">
            <Package className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">
              Información del Proveedor y Ubicación
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">
                Proveedor
              </p>
              <p className="text-sm font-semibold text-foreground">
                {invoice.supplier}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">RUC</p>
              <CopyCell
                className="text-sm font-semibold text-foreground"
                value={invoice.supplier_num_doc}
              />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">Sede</p>
              <Badge variant="outline">{invoice.sede}</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">
                Almacén
              </p>
              <Badge variant="outline">{invoice.warehouse}</Badge>
            </div>
          </div>
        </div>

        {/* Detalle de Productos/Items */}
        <DetailSheetTable
          rows={invoice.items ?? []}
          columns={itemColumns}
          getKey={(item: PurchaseOrderItem, index: number) => item.id ?? index}
          emptyMessage="No hay productos registrados"
        />

        {/* Resumen de Totales */}
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">
              Resumen de Totales
            </h3>
          </div>
          <div className="space-y-2 max-w-md ml-auto">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Subtotal:</span>
              <span className="text-sm font-semibold">
                {invoice.currency_symbol} {Number(invoice.subtotal)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">IGV (18%):</span>
              <span className="text-sm font-semibold">
                {invoice.currency_symbol}
                {Number(invoice.igv)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-base font-semibold">Total:</span>
              <span className="text-lg font-bold text-primary">
                {invoice.currency_symbol} {Number(invoice.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Información Adicional */}
        {invoice.creator && (
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Registrado por: </span>
                <span className="font-medium">{invoice.creator.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">
                  Fecha de registro:{" "}
                </span>
                <span className="font-medium">
                  {formatDate(invoice.created_at)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </GeneralSheet>
  );
}
