"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, PackageCheck } from "lucide-react";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { errorToast, successToast } from "@/core/core.function";
import { assignPartToTechnicianBulk } from "@/features/ap/post-venta/taller/orden-trabajo-repuesto/lib/workOrderParts.actions";
import { WorkOrderPartsResource } from "@/features/ap/post-venta/taller/orden-trabajo-repuesto/lib/workOrderParts.interface";
import { getAllWorkOrderPlanning } from "@/features/ap/post-venta/taller/planificacion-orden-trabajo/lib/workOrderPlanning.actions";
import { FormSelect } from "@/shared/components/FormSelect";

const bulkAssignSchema = z.object({
  delivered_to: z.string().min(1, "Seleccione un técnico"),
});

type BulkAssignFormValues = z.infer<typeof bulkAssignSchema>;

interface AssignPartsBulkSheetProps {
  open: boolean;
  onClose: () => void;
  workOrderId: number;
  parts: WorkOrderPartsResource[];
}

export function AssignPartsBulkSheet({
  open,
  onClose,
  workOrderId,
  parts,
}: AssignPartsBulkSheetProps) {
  const queryClient = useQueryClient();

  const assignableParts = useMemo(
    () => parts.filter((p) => !p.part_fully_delivered),
    [parts],
  );

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [quantities, setQuantities] = useState<Record<number, string>>({});

  useEffect(() => {
    if (open) {
      setSelectedIds(assignableParts.map((p) => p.id));
      setQuantities(
        Object.fromEntries(
          assignableParts.map((p) => [p.id, String(p.quantity_used)]),
        ),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const form = useForm<BulkAssignFormValues>({
    resolver: zodResolver(bulkAssignSchema),
    defaultValues: { delivered_to: "" },
  });

  const { data: planningWorkers = [], isLoading: isLoadingWorkers } = useQuery(
    {
      queryKey: ["workOrderPlanning", "all", workOrderId],
      queryFn: () =>
        getAllWorkOrderPlanning({
          params: { work_order_id: workOrderId, all: true },
        }),
      enabled: open,
    },
  );

  const mutation = useMutation({
    mutationFn: (values: BulkAssignFormValues) =>
      assignPartToTechnicianBulk({
        delivered_to: Number(values.delivered_to),
        assignments: selectedIds.map((id) => ({
          work_order_part_id: id,
          delivered_quantity: Number(quantities[id] ?? 0),
        })),
      }),
    onSuccess: () => {
      successToast("Repuestos asignados exitosamente");
      queryClient.invalidateQueries({
        queryKey: ["workOrderParts", workOrderId],
      });
      handleClose();
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message ||
          "Error al asignar los repuestos de forma masiva",
      );
    },
  });

  const handleClose = () => {
    form.reset();
    setSelectedIds([]);
    setQuantities({});
    onClose();
  };

  const handleToggle = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleToggleAll = () => {
    if (selectedIds.length === assignableParts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(assignableParts.map((p) => p.id));
    }
  };

  const handleQuantityChange = (id: number, value: string) => {
    setQuantities((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (values: BulkAssignFormValues) => {
    if (selectedIds.length === 0) {
      errorToast("Debe seleccionar al menos un repuesto");
      return;
    }
    const invalidQuantity = selectedIds.some((id) => {
      const qty = Number(quantities[id] ?? 0);
      return !Number.isFinite(qty) || qty <= 0;
    });
    if (invalidQuantity) {
      errorToast("Las cantidades deben ser mayores a 0");
      return;
    }
    mutation.mutate(values);
  };

  return (
    <GeneralSheet
      open={open}
      onClose={handleClose}
      title="Asignar repuestos a técnico"
      icon="UserCheck"
      size="3xl"
      isLoading={isLoadingWorkers}
    >
      <Form {...form}>
        {assignableParts.length === 0 ? (
          <div className="pt-2">
            <p className="text-sm text-muted-foreground">
              No hay repuestos pendientes de asignación en este grupo.
            </p>
          </div>
        ) : (
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 pt-2"
          >
            <FormSelect
              control={form.control}
              name="delivered_to"
              label="Técnico"
              placeholder="Seleccione un técnico"
              options={planningWorkers
                .filter(
                  (w, i, arr) =>
                    arr.findIndex((x) => x.worker_id === w.worker_id) === i,
                )
                .map((w) => ({
                  value: w.worker_id.toString(),
                  label: w.worker_name,
                }))}
            />

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          assignableParts.length > 0 &&
                          selectedIds.length === assignableParts.length
                        }
                        onCheckedChange={handleToggleAll}
                      />
                    </TableHead>
                    <TableHead>Repuesto</TableHead>
                    <TableHead className="text-center">
                      Cant. registrada
                    </TableHead>
                    <TableHead className="text-center w-32">
                      Cant. a entregar
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignableParts.map((part) => (
                    <TableRow key={part.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(part.id)}
                          onCheckedChange={() => handleToggle(part.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{part.product_name}</p>
                        {part.product_code && (
                          <p className="text-xs text-muted-foreground">
                            Cód: {part.product_code}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {Number(part.quantity_used).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Input
                          type="number"
                          inputMode="decimal"
                          min={0}
                          max={part.quantity_used}
                          className="h-8 text-center"
                          disabled={!selectedIds.includes(part.id)}
                          value={quantities[part.id] ?? ""}
                          onChange={(e) =>
                            handleQuantityChange(part.id, e.target.value)
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

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
                  <>
                    <PackageCheck className="h-4 w-4 mr-2" />
                    Asignar {selectedIds.length > 0 && `(${selectedIds.length})`}
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </Form>
    </GeneralSheet>
  );
}
