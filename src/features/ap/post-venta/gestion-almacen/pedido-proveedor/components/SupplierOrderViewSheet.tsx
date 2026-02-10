import { useEffect, useState } from "react";
import GeneralSheet from "@/shared/components/GeneralSheet.tsx";
import { SupplierOrderResource } from "@/features/ap/post-venta/gestion-almacen/pedido-proveedor/lib/supplierOrder.interface.ts";
import { getSupplierOrderById } from "@/features/ap/post-venta/gestion-almacen/pedido-proveedor/lib/supplierOrder.actions.ts";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Loader2, FileText } from "lucide-react";
import { Separator } from "@/components/ui/separator.tsx";

interface SupplierOrderViewSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: number | null;
}

export function SupplierOrderViewSheet({
  open,
  onOpenChange,
  orderId,
}: SupplierOrderViewSheetProps) {
  const [data, setData] = useState<SupplierOrderResource | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (orderId && open) {
        setIsLoading(true);
        try {
          const response = await getSupplierOrderById(orderId);
          setData(response);
        } catch (error) {
          console.error("Error fetching supplier order:", error);
          setData(null);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [orderId, open]);

  const handleClose = () => {
    onOpenChange(false);
    // Limpiamos los datos cuando se cierra
    setTimeout(() => setData(null), 300);
  };

  if (!open) return null;

  const currencySymbol = data?.type_currency?.symbol || "S/.";

  // Obtener montos del pedido desde el API
  const netAmount = Number(data?.net_amount) || 0;
  const taxAmount = Number(data?.tax_amount) || 0;
  const totalAmount = Number(data?.total_amount) || 0;

  const invoiceTotal = data?.invoice ? Number(data.invoice.total) : 0;

  // Verificar si los montos coinciden (con tolerancia de 0.01 para decimales)
  const totalsMatch = data?.invoice
    ? Math.abs(totalAmount - invoiceTotal) < 0.01
    : true;

  return (
    <GeneralSheet
      open={open}
      onClose={handleClose}
      title="Detalles del Pedido a Proveedor"
      subtitle="Vista completa del pedido"
      icon="FileText"
      size="4xl"
    >
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !data ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">
            No se pudo cargar la información del pedido
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Información General */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground">Nº Pedido</p>
              <p className="font-semibold">{data.order_number}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Fecha de Pedido</p>
              <p className="font-medium">{data.order_date}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tipo Abast.</p>
              {data.supply_type}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tiene Recepiones</p>
              <Badge color={data.has_receptions ? "default" : "destructive"}>
                {data.has_receptions ? "Sí" : "No"}
              </Badge>
            </div>
          </div>

          {/* Información del Proveedor y Almacén */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-sm mb-3">
                Información del Proveedor
              </h3>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Razón Social / Nombre
                  </p>
                  <p className="font-medium text-sm">
                    {data.supplier?.full_name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">RUC/DNI</p>
                  <p className="font-medium text-sm">
                    {data.supplier?.num_doc || "N/A"}
                  </p>
                </div>
                {data.supplier?.direction && (
                  <div>
                    <p className="text-xs text-muted-foreground">Dirección</p>
                    <p className="font-medium text-sm">
                      {data.supplier.direction}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-sm mb-3">
                Información de Almacén
              </h3>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Sede</p>
                  <p className="font-medium text-sm">
                    {data.sede?.abreviatura || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Almacén</p>
                  <p className="font-medium text-sm">
                    {data.warehouse?.description || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Moneda</p>
                  <p className="font-medium text-sm">
                    {data.type_currency?.name || "N/A"} (
                    {data.type_currency?.code || "N/A"})
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Solicitudes de Compra Asociadas */}
          {data.purchase_requests && data.purchase_requests.length > 0 && (
            <div className="p-4 border rounded-lg bg-blue-50/30">
              <h3 className="font-semibold text-sm mb-3">
                Solicitudes de Compra Asociadas
              </h3>
              <div className="space-y-2">
                {data.purchase_requests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-2 bg-white rounded border"
                  >
                    <div>
                      <p className="text-xs text-muted-foreground">
                        N° Solicitud
                      </p>
                      <p className="font-semibold text-sm">
                        {request.request_number}
                      </p>
                    </div>
                    <div className="text-end">
                      <p className="text-xs text-muted-foreground">
                        Solicitado por
                      </p>
                      <p className="font-medium text-sm">
                        {request.requested_by_name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Información de la Factura Asociada */}
          {data.invoice && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Factura de Compra Asociada
                  </h3>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    Factura Registrada
                  </Badge>
                </div>

                {/* Información básica de la factura */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-muted/30 p-3 border-b">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          N° Factura
                        </p>
                        <p className="text-sm font-semibold">
                          {data.invoice.invoice_series}-
                          {data.invoice.invoice_number}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          N° Interno
                        </p>
                        <p className="text-sm font-medium">
                          {data.invoice.number || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Fecha Emisión
                        </p>
                        <p className="text-sm font-medium">
                          {data.invoice.emission_date
                            ? format(
                                new Date(
                                  data.invoice.emission_date + "T00:00:00",
                                ),
                                "dd/MM/yyyy",
                                { locale: es },
                              )
                            : "N/A"}
                        </p>
                      </div>
                      {data.invoice.due_date && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Vencimiento
                          </p>
                          <p className="text-sm font-medium">
                            {format(
                              parseISO(data.invoice.due_date),
                              "dd/MM/yyyy",
                              { locale: es },
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Resumen de montos */}
                  <div className="p-4 bg-linear-to-br from-green-50/50 to-emerald-50/50">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-white rounded-lg border border-green-100">
                        <p className="text-xs text-muted-foreground mb-1">
                          Subtotal
                        </p>
                        <p className="text-base font-semibold text-gray-700">
                          {data.invoice.currency_code === "USD" ? "$" : "S/."}{" "}
                          {Number(data.invoice.subtotal).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg border border-green-100">
                        <p className="text-xs text-muted-foreground mb-1">
                          IGV (18%)
                        </p>
                        <p className="text-base font-semibold text-gray-700">
                          {data.invoice.currency_code === "USD" ? "$" : "S/."}{" "}
                          {Number(data.invoice.igv).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-green-100 rounded-lg border border-green-200">
                        <p className="text-xs font-medium text-green-800 mb-1">
                          Total Factura
                        </p>
                        <p className="text-lg font-bold text-green-700">
                          {data.invoice.currency_code === "USD" ? "$" : "S/."}{" "}
                          {Number(data.invoice.total).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Tabla de Productos */}
          <div className="border rounded-lg">
            <div className="p-4 bg-muted/50 border-b">
              <h3 className="font-semibold text-sm">Productos Solicitados</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-center">Cantidad</TableHead>
                  <TableHead className="text-end">Precio Unit.</TableHead>
                  <TableHead className="text-end">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.details && data.details.length > 0 ? (
                  data.details.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            {item.product?.name || "N/A"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Código: {item.product?.code || "N/A"}
                          </span>
                          {item.note && (
                            <span className="text-xs text-muted-foreground italic">
                              Nota: {item.note}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-end">
                        {currencySymbol}{" "}
                        {Number(item.unit_price)
                          .toFixed(4)
                          .replace(/\.?0+$/, "")}
                      </TableCell>
                      <TableCell className="text-end font-semibold">
                        {currencySymbol}{" "}
                        {Number(item.total)
                          .toFixed(4)
                          .replace(/\.?0+$/, "")}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <p className="text-muted-foreground">
                        No hay productos en este pedido
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Desglose de Montos del Pedido */}
          <Separator />
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Resumen del Pedido</h3>
            <div className="border rounded-lg p-4 bg-slate-50/50">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">
                    Valor de Venta Neta:
                  </span>
                  <span className="font-medium">
                    {currencySymbol} {netAmount.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">IGV (18%):</span>
                  <span className="font-medium">
                    {currencySymbol} {taxAmount.toFixed(2)}
                  </span>
                </div>

                <div className="border-t pt-2 mt-2"></div>

                <div className="flex justify-between items-center">
                  <span className="font-semibold">Importe Total:</span>
                  <span className="font-bold text-lg text-primary">
                    {currencySymbol} {totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Comparación de Totales con Factura */}
          {data.invoice && (
            <div className="space-y-4">
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Total del Pedido */}
                <div
                  className={`p-4 rounded-lg border-2 ${
                    totalsMatch
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="text-center">
                    <p
                      className={`text-xs font-medium mb-2 ${
                        totalsMatch ? "text-green-800" : "text-red-800"
                      }`}
                    >
                      Total del Pedido
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        totalsMatch ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {currencySymbol} {totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Total de la Factura */}
                <div
                  className={`p-4 rounded-lg border-2 ${
                    totalsMatch
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="text-center">
                    <p
                      className={`text-xs font-medium mb-2 ${
                        totalsMatch ? "text-green-800" : "text-red-800"
                      }`}
                    >
                      Total de la Factura
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        totalsMatch ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {data.invoice.currency_code === "USD" ? "$" : "S/."}{" "}
                      {invoiceTotal.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mensaje de validación */}
              <div
                className={`p-3 rounded-lg text-center text-sm font-medium ${
                  totalsMatch
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : "bg-red-100 text-red-800 border border-red-200"
                }`}
              >
                {totalsMatch ? (
                  <span>
                    ✓ Los montos del pedido y la factura coinciden correctamente
                  </span>
                ) : (
                  <span>⚠ Los montos del pedido y la factura NO coinciden</span>
                )}
              </div>
            </div>
          )}

          {/* Información Adicional */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg text-xs">
            <div>
              <p className="text-muted-foreground">Creado por</p>
              <p className="font-medium">{data.created_by_name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Fecha de Creación</p>
              <p className="font-medium">
                {format(parseISO(data.created_at), "dd/MM/yyyy HH:mm", {
                  locale: es,
                })}
              </p>
            </div>
          </div>
        </div>
      )}
    </GeneralSheet>
  );
}
