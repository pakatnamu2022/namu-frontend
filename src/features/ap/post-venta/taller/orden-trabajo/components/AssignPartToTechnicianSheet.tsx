"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, PackageCheck } from "lucide-react";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { errorToast, successToast } from "@/core/core.function";
import {
  assignPartToTechnician,
  getWorkOrderPartsDeliveriesById,
} from "@/features/ap/post-venta/taller/orden-trabajo-repuesto/lib/workOrderParts.actions";
import { getAllWorkOrderPlanning } from "@/features/ap/post-venta/taller/planificacion-orden-trabajo/lib/workOrderPlanning.actions";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormInput } from "@/shared/components/FormInput";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const assignSchema = z.object({
  delivered_to: z.string().min(1, "Seleccione un técnico"),
  delivered_quantity: z
    .number()
    .positive("La cantidad debe ser un número")
    .min(0.01, "La cantidad debe ser mayor a 0"),
});

type AssignFormValues = z.infer<typeof assignSchema>;

interface AssignPart {
  id: number;
  quantity_used: number;
  product_name: string;
}

interface AssignPartToTechnicianSheetProps {
  open: boolean;
  onClose: () => void;
  workOrderId: number;
  part: AssignPart | null;
}

export function AssignPartToTechnicianSheet({
  open,
  onClose,
  workOrderId,
  part,
}: AssignPartToTechnicianSheetProps) {
  const queryClient = useQueryClient();

  const form = useForm<AssignFormValues>({
    resolver: zodResolver(assignSchema),
    defaultValues: { delivered_to: "", delivered_quantity: 1 },
  });

  const {
    data: workOrderPartsDeliveries = [],
    isLoading: isLoadingWorkOrderPartsDeliveries,
  } = useQuery({
    queryKey: ["workOrderPlanning", "partsDeliveries", part?.id],
    queryFn: () => getWorkOrderPartsDeliveriesById(part!.id),
    enabled: open && !!part?.id,
  });

  const { data: planningWorkers = [], isLoading: isLoadingWorkers } = useQuery({
    queryKey: ["workOrderPlanning", "all", workOrderId],
    queryFn: () =>
      getAllWorkOrderPlanning({
        params: { work_order_id: workOrderId, all: true },
      }),
    enabled: open,
  });

  const totalDelivered = workOrderPartsDeliveries.reduce(
    (sum, delivery) => sum + Number(delivery.delivered_quantity || 0),
    0,
  );
  const maxAllowedQuantity = part?.quantity_used ?? 0;
  const remainingQuantity = Math.max(maxAllowedQuantity - totalDelivered, 0);
  const canAssignMore = !!part && remainingQuantity > 0;

  const mutation = useMutation({
    mutationFn: (values: AssignFormValues) =>
      assignPartToTechnician(part!.id, {
        delivered_to: Number(values.delivered_to),
        delivered_quantity: values.delivered_quantity,
      }),
    onSuccess: () => {
      successToast("Repuesto asignado exitosamente");
      queryClient.invalidateQueries({
        queryKey: ["workOrderParts", workOrderId],
      });
      handleClose();
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message || "Error al asignar el repuesto",
      );
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <GeneralSheet
      open={open}
      onClose={handleClose}
      title="Asignar repuesto a técnico"
      icon="UserCheck"
      size="2xl"
      isLoading={isLoadingWorkers}
    >
      <Form {...form}>
        {canAssignMore ? (
          <form
            onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
            className="space-y-4 pt-2"
          >
            {part && (
              <p className="text-sm text-muted-foreground">
                Repuesto:{" "}
                <span className="font-medium text-foreground">
                  {part.product_name}
                </span>
              </p>
            )}

            <FormSelect
              control={form.control}
              name="delivered_to"
              label="Técnico"
              placeholder="Seleccione un técnico"
              options={planningWorkers.map((w) => ({
                value: w.worker_id.toString(),
                label: w.worker_name,
              }))}
            />

            <FormInput
              control={form.control}
              name="delivered_quantity"
              label="Cantidad a entregar"
              type="number"
              min={0.01}
              step={0.01}
              max={remainingQuantity}
              description={
                part
                  ? `Máximo permitido: ${part.quantity_used} | Restante: ${remainingQuantity}`
                  : undefined
              }
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Asignando...
                  </>
                ) : (
                  "Asignar"
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="pt-2">
            <p className="text-sm text-muted-foreground">
              La cantidad maxima permitida para este repuesto ya fue entregada.
            </p>
          </div>
        )}

        <div className="space-y-3 rounded-lg border bg-muted/20 p-4 mt-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <PackageCheck className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium">Entregas registradas</h3>
            </div>
            <span className="text-xs text-muted-foreground">
              {workOrderPartsDeliveries.length} registro(s)
            </span>
          </div>

          {isLoadingWorkOrderPartsDeliveries ? (
            <p className="text-sm text-muted-foreground">
              Cargando entregas...
            </p>
          ) : workOrderPartsDeliveries.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aún no hay entregas registradas para este repuesto.
            </p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {workOrderPartsDeliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className={`rounded-lg border p-4 transition-colors ${
                    delivery.is_received
                      ? "bg-muted/40 opacity-80"
                      : "hover:border-muted-foreground/40"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <PackageCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium">
                          {delivery.delivered_to_name}
                        </p>
                        {delivery.is_received ? (
                          <Badge
                            variant="outline"
                            className="border-blue-200 bg-blue-50 text-xs text-primary"
                          >
                            Recibido
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-yellow-200 bg-yellow-50 text-xs text-yellow-700"
                          >
                            Pendiente
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>
                          Cantidad:{" "}
                          <span className="font-medium text-foreground">
                            {delivery.delivered_quantity}
                          </span>
                        </span>
                        <span>
                          Entregado por:{" "}
                          <span className="text-foreground">
                            {delivery.delivered_by_name}
                          </span>
                        </span>
                        <span>
                          Fecha:{" "}
                          <span className="text-foreground">
                            {format(
                              parseISO(delivery.delivered_date),
                              "dd/MM/yyyy HH:mm",
                              { locale: es },
                            )}
                          </span>
                        </span>
                        <span>
                          Técnico:{" "}
                          <span className="text-foreground">
                            {delivery.delivered_to_name}
                          </span>
                        </span>
                      </div>

                      {delivery.is_received && delivery.received_date && (
                        <div className="space-y-2">
                          <p className="text-xs text-primary">
                            Recibido el{" "}
                            {format(
                              parseISO(delivery.received_date),
                              "dd/MM/yyyy HH:mm",
                              { locale: es },
                            )}
                            {delivery.received_by_name
                              ? ` por ${delivery.received_by_name}`
                              : ""}
                          </p>

                          {delivery.received_signature_url ? (
                            <div className="rounded-md border bg-background p-2">
                              <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                Firma de recepción
                              </p>
                              <img
                                src={delivery.received_signature_url}
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
              ))}
            </div>
          )}
        </div>
      </Form>
    </GeneralSheet>
  );
}
