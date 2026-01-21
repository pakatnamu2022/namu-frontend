import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AdjustmentsProductResource } from "../lib/adjustmentsProduct.interface";
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
import { AP_MASTER_TYPE } from "@/features/ap/ap-master/lib/apMaster.constants";
import { Loader2 } from "lucide-react";

interface AdjustmentsProductDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: AdjustmentsProductResource | null;
  isLoading?: boolean;
}

export function AdjustmentsProductDetailSheet({
  open,
  onOpenChange,
  data,
  isLoading = false,
}: AdjustmentsProductDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-4xl overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>Detalles del Ajuste de Producto</SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !data ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-muted-foreground">No se encontraron datos</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Información General */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">N° Movimiento</p>
                <p className="font-semibold">{data.movement_number || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tipo Movimiento</p>
                <Badge
                  color={
                    data.movement_type === AP_MASTER_TYPE.TYPE_ADJUSTMENT_IN
                      ? "default"
                      : "secondary"
                  }
                  className="capitalize w-20 flex items-center justify-center"
                >
                  {data.movement_type === AP_MASTER_TYPE.TYPE_ADJUSTMENT_IN
                    ? "INGRESO"
                    : "SALIDA"}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">F. Movimiento</p>
                <p className="font-medium">
                  {format(new Date(data.movement_date), "dd/MM/yyyy", {
                    locale: es,
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Estado</p>
                <Badge
                  color={data.status === "APPROVED" ? "default" : "destructive"}
                >
                  {data.status || "-"}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Ítems</p>
                <p className="font-medium">{data.total_items || 0}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cantidad Total</p>
                <p className="font-medium">{data.total_quantity || "0.00"}</p>
              </div>
            </div>

            {/* Información del Almacén y Usuario */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-sm mb-3">
                  Información del Almacén
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Almacén</p>
                    <p className="font-medium text-sm">
                      {data.warehouse_origin?.description || "-"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-sm mb-3">
                  Información del Usuario
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Registrado Por
                    </p>
                    <p className="font-medium text-sm">
                      {data.user_name || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Motivo del Ajuste */}
            {data.reason_in_out && (
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-sm mb-3">
                  Motivo del Ajuste
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Código</p>
                    <p className="font-medium text-sm">
                      {data.reason_in_out.code || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Descripción</p>
                    <p className="font-medium text-sm">
                      {data.reason_in_out.description || "-"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Observaciones */}
            {data.notes && (
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-sm mb-2">Observaciones</h3>
                <p className="text-sm text-muted-foreground">{data.notes}</p>
              </div>
            )}

            {/* Tabla de Productos */}
            {data.details && data.details.length > 0 && (
              <div className="border rounded-lg">
                <div className="p-4 bg-muted/50 border-b">
                  <h3 className="font-semibold text-sm">Productos Ajustados</h3>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-center">Cantidad</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.details.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">
                              {item.product?.name || "-"}
                            </span>
                            {item.product?.code && (
                              <span className="text-xs text-muted-foreground">
                                Código: {item.product.code}
                              </span>
                            )}
                            {item.product?.brand_name && (
                              <span className="text-xs text-muted-foreground">
                                Marca: {item.product.brand_name}
                              </span>
                            )}
                            {item.notes && (
                              <span className="text-xs text-muted-foreground italic">
                                {item.notes}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {item.quantity}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Totales */}
            {data.total_cost && (
              <div className="flex justify-end">
                <div className="w-full md:w-1/3 space-y-2 p-4 bg-muted/50 rounded-lg">
                  <div className="flex justify-between text-base font-bold pt-2 border-t">
                    <span>Costo Total:</span>
                    <span className="text-primary">
                      S/. {Number(data.total_cost || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Información de Auditoría */}
            {(data.created_at || data.updated_at) && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg text-xs">
                {data.created_at && (
                  <div>
                    <p className="text-muted-foreground">Creado</p>
                    <p className="font-medium">
                      {format(new Date(data.created_at), "dd/MM/yyyy HH:mm", {
                        locale: es,
                      })}
                    </p>
                  </div>
                )}
                {data.updated_at && (
                  <div>
                    <p className="text-muted-foreground">Actualizado</p>
                    <p className="font-medium">
                      {format(new Date(data.updated_at), "dd/MM/yyyy HH:mm", {
                        locale: es,
                      })}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
