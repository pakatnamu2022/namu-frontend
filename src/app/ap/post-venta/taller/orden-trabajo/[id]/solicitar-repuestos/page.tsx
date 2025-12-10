"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Plus, Trash2, Package, Loader2 } from "lucide-react";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  errorToast,
  successToast,
  ERROR_MESSAGE,
  SUCCESS_MESSAGE,
} from "@/core/core.function";
import { WORKER_ORDER } from "@/features/ap/post-venta/taller/orden-trabajo/lib/workOrder.constants";
import { WORKER_ORDER_PARTS } from "@/features/ap/post-venta/taller/orden-trabajo-repuesto/lib/workOrderParts.constants";
import { findWorkOrderById } from "@/features/ap/post-venta/taller/orden-trabajo/lib/workOrder.actions";
import {
  getAllWorkOrderParts,
  storeWorkOrderParts,
  deleteWorkOrderParts,
} from "@/features/ap/post-venta/taller/orden-trabajo-repuesto/lib/workOrderParts.actions";
import {
  WorkOrderResource,
  GROUP_COLORS,
  DEFAULT_GROUP_COLOR,
} from "@/features/ap/post-venta/taller/orden-trabajo/lib/workOrder.interface";
import { WorkOrderPartsResource } from "@/features/ap/post-venta/taller/orden-trabajo-repuesto/lib/workOrderParts.interface";
import {
  workOrderPartsSchema,
  WorkOrderPartsFormData,
} from "@/features/ap/post-venta/taller/orden-trabajo-repuesto/lib/workOrderParts.schema";
import { FormSelect } from "@/shared/components/FormSelect";
import { useAllWarehouse } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.hook";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { getInventory } from "@/features/ap/post-venta/gestion-compras/inventario/lib/inventory.actions";
import { InventoryResource } from "@/features/ap/post-venta/gestion-compras/inventario/lib/inventory.interface";

export default function RequestPartsPage() {
  const params = useParams();
  const navigate = useNavigate();
  const workOrderId = Number(params.id);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingParts, setIsLoadingParts] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [workOrder, setWorkOrder] = useState<WorkOrderResource | null>(null);
  const [requestedParts, setRequestedParts] = useState<
    WorkOrderPartsResource[]
  >([]);
  const [inventoryProducts, setInventoryProducts] = useState<
    InventoryResource[]
  >([]);

  const form = useForm({
    resolver: zodResolver(workOrderPartsSchema),
    defaultValues: {
      group_number: 0,
      warehouse_id: "",
      product_id: "",
      quantity_used: 1,
    },
  });

  useEffect(() => {
    loadData();
  }, [workOrderId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [workOrderData, requestedPartsData] = await Promise.all([
        findWorkOrderById(workOrderId),
        getAllWorkOrderParts({ params: { work_order_id: workOrderId } }),
      ]);

      setWorkOrder(workOrderData);
      setRequestedParts(requestedPartsData);
    } catch (error: any) {
      errorToast("Error al cargar los datos");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRequestedParts = async () => {
    try {
      setIsLoadingParts(true);
      const requestedPartsData = await getAllWorkOrderParts({
        params: { work_order_id: workOrderId },
      });
      setRequestedParts(requestedPartsData);
    } catch (error: any) {
      errorToast("Error al cargar los repuestos");
      console.error(error);
    } finally {
      setIsLoadingParts(false);
    }
  };

  const selectedWarehouseId = form.watch("warehouse_id");

  const { data: warehouses = [], isLoading: isLoadingWarehouses } =
    useAllWarehouse({
      is_physical_warehouse: 1,
    });

  useEffect(() => {
    if (selectedWarehouseId) {
      loadInventoryProducts(selectedWarehouseId);
    } else {
      setInventoryProducts([]);
    }
  }, [selectedWarehouseId]);

  const loadInventoryProducts = async (warehouseId: string) => {
    try {
      setIsLoadingProducts(true);
      const response = await getInventory({
        params: { warehouse_id: warehouseId },
      });
      setInventoryProducts(response.data || []);
    } catch (error) {
      errorToast("Error al cargar los productos");
      console.error(error);
      setInventoryProducts([]);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  if (isLoadingWarehouses) {
    return <FormSkeleton />;
  }

  const onSubmit = async (data: WorkOrderPartsFormData) => {
    try {
      setIsSaving(true);

      // Validar stock disponible
      const selectedProduct = inventoryProducts.find(
        (item) => item.product_id === Number(data.product_id)
      );

      if (!selectedProduct) {
        errorToast("Producto no encontrado");
        setIsSaving(false);
        return;
      }

      if (data.quantity_used > selectedProduct.available_quantity) {
        errorToast(
          `Stock insuficiente. Disponible: ${selectedProduct.available_quantity}`
        );
        setIsSaving(false);
        return;
      }

      await storeWorkOrderParts({
        id: 0,
        work_order_id: workOrderId,
        group_number: data.group_number,
        product_id: data.product_id,
        warehouse_id: data.warehouse_id,
        quantity_used: data.quantity_used,
      });

      successToast(SUCCESS_MESSAGE(WORKER_ORDER_PARTS.MODEL, "create"));
      form.setValue("product_id", "");
      form.setValue("quantity_used", 1);
      await loadRequestedParts();
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(WORKER_ORDER_PARTS.MODEL, "create", msg));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteWorkOrderParts(id);
      successToast(SUCCESS_MESSAGE(WORKER_ORDER_PARTS.MODEL, "delete"));
      await loadRequestedParts();
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(WORKER_ORDER_PARTS.MODEL, "delete", msg));
    }
  };

  if (isLoading) return <PageSkeleton />;

  if (!workOrder) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Orden de trabajo no encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(WORKER_ORDER.ABSOLUTE_ROUTE)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <TitleComponent
          title="Solicitar Repuestos"
          subtitle={`OT: ${workOrder.correlative} - ${workOrder.vehicle_plate}`}
        />
      </div>

      {/* Formulario de solicitud */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Package className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Agregar Repuesto</h3>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <FormSelect
                name="group_number"
                label="Grupo"
                placeholder="Seleccione grupo"
                options={Array.from(
                  new Set(
                    workOrder.items?.map((item) => item.group_number) || []
                  )
                )
                  .sort((a, b) => a - b)
                  .map((groupNumber) => ({
                    label: `Grupo ${groupNumber}`,
                    value: groupNumber.toString(),
                  }))}
                control={form.control}
                strictFilter={true}
              />

              <FormSelect
                name="warehouse_id"
                label="Almacén"
                placeholder="Seleccione almacén"
                options={warehouses.map((item) => ({
                  label: item.description,
                  value: item.id.toString(),
                }))}
                control={form.control}
                strictFilter={true}
              />

              <FormSelect
                name="product_id"
                label="Producto"
                placeholder="Seleccione producto"
                options={inventoryProducts.map((inventory) => ({
                  label: () => (
                    <div className="flex items-center justify-between gap-2 w-full">
                      <span className="font-medium truncate">
                        {inventory.product.name}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded ${
                            inventory.available_quantity > 0
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          Stock: {inventory.available_quantity}
                        </span>
                      </div>
                    </div>
                  ),
                  value: inventory.product_id.toString(),
                }))}
                control={form.control}
                disabled={isLoadingProducts || !selectedWarehouseId}
              />

              <FormField
                control={form.control}
                name="quantity_used"
                render={({ field }) => {
                  const selectedProductId = form.watch("product_id");
                  const selectedProduct = inventoryProducts.find(
                    (item) => item.product_id === Number(selectedProductId)
                  );
                  const availableStock =
                    selectedProduct?.available_quantity || 0;
                  const fieldValue = Number(field.value) || 0;
                  const exceedsStock =
                    fieldValue > availableStock && selectedProductId;

                  return (
                    <FormItem className="relative">
                      <FormLabel>Cantidad</FormLabel>
                      <div className="absolute top-0 right-0">
                        {exceedsStock && (
                          <p className="text-xs text-red-600 font-medium">
                            Stock insuficiente. Disponible: {availableStock}
                          </p>
                        )}
                        {selectedProductId &&
                          !exceedsStock &&
                          availableStock > 0 && (
                            <p className="text-xs text-muted-foreground">
                              Disponible: {availableStock}
                            </p>
                          )}
                      </div>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max={availableStock > 0 ? availableStock : undefined}
                          value={field.value as number}
                          name={field.name}
                          ref={field.ref}
                          onBlur={field.onBlur}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          className={exceedsStock ? "border-red-500" : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={(() => {
                  const selectedProductId = form.watch("product_id");
                  const quantity = Number(form.watch("quantity_used")) || 0;
                  const selectedProduct = inventoryProducts.find(
                    (item) => item.product_id === Number(selectedProductId)
                  );
                  const exceedsStock =
                    selectedProductId &&
                    quantity > (selectedProduct?.available_quantity || 0);
                  return Boolean(isSaving || isLoadingProducts || exceedsStock);
                })()}
              >
                <Plus className="h-4 w-4 mr-2" />
                {isSaving ? "Agregando..." : "Agregar Repuesto"}
              </Button>
            </div>
          </form>
        </Form>
      </Card>

      {/* Lista de repuestos solicitados */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Repuestos Solicitados</h3>
          <Badge variant="secondary">{requestedParts.length} repuesto(s)</Badge>
        </div>

        {isLoadingParts ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : requestedParts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-1">
              No hay repuestos solicitados
            </p>
            <p className="text-xs text-gray-500">
              Agrega el primer repuesto para esta orden
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {requestedParts.map((part) => {
              const groupColor =
                GROUP_COLORS[part.group_number] || DEFAULT_GROUP_COLOR;
              return (
                <div
                  key={part.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Badge
                      className="shrink-0"
                      style={{ backgroundColor: groupColor.badge }}
                    >
                      Grupo {part.group_number}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {part.product_name}
                      </p>
                      <p className="text-xs font-bold text-gray-600 truncate">
                        SOLICITADO POR: {part.registered_by_name}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {part.warehouse_name}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      Cant: {part.quantity_used}
                    </Badge>
                    <Badge
                      className={`shrink-0 ${
                        part.is_delivered
                          ? "bg-green-100 text-green-700 hover:bg-green-100 hover:text-green-700"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-100 hover:text-gray-700"
                      }`}
                    >
                      {part.is_delivered ? "Aprobado" : "Pendiente"}
                    </Badge>
                  </div>

                  {!part.is_delivered && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 ml-2"
                      onClick={() => handleDelete(part.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
