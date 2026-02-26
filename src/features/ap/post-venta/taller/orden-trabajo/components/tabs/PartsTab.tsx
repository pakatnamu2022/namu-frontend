"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Package,
  Loader2,
  Plus,
  Trash2,
  Tag,
  Pencil,
  CheckCircle,
  XCircle,
  Percent,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import GroupSelector from "../GroupSelector";
import { useWorkOrderContext } from "../../contexts/WorkOrderContext";
import { findWorkOrderById } from "../../lib/workOrder.actions";
import { FormInput } from "@/shared/components/FormInput";
import { useAuthStore } from "@/features/auth/lib/auth.store";
import { DEFAULT_APPROVED_DISCOUNT } from "@/core/core.constants";
import { ITEM_TYPE_PRODUCT } from "../../../cotizacion-detalle/lib/proformaDetails.constants";
import { useDiscountRequestsByWorkOrder } from "../../../descuento-cotizacion-taller/lib/discountRequestTaller.hook";
import { DiscountRequestWorkOrderModal } from "../../../descuento-cotizacion-taller/components/DiscountRequestWorkOrderModal";
import {
  approveDiscountRequestWorkOrderQuotation,
  rejectDiscountRequestWorkOrderQuotation,
} from "../../../descuento-cotizacion-taller/lib/discountRequestTaller.actions";
import {
  DISCOUNT_REQUEST_TALLER,
  TYPE_GLOBAL,
  TYPE_PARTIAL,
  MODEL_PART,
} from "../../../descuento-cotizacion-taller/lib/discountRequestTaller.constants";
import { DiscountRequestWorkOrderQuotationResource } from "../../../descuento-cotizacion-taller/lib/discountRequestTaller.interface";

interface PartsTabProps {
  workOrderId: number;
}

interface AddPartFormValues {
  product_id: string;
  quantity_used: number;
  unit_price: number;
  discount_percentage: number;
}

const createPartFormSchema = (maxDiscount: number) => {
  return z.object({
    product_id: z.string().min(1, "El producto es requerido"),
    quantity_used: z.number().min(0.01, "La cantidad debe ser mayor a 0"),
    unit_price: z.number().min(0, "El precio debe ser mayor o igual a 0"),
    discount_percentage: z
      .number()
      .min(0, "El descuento no puede ser negativo")
      .max(maxDiscount, `El descuento no puede ser mayor a ${maxDiscount}%`),
  });
};

export default function PartsTab({ workOrderId }: PartsTabProps) {
  const queryClient = useQueryClient();
  const { selectedGroupNumber, setSelectedGroupNumber } = useWorkOrderContext();
  const { user } = useAuthStore();
  const [selectedWarehouseForBulk, setSelectedWarehouseForBulk] =
    useState<string>("");
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedWarehouseForAdd, setSelectedWarehouseForAdd] =
    useState<string>("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Modal de descuento
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"GLOBAL" | "PARTIAL">(TYPE_PARTIAL);
  const [selectedPart, setSelectedPart] = useState<any | null>(null);
  const [editingRequest, setEditingRequest] =
    useState<DiscountRequestWorkOrderQuotationResource | null>(null);

  const maxDiscountPercentage =
    user?.discount_percentage ?? DEFAULT_APPROVED_DISCOUNT;

  const form = useForm<AddPartFormValues>({
    resolver: zodResolver(createPartFormSchema(maxDiscountPercentage)),
    mode: "onChange",
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

  const { data: workOrder, isLoading: isLoadingWorkOrder } = useQuery({
    queryKey: ["workOrder", workOrderId],
    queryFn: () => findWorkOrderById(workOrderId),
  });

  const items = useMemo(() => workOrder?.items || [], [workOrder?.items]);

  const associatedQuotation = workOrder?.order_quotation || null;
  const hasAssociatedQuotation = workOrder?.order_quotation_id !== null;

  useEffect(() => {
    if (items.length > 0 && selectedGroupNumber === null) {
      const firstGroup = Math.min(...items.map((i) => i.group_number));
      setSelectedGroupNumber(firstGroup);
    }
  }, [items, selectedGroupNumber, setSelectedGroupNumber]);

  const { data: warehouses = [], isLoading: isLoadingWarehouses } =
    useAllWarehouse({ is_physical_warehouse: 1 });

  const filteredWarehouses = useMemo(() => {
    if (workOrder?.sede_id) {
      return warehouses.filter((w) => w.sede_id === Number(workOrder.sede_id));
    }
    return warehouses;
  }, [warehouses, workOrder?.sede_id]);

  useEffect(() => {
    if (filteredWarehouses.length > 0 && !selectedWarehouseForBulk) {
      setSelectedWarehouseForBulk(filteredWarehouses[0].id.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredWarehouses]);

  useEffect(() => {
    if (filteredWarehouses.length > 0 && !selectedWarehouseForAdd) {
      setSelectedWarehouseForAdd(filteredWarehouses[0].id.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredWarehouses]);

  // Solicitudes de descuento de la OT — solo las de PRODUCT
  const { data: allDiscountRequests = [] } =
    useDiscountRequestsByWorkOrder(workOrderId);
  const discountRequests = allDiscountRequests.filter(
    (r) => r.item_type === "PART",
  );

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
      queryClient.invalidateQueries({ queryKey: ["workOrderParts", workOrderId] });
      queryClient.invalidateQueries({ queryKey: ["workOrder", workOrderId] });
      setSelectedProductIds([]);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(msg || "Error al insertar los repuestos desde la cotización");
    },
  });

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
      queryClient.invalidateQueries({ queryKey: ["workOrderParts", workOrderId] });
      form.reset({ product_id: "", quantity_used: 1, unit_price: 0, discount_percentage: 0 });
      setShowAddForm(false);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(msg || "Error al agregar el repuesto");
    },
  });

  const handleSubmitPart = (data: AddPartFormValues) => {
    if (!selectedGroupNumber) { errorToast("Debe seleccionar un grupo"); return; }
    if (!selectedWarehouseForAdd) { errorToast("Debe seleccionar un almacén"); return; }
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
        (d: any) => d.item_type === ITEM_TYPE_PRODUCT && d.status === "pending",
      );
      if (selectedProductIds.length === productDetails.length) {
        setSelectedProductIds([]);
      } else {
        setSelectedProductIds(productDetails.map((d: any) => d.id));
      }
    }
  };

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteWorkOrderParts(id),
    onSuccess: () => {
      successToast("Repuesto eliminado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["workOrderParts", workOrderId] });
      queryClient.invalidateQueries({ queryKey: ["workOrder", workOrderId] });
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

  const filteredParts = parts.filter(
    (part) => part.group_number === selectedGroupNumber,
  );

  // --- Lógica global/partial ---
  const globalRequest = discountRequests.find((r) => r.type === TYPE_GLOBAL);
  const hasPartialRequests = discountRequests.some(
    (r) => r.type === TYPE_PARTIAL,
  );
  const hasMultipleItems = filteredParts.length > 1;

  const getPartialRequest = (partId: number) =>
    discountRequests.find(
      (r) =>
        r.type === TYPE_PARTIAL &&
        r.part_labour_id === partId &&
        r.part_labour_model === MODEL_PART,
    );

  // Total de repuestos filtrados (base para el global)
  const globalBaseAmount = filteredParts.reduce(
    (acc, p) => acc + parseFloat(p.total_amount || "0"),
    0,
  );

  const handleOpenCreate = (type: "GLOBAL" | "PARTIAL", part?: any) => {
    setEditingRequest(null);
    setModalType(type);
    setSelectedPart(part ?? null);
    setModalOpen(true);
  };

  const handleOpenEdit = (
    request: DiscountRequestWorkOrderQuotationResource,
    part?: any,
  ) => {
    setEditingRequest(request);
    setModalType(request.type);
    setSelectedPart(part ?? null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedPart(null);
    setEditingRequest(null);
  };

  const { mutate: doApprove, isPending: isApproving } = useMutation({
    mutationFn: approveDiscountRequestWorkOrderQuotation,
    onSuccess: () => {
      successToast("Solicitud aprobada correctamente");
      queryClient.invalidateQueries({
        queryKey: [DISCOUNT_REQUEST_TALLER.QUERY_KEY, "work-order", workOrderId],
      });
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message || "Error al aprobar la solicitud",
      );
    },
  });

  const { mutate: doReject, isPending: isRejecting } = useMutation({
    mutationFn: rejectDiscountRequestWorkOrderQuotation,
    onSuccess: () => {
      successToast("Solicitud rechazada correctamente");
      queryClient.invalidateQueries({
        queryKey: [DISCOUNT_REQUEST_TALLER.QUERY_KEY, "work-order", workOrderId],
      });
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message || "Error al rechazar la solicitud",
      );
    },
  });

  const renderStatusBadge = (status: string) => (
    <Badge
      color={
        status === "approved" ? "green" : status === "rejected" ? "red" : "orange"
      }
      className="text-xs"
    >
      {status === "approved"
        ? "Aprobado"
        : status === "rejected"
          ? "Rechazado"
          : "Pendiente"}
    </Badge>
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <FormSelectAsync
                  name="product_id"
                  label="Producto"
                  placeholder="Buscar producto en el almacén..."
                  control={form.control}
                  useQueryHook={useInventory}
                  additionalParams={{ warehouse_id: selectedWarehouseForAdd }}
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
                  label={`Descuento (% máx: ${maxDiscountPercentage})`}
                  type="number"
                  min={0}
                  max={maxDiscountPercentage}
                  step="0.01"
                  control={form.control}
                  placeholder="0.0"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowAddForm(false); form.reset(); }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={storePartMutation.isPending || !form.watch("product_id")}
                  className="gap-2"
                >
                  {storePartMutation.isPending ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />Guardando...</>
                  ) : (
                    <><Plus className="h-4 w-4" />Agregar</>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </Card>
      )}

      {/* Cotización asociada */}
      {hasAssociatedQuotation &&
        associatedQuotation &&
        associatedQuotation.details?.filter(
          (d: any) => d.item_type === ITEM_TYPE_PRODUCT && d.status === "pending",
        ).length > 0 && (
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="text-lg font-semibold">
                      Cotización Asociada: {associatedQuotation.quotation_number}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {associatedQuotation.details?.filter(
                        (d: any) =>
                          d.item_type === ITEM_TYPE_PRODUCT && d.status === "pending",
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
                      if (!selectedWarehouseForBulk) { errorToast("Debe seleccionar un almacén"); return; }
                      if (selectedProductIds.length === 0) { errorToast("Debe seleccionar al menos un producto"); return; }
                      if (!selectedGroupNumber) { errorToast("Debe seleccionar un grupo"); return; }
                      storeBulkMutation.mutate({
                        warehouseId: Number(selectedWarehouseForBulk),
                        groupNumber: selectedGroupNumber,
                      });
                    }}
                    disabled={storeBulkMutation.isPending || selectedProductIds.length === 0}
                    className="gap-2"
                  >
                    {storeBulkMutation.isPending ? (
                      <><Loader2 className="h-4 w-4 animate-spin" />Insertando...</>
                    ) : (
                      <><Plus className="h-4 w-4" />Insertar al Grupo {selectedGroupNumber} ({selectedProductIds.length})</>
                    )}
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={
                            associatedQuotation.details?.filter(
                              (d: any) =>
                                d.item_type === ITEM_TYPE_PRODUCT && d.status === "pending",
                            ).length > 0 &&
                            selectedProductIds.length ===
                              associatedQuotation.details?.filter(
                                (d: any) =>
                                  d.item_type === ITEM_TYPE_PRODUCT && d.status === "pending",
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
                          detail.item_type === ITEM_TYPE_PRODUCT && detail.status === "pending",
                      )
                      .map((detail: any) => {
                        const currencySymbol =
                          associatedQuotation.type_currency?.symbol || "S/.";
                        return (
                          <TableRow key={detail.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedProductIds.includes(detail.id)}
                                onCheckedChange={() => handleToggleProduct(detail.id)}
                              />
                            </TableCell>
                            <TableCell>
                              <p className="font-medium">{detail.description}</p>
                            </TableCell>
                            <TableCell className="text-center">
                              {Number(detail.quantity).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right">
                              <p className="text-sm">
                                {currencySymbol} {Number(detail.unit_price || 0).toFixed(2)}
                              </p>
                            </TableCell>
                            <TableCell className="text-right">
                              <p className="text-sm text-orange-600">
                                -{Number(detail.discount_percentage || 0).toFixed(2)} %
                              </p>
                            </TableCell>
                            <TableCell className="text-right">
                              <p className="text-sm font-semibold">
                                {currencySymbol} {Number(detail.total_amount || 0).toFixed(2)}
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
          {/* Header con botón descuento global */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="text-lg font-semibold">Repuestos Registrados</h3>

            {hasMultipleItems && (
              <div className="flex items-center gap-2 flex-wrap">
                {globalRequest ? (
                  <div className="flex items-center gap-2 text-sm border rounded-md px-3 py-1.5">
                    <span className="text-muted-foreground text-xs">
                      Desc. global:
                    </span>
                    <span className="font-semibold">
                      {Number(globalRequest.requested_discount_percentage).toFixed(2)}%
                    </span>
                    {renderStatusBadge(globalRequest.status)}
                    {globalRequest.status === "pending" && (
                      <>
                        <ConfirmationDialog
                          trigger={
                            <Button
                              variant="outline"
                              size="icon"
                              className="size-7 text-green-600 hover:text-green-600 hover:bg-green-50"
                              tooltip="Aprobar solicitud global"
                              disabled={isApproving}
                            >
                              <CheckCircle className="size-4" />
                            </Button>
                          }
                          title="¿Aprobar solicitud?"
                          description="Se aprobará el descuento global para los repuestos. ¿Deseas continuar?"
                          confirmText="Sí, aprobar"
                          cancelText="Cancelar"
                          icon="info"
                          onConfirm={() => doApprove(globalRequest.id)}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-7"
                          tooltip="Editar solicitud global"
                          onClick={() => handleOpenEdit(globalRequest)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <ConfirmationDialog
                          trigger={
                            <Button
                              variant="outline"
                              size="icon"
                              className="size-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                              tooltip="Rechazar solicitud global"
                              disabled={isRejecting}
                            >
                              <XCircle className="size-4" />
                            </Button>
                          }
                          title="¿Rechazar solicitud?"
                          description="Se rechazará el descuento global para los repuestos. ¿Deseas continuar?"
                          confirmText="Sí, rechazar"
                          cancelText="Cancelar"
                          variant="destructive"
                          icon="danger"
                          onConfirm={() => doReject(globalRequest.id)}
                        />
                      </>
                    )}
                  </div>
                ) : (
                  !hasPartialRequests && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenCreate(TYPE_GLOBAL)}
                      className="gap-2"
                    >
                      <Percent className="size-4" />
                      Desc. global
                    </Button>
                  )
                )}
              </div>
            )}
          </div>

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
                <TableHead className="text-center w-40">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParts.map((part) => {
                const partialRequest = getPartialRequest(part.id);
                return (
                  <TableRow key={part.id}>
                    <TableCell>
                      <p className="font-medium">{part.product_name}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-600">{part.warehouse_name}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-600">{part.registered_by_name}</p>
                    </TableCell>
                    <TableCell className="text-center">{part.quantity_used}</TableCell>
                    <TableCell className="text-right">
                      {workOrder?.type_currency?.symbol || "S/"}{" "}
                      {part.unit_price ? Number(part.unit_price).toFixed(2) : "0.00"}
                    </TableCell>
                    <TableCell className="text-right text-orange-600">
                      -{part.discount_percentage}%
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {workOrder?.type_currency?.symbol || "S/"}{" "}
                      {part.total_amount ? Number(part.total_amount).toFixed(2) : "0.00"}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* Descuento parcial: solo si no hay global */}
                        {!globalRequest && (
                          <>
                            {partialRequest ? (
                              <>
                                {renderStatusBadge(partialRequest.status)}
                                {partialRequest.status === "pending" && (
                                  <>
                                    <ConfirmationDialog
                                      trigger={
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 w-7 p-0 text-green-600 hover:text-green-600 hover:bg-green-50"
                                          tooltip="Aprobar solicitud"
                                          disabled={isApproving}
                                        >
                                          <CheckCircle className="h-4 w-4" />
                                        </Button>
                                      }
                                      title="¿Aprobar solicitud?"
                                      description="Se aprobará el descuento solicitado para este repuesto. ¿Deseas continuar?"
                                      confirmText="Sí, aprobar"
                                      cancelText="Cancelar"
                                      icon="info"
                                      onConfirm={() => doApprove(partialRequest.id)}
                                    />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0"
                                      tooltip="Editar solicitud"
                                      onClick={() => handleOpenEdit(partialRequest, part)}
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <ConfirmationDialog
                                      trigger={
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                          tooltip="Rechazar solicitud"
                                          disabled={isRejecting}
                                        >
                                          <XCircle className="h-4 w-4" />
                                        </Button>
                                      }
                                      title="¿Rechazar solicitud?"
                                      description="Se rechazará el descuento solicitado para este repuesto. ¿Deseas continuar?"
                                      confirmText="Sí, rechazar"
                                      cancelText="Cancelar"
                                      variant="destructive"
                                      icon="danger"
                                      onConfirm={() => doReject(partialRequest.id)}
                                    />
                                  </>
                                )}
                              </>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-primary hover:text-primary hover:bg-primary/10"
                                tooltip="Solicitar descuento parcial"
                                onClick={() => handleOpenCreate(TYPE_PARTIAL, part)}
                              >
                                <Tag className="h-4 w-4" />
                              </Button>
                            )}
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(part.id)}
                          className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Total de Repuestos */}
          <div className="flex justify-end mt-4 pt-4 border-t">
            <div className="text-right">
              <p className="text-sm text-gray-600">Total de Repuestos:</p>
              <p className="text-xl font-bold">
                {workOrder?.type_currency?.symbol || "S/"}{" "}
                {filteredParts
                  .reduce((acc, part) => acc + parseFloat(part.total_amount || "0"), 0)
                  .toFixed(2)}
              </p>
            </div>
          </div>
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

      {/* Modal Solicitar Descuento */}
      <DiscountRequestWorkOrderModal
        open={modalOpen}
        onClose={handleCloseModal}
        type={modalType}
        workOrderId={workOrderId}
        baseAmount={
          modalType === TYPE_GLOBAL
            ? globalBaseAmount
            : parseFloat(selectedPart?.total_amount || "0")
        }
        partLabourId={modalType === TYPE_PARTIAL ? selectedPart?.id : undefined}
        partLabourModel={modalType === TYPE_PARTIAL ? MODEL_PART : undefined}
        itemDescription={
          modalType === TYPE_PARTIAL ? selectedPart?.product_name : undefined
        }
        currencySymbol={workOrder?.type_currency?.symbol || "S/"}
        existingRequest={editingRequest ?? undefined}
        itemType="PART"
      />
    </div>
  );
}
