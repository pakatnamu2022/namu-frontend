import { useEffect, useState } from "react";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { SupplierOrderResource } from "../lib/supplierOrder.interface";
import { getSupplierOrderById } from "../lib/supplierOrder.actions";
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
import { Loader2 } from "lucide-react";

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
              <p className="font-medium">
                {format(new Date(data.order_date), "dd/MM/yyyy", {
                  locale: es,
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tipo Abast.</p>
              <Badge
                variant={
                  data.supply_type === "STOCK"
                    ? "default"
                    : data.supply_type === "LIMA"
                    ? "secondary"
                    : "outline"
                }
              >
                {data.supply_type}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tiene Factura</p>
              <Badge variant={data.has_invoice ? "default" : "destructive"}>
                {data.has_invoice ? "Sí" : "No"}
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

          {/* Total */}
          <div className="flex justify-end">
            <div className="w-full md:w-1/3 space-y-2 p-4 bg-muted/50 rounded-lg">
              <div className="flex justify-between text-base font-bold pt-2 border-t">
                <span>Total del Pedido:</span>
                <span className="text-primary">
                  {currencySymbol}{" "}
                  {data.details
                    .reduce((sum, item) => sum + item.total, 0)
                    .toFixed(4)
                    .replace(/\.?0+$/, "")}
                </span>
              </div>
            </div>
          </div>

          {/* Información Adicional */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg text-xs">
            <div>
              <p className="text-muted-foreground">Creado por</p>
              <p className="font-medium">Usuario ID: {data.created_by}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Registrado</p>
              <p className="font-medium">
                {currencySymbol}{" "}
                {Number(data.total_amount)
                  .toFixed(4)
                  .replace(/\.?0+$/, "")}
              </p>
            </div>
          </div>
        </div>
      )}
    </GeneralSheet>
  );
}
