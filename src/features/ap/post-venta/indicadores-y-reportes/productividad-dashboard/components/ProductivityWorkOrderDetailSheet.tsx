"use client";

import { ClipboardList, Package, Wrench, Car } from "lucide-react";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { formatHours, formatMoney } from "@/core/core.function";
import { useFindWorkOrderById } from "@/features/ap/post-venta/taller/orden-trabajo/lib/workOrder.hook";

interface ProductivityWorkOrderDetailSheetProps {
  workOrderId: number | null;
  nameTechnician: string;
  onClose: () => void;
}

export default function ProductivityWorkOrderDetailSheet({
  workOrderId,
  nameTechnician,
  onClose,
}: ProductivityWorkOrderDetailSheetProps) {
  const { data: workOrder, isLoading } = useFindWorkOrderById(workOrderId ?? 0);

  const items = workOrder?.items ?? [];
  const labours = workOrder?.labours ?? [];
  const parts = workOrder?.parts ?? [];
  const currencySymbol = workOrder?.type_currency?.symbol ?? "S/";

  return (
    <GeneralSheet
      open={!!workOrderId}
      onClose={onClose}
      title={workOrder ? `${workOrder.correlative}` : "Orden de trabajo"}
      subtitle={workOrder?.vehicle?.plate}
      icon="ClipboardList"
      size="3xl"
      isLoading={isLoading}
    >
      {workOrder && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              <Car className="size-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Información del Vehículo
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 rounded-xl border bg-muted/30 p-4 sm:grid-cols-3">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Placa
                </p>
                <p className="text-sm font-semibold">
                  {workOrder.vehicle?.plate ?? "-"}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  VIN
                </p>
                <p className="text-sm font-semibold">
                  {workOrder.vehicle?.vin ?? "-"}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Marca
                </p>
                <p className="text-sm font-semibold">
                  {workOrder.vehicle?.model?.brand ?? "-"}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Modelo
                </p>
                <p className="text-sm font-semibold">
                  {workOrder.vehicle?.model?.version ?? "-"}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Año
                </p>
                <p className="text-sm font-semibold">
                  {workOrder.vehicle?.year ?? "-"}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  N° Motor
                </p>
                <p className="text-sm font-semibold">
                  {workOrder.vehicle?.engine_number ?? "-"}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Kilometraje
                </p>
                <p className="text-sm font-semibold">
                  {workOrder.vehicle?.mileage != null
                    ? `${workOrder.vehicle.mileage} km`
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Color
                </p>
                <p className="text-sm font-semibold">
                  {workOrder.vehicle?.vehicle_color ?? "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-xl border bg-muted/30 p-4">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Técnico
              </p>
              <p className="text-sm font-semibold">{nameTechnician}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Asesor
              </p>
              <p className="text-sm font-semibold">{workOrder.advisor_name}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              <ClipboardList className="size-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Trabajos
              </span>
            </div>
            <div className="rounded-lg border divide-y">
              {items.length > 0 ? (
                items.map((item) => (
                  <div key={item.id} className="p-3 text-sm">
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>
                        Planificación: {item.type_planning?.description}
                      </span>
                      <span>Operación: {item.type_operation_name}</span>
                    </div>
                    <p className="mt-1">{item.description}</p>
                  </div>
                ))
              ) : (
                <p className="p-3 text-xs text-muted-foreground">
                  Sin trabajos registrados.
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <Wrench className="size-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Mano de obra
                </span>
              </div>
              <div className="rounded-lg border divide-y">
                {labours.length > 0 ? (
                  labours.map((labour) => (
                    <div key={labour.id} className="p-3">
                      <div className="flex items-baseline justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm">
                            {labour.description}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {labour.worker_full_name} ·{" "}
                            {formatHours(labour.time_spent_decimal)}
                          </p>
                        </div>
                        <span className="shrink-0 text-sm font-semibold">
                          {formatMoney(
                            labour.net_amount || labour.total_cost,
                            2,
                            currencySymbol,
                          )}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="p-3 text-xs text-muted-foreground">
                    Sin mano de obra registrada.
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <Package className="size-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Repuestos
                </span>
              </div>
              <div className="rounded-lg border divide-y">
                {parts.length > 0 ? (
                  parts.map((part) => (
                    <div key={part.id} className="p-3">
                      <div className="flex items-baseline justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm">
                            {part.product_name}
                          </p>
                        </div>
                        <span className="shrink-0 text-sm font-semibold">
                          {part.quantity_used} unid.
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="p-3 text-xs text-muted-foreground">
                    Sin repuestos registrados.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </GeneralSheet>
  );
}
