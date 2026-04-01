"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckSquare, Square, PackageCheck, Loader2 } from "lucide-react";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { errorToast, successToast } from "@/core/core.function";
import {
  getAssignmentsByWorkOrder,
  confirmPartsDelivery,
} from "@/features/ap/post-venta/taller/orden-trabajo-repuesto/lib/workOrderParts.actions";
import { WorkOrderPlanningResource } from "../../planificacion-orden-trabajo/lib/workOrderPlanning.interface";
import { useIsTablet } from "@/hooks/use-tablet";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface ConfirmPartsDeliverySheetProps {
  open: boolean;
  onClose: () => void;
  planning: WorkOrderPlanningResource | null;
}

export function ConfirmPartsDeliverySheet({
  open,
  onClose,
  planning,
}: ConfirmPartsDeliverySheetProps) {
  const isTablet = useIsTablet();
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const workOrderId = planning?.work_order_id;

  const { data, isLoading } = useQuery({
    queryKey: ["workOrderPartAssignments", workOrderId, planning?.worker_id],
    queryFn: () =>
      getAssignmentsByWorkOrder(workOrderId!, Number(planning?.worker_id)),
    enabled: open && !!workOrderId,
  });

  const assignments = data?.assignments ?? [];
  const pendingAssignments = assignments.filter((a) => !a.is_received);

  const allSelected =
    pendingAssignments.length > 0 &&
    pendingAssignments.every((a) => selectedIds.includes(a.delivery_id));

  const toggleOne = (deliveryId: number) => {
    setSelectedIds((prev) =>
      prev.includes(deliveryId)
        ? prev.filter((id) => id !== deliveryId)
        : [...prev, deliveryId],
    );
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingAssignments.map((a) => a.delivery_id));
    }
  };

  const mutation = useMutation({
    mutationFn: () => confirmPartsDelivery({ delivery_ids: selectedIds }),
    onSuccess: () => {
      successToast("Entrega confirmada exitosamente");
      queryClient.invalidateQueries({
        queryKey: ["workOrderPartAssignments", workOrderId],
      });
      setSelectedIds([]);
      onClose();
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message || "Error al confirmar la entrega",
      );
    },
  });

  const handleClose = () => {
    setSelectedIds([]);
    onClose();
  };

  return (
    <GeneralSheet
      open={open}
      onClose={handleClose}
      title={`Confirmar entrega de repuestos${planning ? ` - ${planning.work_order_correlative}` : ""}`}
      icon="PackageCheck"
      type={isTablet ? "tablet" : "default"}
      size="2xl"
      isLoading={isLoading}
    >
      <div className="space-y-4">
        {assignments.length === 0 && !isLoading ? (
          <p className="text-center text-muted-foreground py-10">
            No hay repuestos asignados para esta orden de trabajo.
          </p>
        ) : (
          <>
            {pendingAssignments.length > 0 && (
              <div className="flex items-center justify-between pb-2 border-b">
                <button
                  type="button"
                  className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
                  onClick={toggleAll}
                >
                  {allSelected ? (
                    <CheckSquare className="h-4 w-4 text-primary" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                  Seleccionar todos ({pendingAssignments.length} pendientes)
                </button>
                <span className="text-sm text-muted-foreground">
                  {selectedIds.length} seleccionado(s)
                </span>
              </div>
            )}

            <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
              {assignments.map((assignment) => {
                const isPending = !assignment.is_received;
                const isSelected = selectedIds.includes(assignment.delivery_id);

                return (
                  <div
                    key={assignment.delivery_id}
                    className={`border rounded-lg p-4 space-y-2 transition-colors ${
                      assignment.is_received
                        ? "bg-muted/40 opacity-70"
                        : isSelected
                          ? "border-primary bg-primary/5"
                          : "hover:border-muted-foreground/40"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {isPending ? (
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() =>
                            toggleOne(assignment.delivery_id)
                          }
                          className="mt-0.5"
                        />
                      ) : (
                        <PackageCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      )}

                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-sm">
                            {assignment.product.name}
                          </p>
                          {assignment.is_received ? (
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-primary border-blue-200 text-xs"
                            >
                              Recibido
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs"
                            >
                              Pendiente
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span>
                            Código:{" "}
                            <span className="text-foreground font-medium">
                              {assignment.product.code}
                            </span>
                          </span>
                          <span>
                            Cantidad:{" "}
                            <span className="text-foreground font-medium">
                              {assignment.delivered_quantity}
                            </span>
                          </span>
                          <span>
                            Almacén:{" "}
                            <span className="text-foreground">
                              {assignment.warehouse.name}
                            </span>
                          </span>
                          <span>
                            Técnico:{" "}
                            <span className="text-foreground">
                              {assignment.technician.name}
                            </span>
                          </span>
                          <span>
                            Entregado por:{" "}
                            <span className="text-foreground">
                              {assignment.delivered_by.name}
                            </span>
                          </span>
                          <span>
                            Fecha:{" "}
                            <span className="text-foreground">
                              {format(
                                parseISO(assignment.delivered_date),
                                "dd/MM/yyyy HH:mm",
                                { locale: es },
                              )}
                            </span>
                          </span>
                        </div>

                        {assignment.is_received && assignment.received_date && (
                          <div className="space-y-2">
                            <p className="text-xs text-blue-700">
                              Recibido el{" "}
                              {format(
                                parseISO(assignment.received_date),
                                "dd/MM/yyyy HH:mm",
                                { locale: es },
                              )}{" "}
                              por {assignment.received_by?.name}
                            </p>

                            {assignment.received_signature_url ? (
                              <div className="rounded-md border bg-background p-2">
                                <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                  Firma de recepción
                                </p>
                                <img
                                  src={assignment.received_signature_url}
                                  alt="Firma de recepción"
                                  className="h-20 w-full max-w-[260px] rounded border bg-white object-contain"
                                  loading="lazy"
                                />
                              </div>
                            ) : (
                              <p className="text-[11px] text-muted-foreground">
                                Sin firma registrada.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {pendingAssignments.length > 0 && (
              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button
                  type="button"
                  disabled={selectedIds.length === 0 || mutation.isPending}
                  onClick={() => mutation.mutate()}
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Confirmando...
                    </>
                  ) : (
                    <>
                      <PackageCheck className="h-4 w-4 mr-2" />
                      Confirmar entrega ({selectedIds.length})
                    </>
                  )}
                </Button>
              </div>
            )}

            {pendingAssignments.length === 0 && assignments.length > 0 && (
              <p className="text-center text-blue-700 text-sm py-4">
                Todos los repuestos han sido confirmados.
              </p>
            )}
          </>
        )}
      </div>
    </GeneralSheet>
  );
}
