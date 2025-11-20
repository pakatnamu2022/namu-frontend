import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { findReceptionById } from "../lib/receptions-products.actions";
import { Loader2, PackageCheck, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";

interface ReceptionViewSheetProps {
  receptionId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReceptionViewSheet({
  receptionId,
  open,
  onOpenChange,
}: ReceptionViewSheetProps) {
  const { data: reception, isLoading } = useQuery({
    queryKey: ["reception", receptionId],
    queryFn: () => findReceptionById(receptionId!),
    enabled: !!receptionId && open,
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <PackageCheck className="h-5 w-5" />
            Detalle de Recepción
          </SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : reception ? (
          <div className="space-y-4 mt-6">
            {/* Información General */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Información General</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Nº Recepción</p>
                  <p className="font-semibold">{reception.reception_number}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Nº Orden de Compra</p>
                  <p className="font-semibold">
                    {reception.purchase_order?.number || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fecha de Recepción</p>
                  <p className="font-semibold">
                    {reception.reception_date
                      ? format(
                          new Date(reception.reception_date),
                          "dd/MM/yyyy",
                          {
                            locale: es,
                          }
                        )
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Estado</p>
                  <Badge variant="outline">{reception.status || "N/A"}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Almacén</p>
                  <p className="font-semibold">
                    {reception.warehouse?.description || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Guía de Remisión</p>
                  <p className="font-semibold">
                    {reception.shipping_guide_number || "-"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Recibido por</p>
                  <p className="font-semibold">
                    {reception.received_by_user_name || "-"}
                  </p>
                </div>
                {reception.notes && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Notas</p>
                    <p className="text-sm">{reception.notes}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Resumen */}
            <Card className="p-4 bg-blue-50">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Total Items</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {reception.total_items || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Cantidad Total
                  </p>
                  <p className="text-2xl font-bold text-blue-700">
                    {reception.total_quantity || "0.00"}
                  </p>
                </div>
              </div>
            </Card>

            {/* Detalles de Productos */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <PackageCheck className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Productos Recibidos</h3>
              </div>

              <div className="space-y-3">
                {reception.details?.map((detail, index) => (
                  <Card
                    key={detail.id}
                    className="p-3 bg-gradient-to-br from-slate-50 to-slate-100/50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-sm">
                          {detail.product?.name ||
                            detail.purchase_order_item?.product_name ||
                            `Producto ${index + 1}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Código: {detail.product?.code || "-"}
                        </p>
                      </div>
                      <Badge
                        variant={
                          detail.reception_type === "ORDERED"
                            ? "default"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {detail.reception_type === "ORDERED"
                          ? "Ordenado"
                          : detail.reception_type === "BONUS"
                          ? "Bonificación"
                          : detail.reception_type === "GIFT"
                          ? "Regalo"
                          : "Muestra"}
                      </Badge>
                    </div>

                    <Separator className="my-2" />

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">
                          Cantidad Recibida
                        </p>
                        <p className="font-semibold">
                          {detail.quantity_received}
                        </p>
                      </div>
                      {detail.reception_type === "ORDERED" &&
                        detail.observed_quantity !== undefined &&
                        Number(detail.observed_quantity) > 0 && (
                          <div>
                            <p className="text-muted-foreground text-xs">
                              Cantidad Observada
                            </p>
                            <p className="font-semibold text-orange-600">
                              {detail.observed_quantity}
                            </p>
                          </div>
                        )}
                    </div>

                    {/* Observaciones */}
                    {detail.observed_quantity !== undefined &&
                      Number(detail.observed_quantity) > 0 && (
                        <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded">
                          <p className="text-xs font-semibold text-orange-700 mb-1">
                            Observación
                          </p>
                          {detail.reason_observation && (
                            <p className="text-xs text-orange-900">
                              <span className="font-medium">Motivo:</span>{" "}
                              {detail.reason_observation}
                            </p>
                          )}
                          {detail.observation_notes && (
                            <p className="text-xs text-orange-900 mt-1">
                              {detail.observation_notes}
                            </p>
                          )}
                        </div>
                      )}

                    {/* Motivo de bonificación */}
                    {detail.bonus_reason && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-xs text-blue-900">
                          <span className="font-medium">Motivo:</span>{" "}
                          {detail.bonus_reason}
                        </p>
                      </div>
                    )}

                    {/* Notas del producto */}
                    {detail.notes && (
                      <div className="mt-2 p-2 bg-slate-100 rounded">
                        <p className="text-xs text-slate-700">{detail.notes}</p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No se encontró la recepción
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
