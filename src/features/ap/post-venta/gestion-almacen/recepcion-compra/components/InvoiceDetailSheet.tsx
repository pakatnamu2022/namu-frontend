import GeneralSheet from "@/shared/components/GeneralSheet.tsx";
import { VehiclePurchaseOrderResource } from "@/features/ap/comercial/ordenes-compra-vehiculo/lib/vehiclePurchaseOrder.interface.ts";
import { formatDate } from "@/core/core.function.ts";
import { Badge } from "@/components/ui/badge.tsx";
import { Calendar, DollarSign, FileText, Package } from "lucide-react";
import { PAYMENT_TERMS_OPTIONS } from "../lib/purchaseOrderProducts.constants";

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
              <p className="text-sm font-semibold text-foreground">
                {invoice.invoice_series}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">
                Número
              </p>
              <p className="text-sm font-semibold text-foreground">
                {invoice.invoice_number}
              </p>
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
              <Badge variant="outline">{invoice.number}</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">
                Guía de Remisión
              </p>
              <Badge variant="outline">{invoice.number_guide}</Badge>
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
              <p className="text-sm font-semibold text-foreground">
                {invoice.supplier_num_doc}
              </p>
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
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b">
            <Package className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">
              Detalle de Productos
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">
                    #
                  </th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">
                    Código
                  </th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">
                    Descripción
                  </th>
                  <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">
                    Cantidad
                  </th>
                  <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">
                    Precio Unit.
                  </th>
                  <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.items && invoice.items.length > 0 ? (
                  invoice.items.map((item, index) => (
                    <tr key={item.id || index} className="border-b">
                      <td className="py-2 px-3 text-sm">{index + 1}</td>
                      <td className="py-2 px-3 text-sm">
                        {item.product_code || "N/A"}
                      </td>
                      <td className="py-2 px-3 text-sm">
                        <div>
                          <p className="font-medium">{item.product_name}</p>
                          {item.description && (
                            <p className="text-xs text-muted-foreground">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-3 text-sm text-right">
                        {item.quantity}
                      </td>
                      <td className="py-2 px-3 text-sm text-right">
                        {invoice.currency_symbol} {Number(item.unit_price)}
                      </td>
                      <td className="py-2 px-3 text-sm text-right font-semibold">
                        {invoice.currency_symbol}
                        {Number(item.total)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground text-sm"
                    >
                      No hay productos registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

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
