import { AdjustmentsProductResource } from "@/features/ap/post-venta/gestion-almacen/ajuste-producto/lib/adjustmentsProduct.interface.ts";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge.tsx";
import { AP_MASTER_TYPE } from "@/features/ap/ap-master/lib/apMaster.constants.ts";
import { Loader2 } from "lucide-react";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { DetailSheetTable } from "@/shared/components/DetailSheetTable";
import { CopyCell } from "@/shared/components/CopyCell";
import { InfoSection } from "@/shared/components/InfoSection";
import { formatDate } from "@/core/core.function";
import { translateMovementStatus } from "../../inventario/lib/inventory.constants";

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
  const details = data?.details || [];

  return (
    <GeneralSheet
      open={open}
      onClose={() => onOpenChange(false)}
      title="Detalles del Ajuste de Producto"
      subtitle={data ? `Movimiento N° ${data.movement_number}` : "Cargando..."}
      size="3xl"
    >
      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !data ? (
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">No se encontraron datos</p>
        </div>
      ) : (
        <div className="space-y-6 px-6">
          {/* Información General */}
          <InfoSection
            title="Información General"
            fields={[
              {
                label: "N° Movimiento",
                value: data.movement_number,
              },
              {
                label: "Tipo Movimiento",
                value: (
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
                ),
              },
              {
                label: "F. Movimiento",
                value: formatDate(data.movement_date),
              },
              {
                label: "Estado",
                value: (
                  <Badge
                    color={
                      data.status === "APPROVED" ? "default" : "destructive"
                    }
                  >
                    {translateMovementStatus(data.status) || "-"}
                  </Badge>
                ),
              },
              {
                label: "Total Ítems",
                value: data.total_items || 0,
              },
              {
                label: "Cantidad Total",
                value: data.total_quantity || "0.00",
              },
            ]}
          />

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
                  <p className="font-medium text-sm">{data.user_name || "-"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Motivo del Ajuste */}
          {data.reason_in_out && (
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-sm mb-3">Motivo del Ajuste</h3>
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
              <DetailSheetTable
                rows={details}
                getKey={(detail) => detail.id}
                emptyMessage="No hay productos asociados a esta solicitud"
                columns={[
                  {
                    header: "#",
                    className: "text-left",
                    render: (_detail, index) => (
                      <div className="text-sm font-medium">{index + 1}</div>
                    ),
                  },
                  {
                    header: "Repuesto",
                    render: (detail) => (
                      <>
                        <div className="text-sm">{detail.product?.name}</div>
                        {detail.product?.code ? (
                          <CopyCell
                            value={detail.product.code}
                            label={`Cód: ${detail.product.code}`}
                            className="text-xs text-muted-foreground"
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Cód: N/A
                          </span>
                        )}
                        {detail.product?.dyn_code ? (
                          <CopyCell
                            value={detail.product.dyn_code}
                            label={`Cód Dyn: ${detail.product.dyn_code}`}
                            className="text-xs text-muted-foreground"
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Cód Dyn: N/A
                          </span>
                        )}
                      </>
                    ),
                  },
                  {
                    header: "Cant.",
                    className: "text-center",
                    render: (detail) => (
                      <div className="text-sm font-semibold">
                        {detail.quantity}
                      </div>
                    ),
                  },
                ]}
              />
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
    </GeneralSheet>
  );
}
