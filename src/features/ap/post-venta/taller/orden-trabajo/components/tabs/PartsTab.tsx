"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
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
  Copy,
  Check,
  UserCheck,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  deleteWorkOrderParts,
} from "@/features/ap/post-venta/taller/orden-trabajo-repuesto/lib/workOrderParts.actions";
import { AssignPartToTechnicianSheet } from "../AssignPartToTechnicianSheet";
import { errorToast, successToast } from "@/core/core.function";
import { useAllWarehouse } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.hook";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { useWorkOrderContext } from "../../contexts/WorkOrderContext";
import { findWorkOrderById } from "../../lib/workOrder.actions";
import { ITEM_TYPE_PRODUCT } from "../../../cotizacion-detalle/lib/proformaDetails.constants";
import WorkOrderPartsForm from "@/features/ap/post-venta/taller/orden-trabajo-repuesto/components/WorkOrderPartsForm";
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
import { WORKER_ORDER } from "../../lib/workOrder.constants";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";

interface PartsTabProps {
  workOrderId: number;
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
  const [copiedCodeKey, setCopiedCodeKey] = useState<string | null>(null);
  const { ROUTE } = WORKER_ORDER;
  const permissions = useModulePermissions(ROUTE);

  const handleCopyCode = async (code: string, key: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCodeKey(key);
      setTimeout(() => setCopiedCodeKey(null), 2000);
    } catch (err) {
      console.error("Error al copiar:", err);
    }
  };

  // Sheet asignar repuesto a técnico
  const [assignSheetOpen, setAssignSheetOpen] = useState(false);
  const [assignPart, setAssignPart] = useState<{
    id: number;
    quantity_used: number;
    product_name: string;
  } | null>(null);

  const handleOpenAssignSheet = (part: {
    id: number;
    quantity_used: number;
    product_name: string;
  }) => {
    setAssignPart(part);
    setAssignSheetOpen(true);
  };

  // Modal de descuento
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"GLOBAL" | "PARTIAL">(
    TYPE_PARTIAL,
  );
  const [selectedPart, setSelectedPart] = useState<any | null>(null);
  const [editingRequest, setEditingRequest] =
    useState<DiscountRequestWorkOrderQuotationResource | null>(null);

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
      queryClient.invalidateQueries({
        queryKey: ["workOrderParts", workOrderId],
      });
      queryClient.invalidateQueries({ queryKey: ["workOrder", workOrderId] });
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
      queryClient.invalidateQueries({
        queryKey: ["workOrderParts", workOrderId],
      });
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
    (acc, p) => acc + parseFloat(p.net_amount || "0"),
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
        queryKey: [
          DISCOUNT_REQUEST_TALLER.QUERY_KEY,
          "work-order",
          workOrderId,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ["workOrderParts", workOrderId],
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
        queryKey: [
          DISCOUNT_REQUEST_TALLER.QUERY_KEY,
          "work-order",
          workOrderId,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ["workOrderParts", workOrderId],
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
        status === "approved"
          ? "green"
          : status === "rejected"
            ? "red"
            : "orange"
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
      {/* <GroupSelector
        items={items}
        selectedGroupNumber={selectedGroupNumber}
        onSelectGroup={setSelectedGroupNumber}
      /> */}

      {/* Botón Agregar Repuesto */}
      {!showAddForm && (
        <div className="flex justify-end">
          {permissions.canAddSparePartsOT && (
            <Button
              onClick={() => setShowAddForm(true)}
              className="gap-2"
              disabled={
                items.length === 0 || (workOrder?.advances?.length ?? 0) > 0
              }
            >
              <Plus className="h-4 w-4" />
              Agregar Repuesto
            </Button>
          )}
        </div>
      )}

      {/* Formulario Agregar Repuesto */}
      {showAddForm && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Agregar Repuesto</h3>
          </div>
          <WorkOrderPartsForm
            workOrderId={workOrderId}
            groupNumber={selectedGroupNumber!}
            warehouseId={selectedWarehouseForAdd}
            warehouseName={
              filteredWarehouses.find(
                (w) => w.id.toString() === selectedWarehouseForAdd,
              )?.description || ""
            }
            sedeName={workOrder?.sede_name}
            currencySymbol={
              associatedQuotation?.type_currency?.symbol ||
              workOrder?.type_currency?.symbol ||
              "S/"
            }
            onSuccess={() => setShowAddForm(false)}
            onCancel={() => setShowAddForm(false)}
          />
        </Card>
      )}

      {/* Cotización asociada */}
      {hasAssociatedQuotation &&
        associatedQuotation &&
        associatedQuotation.details?.filter(
          (d: any) =>
            d.item_type === ITEM_TYPE_PRODUCT && d.status === "pending",
        ).length > 0 && (
          <Card className="p-6">
            <div className="space-y-4">
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
                          d.item_type === ITEM_TYPE_PRODUCT &&
                          d.status === "pending",
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

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={
                            associatedQuotation.details?.filter(
                              (d: any) =>
                                d.item_type === ITEM_TYPE_PRODUCT &&
                                d.status === "pending",
                            ).length > 0 &&
                            selectedProductIds.length ===
                              associatedQuotation.details?.filter(
                                (d: any) =>
                                  d.item_type === ITEM_TYPE_PRODUCT &&
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
                          detail.item_type === ITEM_TYPE_PRODUCT &&
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
                              <div className="flex items-center gap-1">
                                <span className="font-semibold">
                                  {detail.product?.code || "-"}
                                </span>
                                {detail.product?.code && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 hover:bg-blue-100"
                                    onClick={() =>
                                      handleCopyCode(
                                        detail.product.code,
                                        `quotation-${detail.id}-code`,
                                      )
                                    }
                                    tooltip="Copiar código"
                                  >
                                    {copiedCodeKey ===
                                    `quotation-${detail.id}-code` ? (
                                      <Check className="h-3 w-3 text-green-600" />
                                    ) : (
                                      <Copy className="h-3 w-3 text-primary" />
                                    )}
                                  </Button>
                                )}
                              </div>
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
                      {Number(
                        globalRequest.requested_discount_percentage,
                      ).toFixed(2)}
                      %
                    </span>
                    {renderStatusBadge(globalRequest.status)}
                    {globalRequest.status === "pending" && (
                      <>
                        {permissions.canApprove && (
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
                        )}
                        {permissions.canEditDiscount && (
                          <Button
                            variant="outline"
                            size="icon"
                            className="size-7"
                            tooltip="Editar solicitud global"
                            onClick={() => handleOpenEdit(globalRequest)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                        )}
                        {permissions.canReject && (
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
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  permissions.canRequest &&
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
                <TableHead>Repuesto</TableHead>
                <TableHead>Almacén</TableHead>
                <TableHead>Registrado por</TableHead>
                <TableHead className="text-center">Cantidad</TableHead>
                <TableHead className="text-right">Precio Unit.</TableHead>
                <TableHead className="text-right">Cto. Total</TableHead>
                <TableHead className="text-right">Desc.</TableHead>
                <TableHead className="text-right">Cto. Neto</TableHead>
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
                      {part.product_code && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-xs text-muted-foreground">
                            Cód: {part.product_code}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 hover:bg-slate-200"
                            tooltip="Copiar código"
                            onClick={() =>
                              handleCopyCode(
                                part.product_code!,
                                `part-${part.id}-code`,
                              )
                            }
                          >
                            {copiedCodeKey === `part-${part.id}-code` ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      )}

                      {part.product_dyn_code && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-xs text-muted-foreground">
                            Cód Dyn: {part.product_dyn_code}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 hover:bg-slate-200"
                            tooltip="Copiar código"
                            onClick={() =>
                              handleCopyCode(
                                part.product_dyn_code!,
                                `part-${part.id}-dyn-code`,
                              )
                            }
                          >
                            {copiedCodeKey === `part-${part.id}-dyn-code` ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      )}
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
                    <TableCell className="text-right font-semibold">
                      {workOrder?.type_currency?.symbol || "S/"}{" "}
                      {part.total_cost
                        ? Number(part.total_cost).toFixed(2)
                        : "0.00"}
                    </TableCell>
                    <TableCell className="text-right text-orange-600">
                      -{part.discount_percentage}%
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {workOrder?.type_currency?.symbol || "S/"}{" "}
                      {part.net_amount
                        ? Number(part.net_amount).toFixed(2)
                        : "0.00"}
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
                                    {permissions.canApprove && (
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
                                        onConfirm={() =>
                                          doApprove(partialRequest.id)
                                        }
                                      />
                                    )}
                                    {permissions.canEditDiscount && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0"
                                        tooltip="Editar solicitud"
                                        onClick={() =>
                                          handleOpenEdit(partialRequest, part)
                                        }
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                    )}
                                    {permissions.canReject && (
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
                                        onConfirm={() =>
                                          doReject(partialRequest.id)
                                        }
                                      />
                                    )}
                                  </>
                                )}
                              </>
                            ) : permissions.canRequest ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-primary hover:text-primary hover:bg-primary/10"
                                tooltip="Solicitar descuento parcial"
                                onClick={() =>
                                  handleOpenCreate(TYPE_PARTIAL, part)
                                }
                              >
                                <Tag className="h-4 w-4" />
                              </Button>
                            ) : null}
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenAssignSheet(part)}
                          className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          tooltip="Asignar a técnico"
                        >
                          <UserCheck className="h-4 w-4" />
                        </Button>
                        {!globalRequest && !partialRequest && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteId(part.id)}
                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
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
                  .reduce(
                    (acc, part) => acc + parseFloat(part.net_amount || "0"),
                    0,
                  )
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

      {/* Sheet Asignar Repuesto a Técnico */}
      <AssignPartToTechnicianSheet
        open={assignSheetOpen}
        onClose={() => {
          setAssignSheetOpen(false);
          setAssignPart(null);
        }}
        workOrderId={workOrderId}
        part={assignPart}
      />

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
