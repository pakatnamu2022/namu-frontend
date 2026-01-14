"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Package, Loader2, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  updateWorkOrderParts,
} from "@/features/ap/post-venta/taller/orden-trabajo-repuesto/lib/workOrderParts.actions";
import { errorToast, successToast } from "@/core/core.function";
import { useAllWarehouse } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.hook";
import GroupSelector from "../GroupSelector";
import { useWorkOrderContext } from "../../contexts/WorkOrderContext";
import { findWorkOrderById } from "../../lib/workOrder.actions";

interface PartsTabProps {
  workOrderId: number;
}

export default function PartsTab({ workOrderId }: PartsTabProps) {
  const queryClient = useQueryClient();
  const { selectedGroupNumber, setSelectedGroupNumber } = useWorkOrderContext();
  const [selectedWarehouseForBulk, setSelectedWarehouseForBulk] =
    useState<string>("");
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);

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

  // Filtrar almacenes por sede si hay cotización asociada
  const filteredWarehouses = useMemo(() => {
    if (hasAssociatedQuotation && associatedQuotation?.sede_id) {
      return warehouses.filter(
        (w) => w.sede_id === associatedQuotation.sede_id
      );
    }
    return warehouses;
  }, [warehouses, hasAssociatedQuotation, associatedQuotation]);

  // Auto-seleccionar almacén cuando se asocia cotización
  useEffect(() => {
    if (
      hasAssociatedQuotation &&
      associatedQuotation?.sede_id &&
      filteredWarehouses.length > 0 &&
      !selectedWarehouseForBulk
    ) {
      setSelectedWarehouseForBulk(filteredWarehouses[0].id.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    hasAssociatedQuotation,
    associatedQuotation?.sede_id,
    filteredWarehouses,
  ]);

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
      setSelectedWarehouseForBulk("");
      setSelectedProductIds([]);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(msg || "Error al insertar los repuestos desde la cotización");
    },
  });

  const handleToggleProduct = (productId: number) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleToggleAll = () => {
    if (associatedQuotation?.details) {
      const productDetails = associatedQuotation.details.filter(
        (d: any) => d.item_type === "PRODUCT"
      );
      if (selectedProductIds.length === productDetails.length) {
        setSelectedProductIds([]);
      } else {
        setSelectedProductIds(productDetails.map((d: any) => d.id));
      }
    }
  };

  const updateGroupMutation = useMutation({
    mutationFn: ({
      partId,
      newGroupNumber,
      part,
    }: {
      partId: number;
      newGroupNumber: number;
      part: any;
    }) =>
      updateWorkOrderParts(partId, {
        id: part.id,
        work_order_id: workOrderId,
        group_number: newGroupNumber,
        warehouse_id: part.warehouse_id,
        product_id: part.product_id,
        quantity_used: part.quantity_used,
      }),
    onSuccess: () => {
      successToast("Grupo actualizado exitosamente");
      queryClient.invalidateQueries({
        queryKey: ["workOrderParts", workOrderId],
      });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(msg || "Error al actualizar el grupo");
    },
  });

  const handleGroupChange = (part: any, newGroupNumber: number) => {
    updateGroupMutation.mutate({
      partId: part.id,
      newGroupNumber,
      part,
    });
  };

  // Obtener los números de grupos únicos disponibles
  const availableGroups = useMemo(() => {
    return Array.from(new Set(items.map((item) => item.group_number))).sort();
  }, [items]);

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

      {/* Mostrar cotización asociada */}
      {hasAssociatedQuotation && associatedQuotation && (
        <Card className="p-6">
          <div className="space-y-4">
            {/* Header de la cotización asociada */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Package className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">
                    Cotización Asociada: {associatedQuotation.quotation_number}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {associatedQuotation.details?.filter(
                      (d: any) => d.item_type === "PRODUCT"
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
                            (d: any) => d.item_type === "PRODUCT"
                          ).length > 0 &&
                          selectedProductIds.length ===
                            associatedQuotation.details?.filter(
                              (d: any) => d.item_type === "PRODUCT"
                            ).length
                        }
                        onCheckedChange={handleToggleAll}
                      />
                    </TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="text-center">Cantidad</TableHead>
                    <TableHead className="text-right">P. Unitario</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {associatedQuotation.details
                    ?.filter((detail: any) => detail.item_type === "PRODUCT")
                    .map((detail: any) => {
                      const currencySymbol =
                        associatedQuotation.currency?.symbol || "S/.";
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
                            <p className="font-medium">{detail.description}</p>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="font-semibold">
                              {Number(detail.quantity).toFixed(2)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <p className="text-sm">
                              {currencySymbol}{" "}
                              {Number(detail.unit_price || 0).toFixed(2)}
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
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Grupo</TableHead>
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
                  <TableCell className="text-right">
                    S/{" "}
                    {part.unit_price
                      ? Number(part.unit_price).toFixed(2)
                      : "0.00"}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    S/{" "}
                    {part.total_amount
                      ? Number(part.total_amount).toFixed(2)
                      : "0.00"}
                  </TableCell>
                  <TableCell className="text-center">
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
                  S/{" "}
                  {filteredParts
                    .reduce(
                      (acc, part) => acc + parseFloat(part.total_amount || "0"),
                      0
                    )
                    .toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
