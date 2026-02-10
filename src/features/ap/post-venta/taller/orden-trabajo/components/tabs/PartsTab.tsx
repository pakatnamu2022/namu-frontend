"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Package, Loader2, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form } from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getAllWorkOrderParts,
  storeBulkFromQuotation,
  storeWorkOrderParts,
  deleteWorkOrderParts,
} from "@/features/ap/post-venta/taller/orden-trabajo-repuesto/lib/workOrderParts.actions";
import { errorToast, successToast } from "@/core/core.function";
import { useAllWarehouse } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.hook";
import { useInventory } from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventory.hook";
import { InventoryResource } from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventory.interface";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import GroupSelector from "../GroupSelector";
import { useWorkOrderContext } from "../../contexts/WorkOrderContext";
import { findWorkOrderById } from "../../lib/workOrder.actions";
import { FormInput } from "@/shared/components/FormInput";

interface PartsTabProps {
  workOrderId: number;
}

interface AddPartFormValues {
  product_id: string;
  quantity_used: number;
  unit_price: number;
  discount_percentage: number;
}

export default function PartsTab({ workOrderId }: PartsTabProps) {
  const queryClient = useQueryClient();
  const { selectedGroupNumber, setSelectedGroupNumber } = useWorkOrderContext();
  const [selectedWarehouseForBulk, setSelectedWarehouseForBulk] =
    useState<string>("");
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedWarehouseForAdd, setSelectedWarehouseForAdd] =
    useState<string>("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Formulario para actualizar repuesto
  const form = useForm<AddPartFormValues>({
    defaultValues: {
      product_id: "",
      quantity_used: 1,
      unit_price: 0,
      discount_percentage: 0,
    },
  });

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

  // Obtener la cotización asociada si existe
  const associatedQuotation = workOrder?.order_quotation || null;
  const hasAssociatedQuotation = workOrder?.order_quotation_id !== null;

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

  // Filtrar almacenes por sede de la OT
  const filteredWarehouses = useMemo(() => {
    if (workOrder?.sede_id) {
      return warehouses.filter((w) => w.sede_id === Number(workOrder.sede_id));
    }
    return warehouses;
  }, [warehouses, workOrder?.sede_id]);

  // Auto-seleccionar almacén cuando se carga la OT
  useEffect(() => {
    if (filteredWarehouses.length > 0 && !selectedWarehouseForBulk) {
      setSelectedWarehouseForBulk(filteredWarehouses[0].id.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredWarehouses]);

  // Auto-seleccionar almacén para actualizar repuesto
  useEffect(() => {
    if (filteredWarehouses.length > 0 && !selectedWarehouseForAdd) {
      setSelectedWarehouseForAdd(filteredWarehouses[0].id.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredWarehouses]);

  const storeBulkMutation = useMutation({
    mutationFn: (params: { warehouseId: number; groupNumber: number }) =>
      storeBulkFromQuotation({
        quotation_id: associatedQuotation?.id || 0,
        work_order_id: workOrderId,
        warehouse_id: params.warehouseId,
        group_number: params.groupNumber,
        quotation_detail_ids: selectedProductIds,
      }),
    onSuccess: () => {
      successToast("Repuestos insertados exitosamente desde la cotización");
      queryClient.invalidateQueries({
        queryKey: ["workOrderParts", workOrderId],
      });
      queryClient.invalidateQueries({
        queryKey: ["workOrder", workOrderId],
      });
      setSelectedProductIds([]);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(msg || "Error al insertar los repuestos desde la cotización");
    },
  });

  // Mutación para actualizar un repuesto individual
  const storePartMutation = useMutation({
    mutationFn: (data: AddPartFormValues) =>
      storeWorkOrderParts({
        work_order_id: workOrderId,
        product_id: data.product_id,
        warehouse_id: selectedWarehouseForAdd,
        quantity_used: data.quantity_used,
        unit_price: data.unit_price,
        discount_percentage: data.discount_percentage,
        group_number: selectedGroupNumber!,
      }),
    onSuccess: () => {
      successToast("Repuesto agregado exitosamente");
      queryClient.invalidateQueries({
        queryKey: ["workOrderParts", workOrderId],
      });
      form.reset({
        product_id: "",
        quantity_used: 1,
        unit_price: 0,
        discount_percentage: 0,
      });
      setShowAddForm(false);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(msg || "Error al actualizar el repuesto");
    },
  });

  const handleSubmitPart = (data: AddPartFormValues) => {
    if (!selectedGroupNumber) {
      errorToast("Debe seleccionar un grupo");
      return;
    }
    if (!selectedWarehouseForAdd) {
      errorToast("Debe seleccionar un almacén");
      return;
    }
    storePartMutation.mutate(data);
  };

  const handleToggleProduct = (productId: number) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  const handleToggleAll = () => {
    if (associatedQuotation?.details) {
      const productDetails = associatedQuotation.details.filter(
        (d: any) => d.item_type === "PRODUCT" && d.status === "pending",
      );
      if (selectedProductIds.length === productDetails.length) {
        setSelectedProductIds([]);
      } else {
        setSelectedProductIds(productDetails.map((d: any) => d.id));
      }
    }
  };

  // const updateGroupMutation = useMutation({
  //   mutationFn: ({
  //     partId,
  //     newGroupNumber,
  //     part,
  //   }: {
  //     partId: number;
  //     newGroupNumber: number;
  //     part: any;
  //   }) =>
  //     updateWorkOrderParts(partId, {
  //       id: part.id,
  //       work_order_id: workOrderId,
  //       group_number: newGroupNumber,
  //       warehouse_id: part.warehouse_id,
  //       product_id: part.product_id,
  //       quantity_used: part.quantity_used,
  //     }),
  //   onSuccess: () => {
  //     successToast("Grupo actualizado exitosamente");
  //     queryClient.invalidateQueries({
  //       queryKey: ["workOrderParts", workOrderId],
  //     });
  //   },
  //   onError: (error: any) => {
  //     const msg = error?.response?.data?.message || "";
  //     errorToast(msg || "Error al actualizar el grupo");
  //   },
  // });

  // Mutación para eliminar repuesto
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteWorkOrderParts(id),
    onSuccess: () => {
      successToast("Repuesto eliminado exitosamente");
      queryClient.invalidateQueries({
        queryKey: ["workOrderParts", workOrderId],
      });
      queryClient.invalidateQueries({
        queryKey: ["workOrder", workOrderId],
      });
      setDeleteId(null);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(msg || "Error al eliminar el repuesto");
    },
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId);
  };

  // const handleGroupChange = (part: any, newGroupNumber: number) => {
  //   updateGroupMutation.mutate({
  //     partId: part.id,
  //     newGroupNumber,
  //     part,
  //   });
  // };

  // // Obtener los números de grupos únicos disponibles
  // const availableGroups = useMemo(() => {
  //   return Array.from(new Set(items.map((item) => item.group_number))).sort();
  // }, [items]);

  const filteredParts = parts.filter(
    (part) => part.group_number === selectedGroupNumber,
  );

  if (isLoading || isLoadingWarehouses || isLoadingWorkOrder) {
    return (
      <Card className="p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4"></div>
          <p className="text-gray-500">Cargando repuestos...</p>
        </div>
      </Card>
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

      {/* Botón Agregar Repuesto */}
      {!showAddForm && (
        <div className="flex justify-end">
          <Button
            onClick={() => setShowAddForm(true)}
            className="gap-2"
            disabled={items.length === 0}
          >
            <Plus className="h-4 w-4" />
            Agregar Repuesto
          </Button>
        </div>
      )}

      {/* Formulario Agregar Repuesto */}
      {showAddForm && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Agregar Repuesto</h3>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmitPart)}
              className="space-y-4"
            >
              {/* Almacén (bloqueado) */}
              <div className="bg-blue-50 border border-blue-200 rounded-md px-3 py-2">
                <p className="text-xs text-primary">
                  <span className="font-semibold">Almacén:</span>{" "}
                  {filteredWarehouses.find(
                    (w) => w.id.toString() === selectedWarehouseForAdd,
                  )?.description || "No seleccionado"}
                </p>
                <p className="text-xs text-primary">
                  <span className="font-semibold">Sede:</span>{" "}
                  {workOrder?.sede_name || "N/A"}
                </p>
              </div>

              {/* Producto */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <FormSelectAsync
                  name="product_id"
                  label="Producto"
                  placeholder="Buscar producto en el almacén..."
                  control={form.control}
                  useQueryHook={useInventory}
                  additionalParams={{
                    warehouse_id: selectedWarehouseForAdd,
                  }}
                  mapOptionFn={(inventory: InventoryResource) => ({
                    label: () => (
                      <div className="flex items-center justify-between gap-2 w-full">
                        <span className="font-medium truncate">
                          {inventory.product.code} - {inventory.product.name}
                        </span>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded shrink-0 ${
                            inventory.available_quantity > 0
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          Stock: {inventory.available_quantity}
                        </span>
                      </div>
                    ),
                    value: inventory.product_id.toString(),
                  })}
                  perPage={10}
                  debounceMs={500}
                />

                <FormInput
                  name="quantity_used"
                  label="Cantidad"
                  type="number"
                  placeholder="1"
                  control={form.control}
                />
              </div>

              {/* Precio y Descuento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  name="unit_price"
                  label={`Precio Unitario (${associatedQuotation?.type_currency?.symbol || workOrder?.type_currency?.symbol || "S/"})`}
                  type="number"
                  placeholder="0.0"
                  control={form.control}
                />

                <FormInput
                  name="discount_percentage"
                  label="Descuento (%)"
                  type="number"
                  control={form.control}
                  placeholder="0.0"
                />
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    form.reset();
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={
                    storePartMutation.isPending || !form.watch("product_id")
                  }
                  className="gap-2"
                >
                  {storePartMutation.isPending ? (
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

      {/* Mostrar cotización asociada */}
      {hasAssociatedQuotation &&
        associatedQuotation &&
        associatedQuotation.details?.filter(
          (d: any) => d.item_type === "PRODUCT" && d.status === "pending",
        ).length > 0 && (
          <Card className="p-6">
            <div className="space-y-4">
              {/* Header de la cotización asociada */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="text-lg font-semibold">
                      Cotización Asociada:{" "}
                      {associatedQuotation.quotation_number}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {associatedQuotation.details?.filter(
                        (d: any) =>
                          d.item_type === "PRODUCT" && d.status === "pending",
                      ).length || 0}{" "}
                      producto(s)
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select
                    value={selectedWarehouseForBulk}
                    onValueChange={setSelectedWarehouseForBulk}
                    disabled={hasAssociatedQuotation}
                  >
                    <SelectTrigger className="w-[230px]">
                      <SelectValue placeholder="Seleccione almacén" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredWarehouses.map((warehouse) => (
                        <SelectItem
                          key={warehouse.id}
                          value={warehouse.id.toString()}
                        >
                          {warehouse.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => {
                      if (!selectedWarehouseForBulk) {
                        errorToast("Debe seleccionar un almacén");
                        return;
                      }
                      if (selectedProductIds.length === 0) {
                        errorToast("Debe seleccionar al menos un producto");
                        return;
                      }
                      if (!selectedGroupNumber) {
                        errorToast("Debe seleccionar un grupo");
                        return;
                      }
                      storeBulkMutation.mutate({
                        warehouseId: Number(selectedWarehouseForBulk),
                        groupNumber: selectedGroupNumber,
                      });
                    }}
                    disabled={
                      storeBulkMutation.isPending ||
                      selectedProductIds.length === 0
                    }
                    className="gap-2"
                  >
                    {storeBulkMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Insertando...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Insertar al Grupo {selectedGroupNumber} (
                        {selectedProductIds.length})
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Tabla de productos de la cotización asociada */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={
                            associatedQuotation.details?.filter(
                              (d: any) =>
                                d.item_type === "PRODUCT" &&
                                d.status === "pending",
                            ).length > 0 &&
                            selectedProductIds.length ===
                              associatedQuotation.details?.filter(
                                (d: any) =>
                                  d.item_type === "PRODUCT" &&
                                  d.status === "pending",
                              ).length
                          }
                          onCheckedChange={handleToggleAll}
                        />
                      </TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead className="text-center">Cantidad</TableHead>
                      <TableHead className="text-right">P. Unitario</TableHead>
                      <TableHead className="text-right">Desc.</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {associatedQuotation.details
                      ?.filter(
                        (detail: any) =>
                          detail.item_type === "PRODUCT" &&
                          detail.status === "pending",
                      )
                      .map((detail: any) => {
                        const currencySymbol =
                          associatedQuotation.type_currency?.symbol || "S/.";
                        return (
                          <TableRow key={detail.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedProductIds.includes(detail.id)}
                                onCheckedChange={() =>
                                  handleToggleProduct(detail.id)
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <p className="font-medium">
                                {detail.description}
                              </p>
                            </TableCell>
                            <TableCell className="text-center">
                              {Number(detail.quantity).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right">
                              <p className="text-sm">
                                {currencySymbol}{" "}
                                {Number(detail.unit_price || 0).toFixed(2)}
                              </p>
                            </TableCell>
                            <TableCell className="text-right">
                              <p className="text-sm text-orange-600">
                                -
                                {Number(
                                  detail.discount_percentage || 0,
                                ).toFixed(2)}{" "}
                                %
                              </p>
                            </TableCell>
                            <TableCell className="text-right">
                              <p className="text-sm font-semibold">
                                {currencySymbol}{" "}
                                {Number(detail.total_amount || 0).toFixed(2)}
                              </p>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </div>
            </div>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Almacén</TableHead>
                <TableHead>Registrado por</TableHead>
                <TableHead className="text-center">Cantidad</TableHead>
                <TableHead className="text-right">Precio Unit.</TableHead>
                <TableHead className="text-right">Desc.</TableHead>
                <TableHead className="text-right">Costo Total</TableHead>
                {/* <TableHead className="text-center">Grupo</TableHead> */}
                <TableHead className="text-center w-[100px]">
                  Acciones
                </TableHead>
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
                    {part.quantity_used}
                  </TableCell>
                  <TableCell className="text-right">
                    {workOrder?.type_currency?.symbol || "S/"}{" "}
                    {part.unit_price
                      ? Number(part.unit_price).toFixed(2)
                      : "0.00"}
                  </TableCell>
                  <TableCell className="text-right text-orange-600">
                    -{part.discount_percentage}%
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {workOrder?.type_currency?.symbol || "S/"}{" "}
                    {part.total_amount
                      ? Number(part.total_amount).toFixed(2)
                      : "0.00"}
                  </TableCell>
                  {/* <TableCell className="text-center">
                    <Select
                      value={part.group_number.toString()}
                      onValueChange={(value) =>
                        handleGroupChange(part, Number(value))
                      }
                    >
                      <SelectTrigger className="w-[120px] mx-auto">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableGroups.map((groupNumber) => (
                          <SelectItem
                            key={groupNumber}
                            value={groupNumber.toString()}
                          >
                            Grupo {groupNumber}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell> */}
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(part.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Total de Repuestos */}
          {filteredParts.length > 0 && (
            <div className="flex justify-end mt-4 pt-4 border-t">
              <div className="text-right">
                <p className="text-sm text-gray-600">Total de Repuestos:</p>
                <p className="text-xl font-bold">
                  {workOrder?.type_currency?.symbol || "S/"}{" "}
                  {filteredParts
                    .reduce(
                      (acc, part) => acc + parseFloat(part.total_amount || "0"),
                      0,
                    )
                    .toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
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
