import GeneralSheet from "@/shared/components/GeneralSheet";
import { InfoSection } from "@/shared/components/InfoSection.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { formatDateTime } from "@/core/core.function.ts";
import { ReservedStockReportItem } from "../lib/inventory.interface.ts";
import { useReservedStockReport } from "../lib/inventory.hook.ts";
import { WORK_ORDER_STATUS_COLORS } from "@/features/ap/post-venta/taller/orden-trabajo/lib/workOrder.constants.ts";
import { STATUS_ORDER_QUOTATION_COLOR } from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.constants.ts";

interface Props {
  open: boolean;
  onClose: () => void;
  productId: number;
  warehouseId: number;
}

export default function ReservedStockDetailsSheet({
  open,
  onClose,
  productId,
  warehouseId,
}: Props) {
  const { data, isLoading } = useReservedStockReport(
    { product_id: productId, warehouse_id: warehouseId },
    { enabled: open },
  );

  const item: ReservedStockReportItem | undefined = data?.data?.[0];
  const reservationsOT = item?.reservations_ot ?? [];
  const reservationsRP = item?.reservations_rp ?? [];

  const reservedFromOT = reservationsOT.reduce(
    (sum, r) => sum + Number(r.quantity_reserved || 0),
    0,
  );
  const reservedFromRP = reservationsRP.reduce(
    (sum, r) => sum + Number(r.quantity_reserved || 0),
    0,
  );
  const reservedFromDetail = reservedFromOT + reservedFromRP;
  const totalReserved = Number(item?.total_reserved_quantity || 0);
  const reservedMatches = Math.abs(reservedFromDetail - totalReserved) < 0.01;

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title="Detalle de Stock Reservado"
      subtitle={item ? `${item.product_name} (${item.product_code})` : ""}
      size="2xl"
      isLoading={isLoading}
    >
      <div className="space-y-6 px-6">
        {item && (
          <InfoSection
            title="Resumen"
            columns={3}
            fields={[
              { label: "Almacén", value: item.warehouse_name || "-" },
              {
                label: "Stock Físico",
                value: Number(item.physical_stock || 0).toFixed(2),
              },
              {
                label: "Stock Reservado",
                value: Number(item.total_reserved_quantity || 0).toFixed(2),
              },
              {
                label: "Stock Disponible",
                value: Number(item.available_quantity || 0).toFixed(2),
              },
              {
                label: "Coincidencia con OT/Cotizaciones",
                value: (
                  <div className="flex items-center gap-2">
                    <Badge color={reservedMatches ? "green" : "red"}>
                      {reservedMatches ? "Coincide" : "No coincide"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {reservedFromDetail.toFixed(2)} u.
                    </span>
                  </div>
                ),
              },
            ]}
          />
        )}

        <div className="space-y-3">
          <h3 className="font-semibold text-lg">
            Órdenes de Trabajo con Reserva
          </h3>

          {reservationsOT.length === 0 && !isLoading && (
            <p className="text-sm text-muted-foreground">
              No hay reservas registradas para este producto en este almacén.
            </p>
          )}

          <div className="space-y-3">
            {reservationsOT.map((reservation) => (
              <div
                key={`${reservation.work_order_id}-${reservation.reserved_at}`}
                className="border rounded-lg p-4 space-y-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">
                      {reservation.work_order_correlative}
                    </p>
                    <Badge
                      color={
                        WORK_ORDER_STATUS_COLORS[
                          reservation.work_order_status_id
                        ] ?? "default"
                      }
                    >
                      {reservation.work_order_status}
                    </Badge>
                  </div>
                  <Badge variant="outline">
                    {Number(reservation.quantity_reserved || 0).toFixed(2)} u.
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Sede</p>
                    <p className="font-medium text-sm">
                      {reservation.sede_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Fecha de Reserva
                    </p>
                    <p className="font-medium text-sm">
                      {reservation.reserved_at
                        ? formatDateTime(reservation.reserved_at)
                        : "-"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">
                      Reservado Por
                    </p>
                    <p className="font-medium text-sm">
                      {reservation.reserved_by_user_name}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-lg">
            Cotizaciones de Repuestos con Reserva
          </h3>

          {reservationsRP.length === 0 && !isLoading && (
            <p className="text-sm text-muted-foreground">
              No hay reservas registradas para este producto en este almacén.
            </p>
          )}

          <div className="space-y-3">
            {reservationsRP.map((reservation) => (
              <div
                key={`${reservation.quotation_id}-${reservation.reserved_at}`}
                className="border rounded-lg p-4 space-y-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">
                      {reservation.quotation_number}
                    </p>
                    <Badge
                      color={
                        STATUS_ORDER_QUOTATION_COLOR[
                          reservation.quotation_status
                        ] ?? "default"
                      }
                    >
                      {reservation.quotation_status}
                    </Badge>
                  </div>
                  <Badge variant="outline">
                    {Number(reservation.quantity_reserved || 0).toFixed(2)} u.
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Sede</p>
                    <p className="font-medium text-sm">
                      {reservation.sede_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Fecha de Reserva
                    </p>
                    <p className="font-medium text-sm">
                      {reservation.reserved_at
                        ? formatDateTime(reservation.reserved_at)
                        : "-"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">
                      Reservado Por
                    </p>
                    <p className="font-medium text-sm">
                      {reservation.reserved_by_user_name}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GeneralSheet>
  );
}
