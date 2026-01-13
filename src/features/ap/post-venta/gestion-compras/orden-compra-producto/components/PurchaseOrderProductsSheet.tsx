import GeneralSheet from "@/shared/components/GeneralSheet";
import { PurchaseOrderProductsResource } from "../lib/purchaseOrderProducts.interface";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface PurchaseOrderProductsViewSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: PurchaseOrderProductsResource | null;
}

export function PurchaseOrderProductsViewSheet({
  open,
  onOpenChange,
  data,
}: PurchaseOrderProductsViewSheetProps) {
  if (!data) return null;

  const currencySymbol = data.currency_code === "USD" ? "$" : "S/.";

  return (
    <GeneralSheet
      open={open}
      onClose={() => onOpenChange(false)}
      title="Detalles de Orden de Compra"
      subtitle="Vista completa de la orden"
      icon="ShoppingCart"
      size="4xl"
    >
      <div className="space-y-6">
        {/* Información General */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
          <div>
            <p className="text-xs text-muted-foreground">Nº Orden</p>
            <p className="font-semibold">{data.number}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Nº Guía</p>
            <p className="font-medium">{data.number_guide || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Factura</p>
            <p className="font-medium">
              {data.invoice_series}-{data.invoice_number}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">F. Emisión</p>
            <p className="font-medium">
              {format(new Date(data.emission_date), "dd/MM/yyyy", {
                locale: es,
              })}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">F. Vencimiento</p>
            <p className="font-medium">
              {format(new Date(data.due_date), "dd/MM/yyyy", { locale: es })}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Estado</p>
            <Badge variant={data.status ? "default" : "destructive"}>
              {data.status ? "Activo" : "Inactivo"}
            </Badge>
          </div>
        </div>

        {/* Información del Proveedor y Sede */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold text-sm mb-3">
              Información del Proveedor
            </h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">Proveedor</p>
                <p className="font-medium text-sm">{data.supplier}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">RUC</p>
                <p className="font-medium text-sm">
                  {data.supplier_num_doc || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tipo de Pedido</p>
                <p className="font-medium text-sm">
                  {data.supplier_order_type || "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold text-sm mb-3">
              Información de Almacén
            </h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">Sede</p>
                <p className="font-medium text-sm">{data.sede || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Almacén</p>
                <p className="font-medium text-sm">{data.warehouse || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Moneda</p>
                <p className="font-medium text-sm">
                  {data.currency || "-"} ({data.currency_code || "-"})
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de Productos */}
        <div className="border rounded-lg">
          <div className="p-4 bg-muted/50 border-b">
            <h3 className="font-semibold text-sm">Productos</h3>
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
              {data.items.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">
                        {item.product_name || "-"}
                      </span>
                      {item.unit_measurement && (
                        <span className="text-xs text-muted-foreground">
                          Unidad: {item.unit_measurement}
                        </span>
                      )}
                      {item.description && (
                        <span className="text-xs text-muted-foreground">
                          {item.description}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-end">
                    {currencySymbol} {item.unit_price.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-end font-semibold">
                    {currencySymbol} {item.total.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Totales */}
        <div className="flex justify-end">
          <div className="w-full md:w-1/3 space-y-2 p-4 bg-muted/50 rounded-lg">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span className="font-medium">
                {currencySymbol} {data.subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Descuento:</span>
              <span className="font-medium text-red-600">
                - {currencySymbol} {data.discount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>IGV ({data.igv}%):</span>
              <span className="font-medium">
                {currencySymbol} {((data.subtotal * data.igv) / 100).toFixed(2)}
              </span>
            </div>
            {data.isc > 0 && (
              <div className="flex justify-between text-sm">
                <span>ISC:</span>
                <span className="font-medium">
                  {currencySymbol} {data.isc.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold pt-2 border-t">
              <span>Total:</span>
              <span className="text-primary">
                {currencySymbol} {data.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Información Adicional */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg text-xs">
          <div>
            <p className="text-muted-foreground">Estado de Migración</p>
            <p className="font-medium capitalize">{data.migration_status}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Reenviado</p>
            <p className="font-medium">{data.resent ? "Sí" : "No"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Creado</p>
            <p className="font-medium">
              {format(new Date(data.created_at), "dd/MM/yyyy HH:mm", {
                locale: es,
              })}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Actualizado</p>
            <p className="font-medium">
              {format(new Date(data.updated_at), "dd/MM/yyyy HH:mm", {
                locale: es,
              })}
            </p>
          </div>
        </div>

        {/* Notas */}
        {data.notes && (
          <div className="p-4 border rounded-lg bg-blue-50/50">
            <h3 className="font-semibold text-sm mb-2 text-blue-900">Notas</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {data.notes}
            </p>
          </div>
        )}
      </div>
    </GeneralSheet>
  );
}
