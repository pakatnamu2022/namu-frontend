"use client";

import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Package, Loader2, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  deleteWorkOrderParts,
  getAllWorkOrderParts,
  storeWorkOrderParts,
} from "@/features/ap/post-venta/taller/orden-trabajo-repuesto/lib/workOrderParts.actions";
import {
  workOrderPartsSchema,
  type WorkOrderPartsFormData,
} from "@/features/ap/post-venta/taller/orden-trabajo-repuesto/lib/workOrderParts.schema";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { useAllWarehouse } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.hook";
import { useEffect, useMemo } from "react";
import GroupSelector from "../GroupSelector";
import { useWorkOrderContext } from "../../contexts/WorkOrderContext";
import { findWorkOrderById } from "../../lib/workOrder.actions";
import { ProductSelectAsync } from "@/features/ap/post-venta/taller/orden-trabajo-repuesto/components/ProductSelectAsync";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import { WORKER_ORDER_PARTS } from "../../../orden-trabajo-repuesto/lib/workOrderParts.constants";

interface PartsTabProps {
  workOrderId: number;
}

export default function PartsTab({ workOrderId }: PartsTabProps) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const { selectedGroupNumber, setSelectedGroupNumber } = useWorkOrderContext();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { MODEL } = WORKER_ORDER_PARTS;

  const { data: parts = [], isLoading } = useQuery({
    queryKey: ["workOrderParts", workOrderId],
    queryFn: () =>
      getAllWorkOrderParts({ params: { work_order_id: workOrderId } }),
    enabled: !!workOrderId,
  });

  // Consultar la orden de trabajo con sus items
  const { data: workOrder, isLoading: isLoadingWorkOrder } = useQuery({
    queryKey: ["workOrder", workOrderId],
    queryFn: () => findWorkOrderById(workOrderId),
  });

  const items = useMemo(() => workOrder?.items || [], [workOrder?.items]);

  // Auto-seleccionar el primer grupo si no hay ninguno seleccionado
  useEffect(() => {
    if (items.length > 0 && selectedGroupNumber === null) {
      const firstGroup = Math.min(...items.map((i) => i.group_number));
      setSelectedGroupNumber(firstGroup);
    }
  }, [items, selectedGroupNumber, setSelectedGroupNumber]);

  const { data: warehouses = [], isLoading: isLoadingWarehouses } =
    useAllWarehouse({
      is_physical_warehouse: 1,
    });

  const form = useForm<WorkOrderPartsFormData>({
    resolver: zodResolver(workOrderPartsSchema),
    defaultValues: {
      group_number: 1,
      warehouse_id: "",
      product_id: "",
      quantity_used: 1,
    },
  });

  const selectedWarehouseId = form.watch("warehouse_id");

  // Actualizar el grupo cuando cambie selectedGroupNumber
  useEffect(() => {
    if (selectedGroupNumber) {
      form.setValue("group_number", selectedGroupNumber);
    }
  }, [selectedGroupNumber, form]);

  const storeMutation = useMutation({
    mutationFn: (data: WorkOrderPartsFormData) =>
      storeWorkOrderParts({
        id: 0,
        work_order_id: workOrderId,
        group_number: data.group_number,
        warehouse_id: data.warehouse_id,
        product_id: data.product_id,
        quantity_used: data.quantity_used,
      }),
    onSuccess: () => {
      successToast("Repuesto agregado exitosamente");
      queryClient.invalidateQueries({
        queryKey: ["workOrderParts", workOrderId],
      });
      form.reset();
      setShowForm(false);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(msg || "Error al agregar el repuesto");
    },
  });

  const handleSubmit = (data: WorkOrderPartsFormData) => {
    storeMutation.mutate(data);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteWorkOrderParts(deleteId);
      queryClient.invalidateQueries({
        queryKey: ["workOrderParts", workOrderId],
      });
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "delete", msg));
    } finally {
      setDeleteId(null);
    }
  };

  const filteredParts = parts.filter(
    (part) => part.group_number === selectedGroupNumber
  );

  if (isLoading || isLoadingWarehouses || isLoadingWorkOrder) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selector de Grupo */}
      <GroupSelector
        items={items}
        selectedGroupNumber={selectedGroupNumber}
        onSelectGroup={setSelectedGroupNumber}
      />

      {/* Formulario para agregar repuestos */}
      {!showForm ? (
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="h-6 w-6 text-primary" />
              <div>
                <h3 className="text-lg font-semibold">
                  Repuestos - Grupo {selectedGroupNumber}
                </h3>
                <p className="text-sm text-gray-600">
                  {filteredParts.length} repuesto
                  {filteredParts.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Agregar Repuesto
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Package className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-semibold">
                Agregar Repuesto - Grupo {selectedGroupNumber}
              </h3>
            </div>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <input
                type="hidden"
                {...form.register("group_number")}
                value={selectedGroupNumber ?? 1}
              />

              <FormField
                control={form.control}
                name="warehouse_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Almacén</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un almacén" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {warehouses.map((warehouse) => (
                          <SelectItem
                            key={warehouse.id}
                            value={warehouse.id.toString()}
                          >
                            {warehouse.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <ProductSelectAsync
                control={form.control}
                warehouseId={selectedWarehouseId}
                disabled={!selectedWarehouseId}
              />

              <FormField
                control={form.control}
                name="quantity_used"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cantidad</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Cantidad"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.reset();
                    setShowForm(false);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={storeMutation.isPending}
                  className="gap-2"
                >
                  {storeMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Agregar
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </Card>
      )}

      {/* Tabla de repuestos */}
      {filteredParts.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay repuestos en el Grupo {selectedGroupNumber}
            </h3>
            <p className="text-sm text-gray-600">
              Aún no se han agregado repuestos para este grupo
            </p>
          </div>
        </Card>
      ) : (
        <Card className="p-6">
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Almacén</TableHead>
                  <TableHead>Registrado por</TableHead>
                  <TableHead className="text-center">Cantidad</TableHead>
                  <TableHead className="text-center">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParts.map((part) => (
                  <TableRow key={part.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{part.product_name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-600">
                        {part.warehouse_name}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-600">
                        {part.registered_by_name}
                      </p>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="font-semibold">
                        {part.quantity_used}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Trash2
                        className="h-5 w-5 text-red-500 cursor-pointer"
                        onClick={() => setDeleteId(part.id)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
