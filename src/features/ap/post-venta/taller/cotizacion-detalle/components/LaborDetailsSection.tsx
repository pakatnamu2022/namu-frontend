"use client";

import { useState } from "react";
import {
  Plus,
  Wrench,
  Pencil,
  Percent,
  CheckCircle,
  XCircle,
  Undo2,
  ArrowUpDown,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  errorToast,
  successToast,
  ERROR_MESSAGE,
  SUCCESS_MESSAGE,
} from "@/core/core.function";
import { DEFAULT_APPROVED_DISCOUNT } from "@/core/core.constants";
import { useAuthStore } from "@/features/auth/lib/auth.store";
import {
  ITEM_TYPE_LABOR,
  ITEM_TYPE_MATERIAL,
  ITEM_TYPE_TRANSLATOR,
  ORDER_QUOTATION_DETAILS,
} from "../lib/proformaDetails.constants";
import {
  storeOrderQuotationDetails,
  updateOrderQuotationDetails,
} from "../lib/proformaDetails.actions";
import { reorderOrderQuotationDetails } from "../../cotizacion/lib/proforma.actions";
import { OrderQuotationDetailsResource } from "../lib/proformaDetails.interface";
import { LaborDetailSchema } from "../lib/proformaDetails.schema";
import { QuotationItemsTable } from "./QuotationItemsTable";
import LaborDetailSheet from "./LaborDetailSheet";
import BulkDiscountModal from "./BulkDiscountModal";
import { DiscountRequestOrderQuotationResource } from "@/features/ap/post-venta/repuestos/descuento-cotizacion-meson/lib/discountRequestMeson.interface";
import { DiscountRequestModal } from "@/features/ap/post-venta/repuestos/descuento-cotizacion-meson/components/DiscountRequestModal";
import {
  approveDiscountRequestOrderQuotation,
  rejectDiscountRequestOrderQuotation,
  revertDiscountRequestOrderQuotation,
} from "@/features/ap/post-venta/repuestos/descuento-cotizacion-meson/lib/discountRequestMeson.actions";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import {
  TYPE_GLOBAL,
  TYPE_PARTIAL,
  DISCOUNT_REQUEST_MESON,
  STATUS_APPROVED,
  STATUS_PENDING,
  STATUS_REJECTED,
  ITEM_TYPE_DCT_LABOR,
} from "@/features/ap/post-venta/repuestos/descuento-cotizacion-meson/lib/discountRequestMeson.constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface LaborDetailsSectionProps {
  quotationId: number;
  constManHours: number;
  details: OrderQuotationDetailsResource[];
  isLoadingDetails: boolean;
  onRefresh: () => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  currencySymbol: string;
  currencyId: number;
  exchangeRate: number;
  discountRequests: DiscountRequestOrderQuotationResource[];
  permissions: {
    canEditDiscount: boolean;
    canApprove: boolean;
    canReject: boolean;
    canRequest: boolean;
    canRemoveSparePartQuote: boolean;
    canRemoveSparePartLabor: boolean;
    canReverseDiscount?: boolean;
  };
}

export default function LaborDetailsSection({
  quotationId,
  constManHours,
  details,
  isLoadingDetails,
  onRefresh,
  onDelete,
  currencySymbol,
  currencyId,
  exchangeRate,
  discountRequests,
  permissions,
}: LaborDetailsSectionProps) {
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // Sheet de agregar/editar ítem
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [editingDetail, setEditingDetail] =
    useState<OrderQuotationDetailsResource | null>(null);

  // Modo ordenar (drag & drop)
  const [isSorting, setIsSorting] = useState(false);
  const [sortedIds, setSortedIds] = useState<number[] | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  // Estado del modal de descuento
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"GLOBAL" | "PARTIAL">(TYPE_GLOBAL);
  const [selectedDetail, setSelectedDetail] =
    useState<OrderQuotationDetailsResource | null>(null);
  const [editingRequest, setEditingRequest] =
    useState<DiscountRequestOrderQuotationResource | null>(null);

  // Modal de descuento masivo
  const [bulkDiscountOpen, setBulkDiscountOpen] = useState(false);

  const { mutate: doApprove, isPending: isApproving } = useMutation({
    mutationFn: approveDiscountRequestOrderQuotation,
    onSuccess: async () => {
      successToast("Solicitud aprobada correctamente");
      queryClient.invalidateQueries({
        queryKey: [DISCOUNT_REQUEST_MESON.QUERY_KEY],
      });
      await onRefresh();
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Error al aprobar la solicitud";
      errorToast(message);
    },
  });

  const { mutate: doReject, isPending: isRejecting } = useMutation({
    mutationFn: rejectDiscountRequestOrderQuotation,
    onSuccess: async () => {
      successToast("Solicitud rechazada correctamente");
      queryClient.invalidateQueries({
        queryKey: [DISCOUNT_REQUEST_MESON.QUERY_KEY],
      });
      await onRefresh();
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Error al rechazar la solicitud";
      errorToast(message);
    },
  });

  const { mutate: doRevert, isPending: isReverting } = useMutation({
    mutationFn: revertDiscountRequestOrderQuotation,
    onSuccess: async () => {
      successToast("Aprobación revertida correctamente");
      queryClient.invalidateQueries({
        queryKey: [DISCOUNT_REQUEST_MESON.QUERY_KEY],
      });
      await onRefresh();
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Error al revertir la aprobación";
      errorToast(message);
    },
  });

  const [globalRevertReason, setGlobalRevertReason] = useState("");

  const handleOpenCreate = (
    type: "GLOBAL" | "PARTIAL",
    detail?: OrderQuotationDetailsResource,
  ) => {
    setEditingRequest(null);
    setModalType(type);
    setSelectedDetail(detail ?? null);
    setModalOpen(true);
  };

  const handleOpenEdit = (
    request: DiscountRequestOrderQuotationResource,
    detail?: OrderQuotationDetailsResource,
  ) => {
    setEditingRequest(request);
    setModalType(request.type);
    setSelectedDetail(detail ?? null);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setSelectedDetail(null);
    setEditingRequest(null);
  };

  const formatCurrency = (amount: string | number | null | undefined) => {
    const value = Number(amount) || 0;
    return `${currencySymbol} ${value.toFixed(2)}`;
  };

  const laborDetails = details.filter(
    (d) =>
      d.item_type === ITEM_TYPE_LABOR || d.item_type === ITEM_TYPE_MATERIAL,
  );

  // Mientras se está en modo ordenar, refleja el orden local (optimista) elegido por el usuario
  const displayedDetails = (() => {
    if (!isSorting || !sortedIds) return laborDetails;
    const byId = new Map(laborDetails.map((d) => [d.id, d]));
    return sortedIds.map((id) => byId.get(id)).filter(Boolean) as OrderQuotationDetailsResource[];
  })();

  const globalBaseAmount = laborDetails.reduce(
    (sum, d) => sum + Number(d.net_amount || 0),
    0,
  );
  const hasMultipleItems = laborDetails.length > 1;

  // Las solicitudes revertidas (reverted_by_id != null) se tratan como descartadas,
  // permitiendo volver a solicitar el descuento.
  const activeDiscountRequests = discountRequests.filter(
    (r) => r.reverted_by_id == null,
  );

  const globalRequest = activeDiscountRequests.find(
    (r) => r.type === TYPE_GLOBAL,
  );
  const hasPartialRequests = activeDiscountRequests.some(
    (r) => r.type === TYPE_PARTIAL,
  );

  // Calcular descuento máximo permitido (para formulario)
  const globalApprovedRequest = activeDiscountRequests.find(
    (r) => r.type === TYPE_GLOBAL && r.status === STATUS_APPROVED,
  );
  const maxDiscountAllowed = globalApprovedRequest
    ? Number(globalApprovedRequest.requested_discount_percentage)
    : (user?.discount_percentage ?? DEFAULT_APPROVED_DISCOUNT);

  const baseAmountForModal =
    modalType === TYPE_GLOBAL
      ? globalBaseAmount
      : Number(selectedDetail?.net_amount || 0);

  const maxDiscountForModal = maxDiscountAllowed;

  const openCreateSheet = () => {
    setEditingDetail(null);
    setDetailSheetOpen(true);
  };

  const openEditSheet = (detail: OrderQuotationDetailsResource) => {
    setEditingDetail(detail);
    setDetailSheetOpen(true);
  };

  const closeDetailSheet = () => {
    setDetailSheetOpen(false);
    setEditingDetail(null);
  };

  const handleConfirmDetail = async (data: LaborDetailSchema) => {
    try {
      setIsSaving(true);

      if (editingDetail) {
        await updateOrderQuotationDetails(editingDetail.id, {
          ...data,
          product_id: undefined,
        });
        successToast(SUCCESS_MESSAGE(ORDER_QUOTATION_DETAILS.MODEL, "update"));
      } else {
        await storeOrderQuotationDetails({
          ...data,
          product_id: undefined,
        });
        successToast(SUCCESS_MESSAGE(ORDER_QUOTATION_DETAILS.MODEL, "create"));
      }

      await onRefresh();
      closeDetailSheet();
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      const action = editingDetail ? "update" : "create";
      errorToast(ERROR_MESSAGE(ORDER_QUOTATION_DETAILS.MODEL, action, msg));
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSortMode = async () => {
    if (isSorting) {
      if (sortedIds) {
        try {
          setIsReordering(true);
          await reorderOrderQuotationDetails(quotationId, {
            items: sortedIds.map((id, index) => ({ id, order: index })),
          });
          successToast("Orden actualizado correctamente");
          await onRefresh();
        } catch (error: any) {
          const message =
            error?.response?.data?.message || "Error al actualizar el orden";
          errorToast(message);
        } finally {
          setIsReordering(false);
        }
      }
      setIsSorting(false);
      setSortedIds(null);
    } else {
      setSortedIds(laborDetails.map((d) => d.id));
      setIsSorting(true);
    }
  };

  const handleReorder = (orderedIds: number[]) => {
    setSortedIds(orderedIds);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Mano de Obra</h3>
        </div>

        <div className="flex items-center gap-2">
          {!isSorting && hasMultipleItems && permissions.canEditDiscount && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setBulkDiscountOpen(true)}
            >
              <Percent className="h-4 w-4 lg:mr-2" />
              <span className="hidden lg:inline">Descuento masivo</span>
            </Button>
          )}
          {laborDetails.length > 1 && (
            <Button
              type="button"
              variant={isSorting ? "default" : "outline"}
              size="sm"
              onClick={toggleSortMode}
              disabled={isReordering}
            >
              {isSorting ? (
                <>
                  <Check className="h-4 w-4 lg:mr-2" />
                  <span className="hidden lg:inline">Listo</span>
                </>
              ) : (
                <>
                  <ArrowUpDown className="h-4 w-4 lg:mr-2" />
                  <span className="hidden lg:inline">Ordenar</span>
                </>
              )}
            </Button>
          )}
          <Button type="button" size="sm" onClick={openCreateSheet}>
            <Plus className="h-4 w-4 lg:mr-2" />
            <span className="hidden lg:inline">Agregar</span>
          </Button>
        </div>
      </div>

      {/* Lista de Mano de Obra en formato tabla */}
      <div className="mt-6">
        {/* Header de la sección con botón de descuento global */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-gray-700">
              Items de Mano de Obra
            </h4>
            <Badge color="secondary" className="font-semibold">
              {laborDetails.length} item(s)
            </Badge>
          </div>

          {!isSorting && hasMultipleItems && laborDetails.length > 0 && (
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
                  <Badge
                    color={
                      globalRequest.status === STATUS_APPROVED
                        ? "green"
                        : globalRequest.status === STATUS_REJECTED
                          ? "red"
                          : "orange"
                    }
                  >
                    {globalRequest.status === STATUS_APPROVED
                      ? "Aprobado"
                      : globalRequest.status === STATUS_REJECTED
                        ? "Rechazado"
                        : "Pendiente"}
                  </Badge>
                  {globalRequest.status === STATUS_PENDING && (
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
                          description="Se aprobará el descuento global solicitado. ¿Deseas continuar?"
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
                          description="Se rechazará el descuento global solicitado. ¿Deseas continuar?"
                          confirmText="Sí, rechazar"
                          cancelText="Cancelar"
                          variant="destructive"
                          icon="danger"
                          onConfirm={() => doReject(globalRequest.id)}
                        />
                      )}
                    </>
                  )}
                  {globalRequest.status === STATUS_APPROVED &&
                    permissions.canReverseDiscount && (
                      <ConfirmationDialog
                        trigger={
                          <Button
                            variant="outline"
                            size="icon"
                            className="size-7 text-amber-600 hover:text-amber-600 hover:bg-amber-50"
                            tooltip="Revertir aprobación global"
                            disabled={isReverting}
                          >
                            <Undo2 className="size-4" />
                          </Button>
                        }
                        title="¿Revertir descuento aprobado?"
                        description="Se revertirá la aprobación del descuento global. Puedes indicar un motivo (opcional)."
                        confirmText="Sí, revertir"
                        cancelText="Cancelar"
                        variant="destructive"
                        icon="warning"
                        onConfirm={() => {
                          doRevert({
                            id: globalRequest.id,
                            reason: globalRevertReason.trim() || undefined,
                          });
                          setGlobalRevertReason("");
                        }}
                      >
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="global-revert-reason-labor"
                            className="text-xs"
                          >
                            Motivo (opcional)
                          </Label>
                          <Textarea
                            id="global-revert-reason-labor"
                            value={globalRevertReason}
                            onChange={(e) =>
                              setGlobalRevertReason(e.target.value)
                            }
                            placeholder="Ej: Se corrigió el porcentaje por error de digitación"
                            className="text-sm"
                            rows={3}
                          />
                        </div>
                      </ConfirmationDialog>
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

        <QuotationItemsTable
          details={displayedDetails}
          isLoading={isLoadingDetails}
          emptyIcon={<Wrench className="h-10 w-10" />}
          emptyMessage="No hay items de mano de obra"
          formatCurrency={formatCurrency}
          discountRequests={activeDiscountRequests}
          globalRequest={globalRequest}
          permissions={permissions}
          itemType={ITEM_TYPE_LABOR}
          isApproving={isApproving}
          isRejecting={isRejecting}
          isReverting={isReverting}
          onDelete={onDelete}
          onOpenCreate={handleOpenCreate}
          onOpenEdit={handleOpenEdit}
          onEditDetail={openEditSheet}
          sortable={isSorting}
          onReorder={handleReorder}
          onApprove={(id) => doApprove(id)}
          onReject={(id) => doReject(id)}
          onRevert={(id, reason) => doRevert({ id, reason })}
          renderName={(detail) => (
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium truncate">
                  {detail.description}
                </p>
                <Badge
                  color={
                    ITEM_TYPE_TRANSLATOR[detail.item_type]?.color ?? "gray"
                  }
                  className="text-[10px] shrink-0"
                >
                  {ITEM_TYPE_TRANSLATOR[detail.item_type]?.label ??
                    detail.item_type}
                </Badge>
              </div>
              {detail.observations && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {detail.observations}
                </p>
              )}
            </div>
          )}
          getQuantity={(detail) => (
            <span className="tabular-nums">{detail.quantity}</span>
          )}
          getPrice={(detail) => formatCurrency(detail.unit_price)}
          getTotal={(detail) => detail.net_amount}
          extraColumns={[
            {
              header: "Cto. Total",
              className: "w-[12%]",
              render: (detail) => (
                <span className="font-medium tabular-nums">
                  {formatCurrency(detail.total_cost)}
                </span>
              ),
            },
          ]}
          extraMobileFields={(detail) => (
            <div className="flex items-center gap-1 col-span-2">
              <span className="text-muted-foreground">Cto. Total:</span>
              <span className="font-medium tabular-nums">
                {formatCurrency(detail.total_cost)}
              </span>
            </div>
          )}
        />
      </div>

      <LaborDetailSheet
        open={detailSheetOpen}
        onClose={closeDetailSheet}
        onConfirm={handleConfirmDetail}
        mode={editingDetail ? "edit" : "create"}
        quotationId={quotationId}
        constManHours={constManHours}
        currencyId={currencyId}
        exchangeRate={exchangeRate}
        maxDiscountAllowed={maxDiscountAllowed}
        isApprovedDiscount={!!globalApprovedRequest}
        isSaving={isSaving}
        initialValue={
          editingDetail
            ? {
                order_quotation_id: editingDetail.order_quotation_id,
                item_type:
                  editingDetail.item_type === ITEM_TYPE_MATERIAL
                    ? ITEM_TYPE_MATERIAL
                    : ITEM_TYPE_LABOR,
                description: editingDetail.description,
                quantity: Number(editingDetail.quantity),
                unit_measure: editingDetail.unit_measure,
                unit_price: Number(editingDetail.unit_price),
                discount_percentage: Number(
                  editingDetail.discount_percentage || 0,
                ),
                exchange_rate: Number(editingDetail.exchange_rate),
                observations: editingDetail.observations ?? "",
              }
            : undefined
        }
      />

      <DiscountRequestModal
        open={modalOpen}
        onClose={handleClose}
        type={modalType}
        quotationId={quotationId}
        baseAmount={baseAmountForModal}
        detail={selectedDetail ?? undefined}
        currencySymbol={currencySymbol}
        existingRequest={editingRequest ?? undefined}
        itemType={ITEM_TYPE_DCT_LABOR}
        maxDiscount={maxDiscountForModal}
      />

      <BulkDiscountModal
        open={bulkDiscountOpen}
        onClose={() => setBulkDiscountOpen(false)}
        quotationId={quotationId}
        type="labor"
        maxDiscount={maxDiscountAllowed}
        onSuccess={onRefresh}
      />
    </Card>
  );
}
