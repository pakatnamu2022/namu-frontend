"use client";

import { useState } from "react";
import {
  Package,
  PackagePlus,
  Pencil,
  Percent,
  CheckCircle,
  XCircle,
  Undo2,
  ArrowUpDown,
  Check,
  Plus,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  errorToast,
  successToast,
  ERROR_MESSAGE,
  SUCCESS_MESSAGE,
} from "@/core/core.function";
import { DEFAULT_APPROVED_DISCOUNT } from "@/core/core.constants";
import { useAuthStore } from "@/features/auth/lib/auth.store";
import {
  ITEM_TYPE_PRODUCT,
  ORDER_QUOTATION_DETAILS,
} from "../lib/proformaDetails.constants";
import {
  storeOrderQuotationDetails,
  updateOrderQuotationDetails,
} from "../lib/proformaDetails.actions";
import { reorderOrderQuotationDetails } from "../../cotizacion/lib/proforma.actions";
import { OrderQuotationDetailsResource } from "../lib/proformaDetails.interface";
import { ProductDetailSchema } from "../lib/proformaDetails.schema";
import { format } from "date-fns";
import { CURRENCY_TYPE_IDS } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.constants";
import { useExchangeRateByDateAndCurrency } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.hook";
import { CopyCell } from "@/shared/components/CopyCell";
import { QuotationItemsTable } from "./QuotationItemsTable";
import ProductDetailSheet, { ApProductFormData } from "./ProductDetailSheet";
import BulkDiscountModal from "./BulkDiscountModal";
import QuotationPartModal from "@/features/ap/post-venta/repuestos/cotizacion-meson/components/QuotationPartModal";
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
  ITEM_TYPE_DCT_PRODUCT,
} from "@/features/ap/post-venta/repuestos/descuento-cotizacion-meson/lib/discountRequestMeson.constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useActiveCampaign } from "@/features/ap/configuraciones/maestros-general/campanas/lib/campaign.hook";
import { ActiveCampaignAlert } from "@/features/ap/configuraciones/maestros-general/campanas/components/ActiveCampaignAlert";
import { AREA_TALLER } from "@/features/ap/ap-master/lib/apMaster.constants";

interface ProductDetailsSectionProps {
  quotationId: number;
  quotationDate: string;
  details: OrderQuotationDetailsResource[];
  isLoadingDetails: boolean;
  onRefresh: () => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  currencySymbol: string;
  currencyId: number;
  discountRequests: DiscountRequestOrderQuotationResource[];
  warehouseId?: number;
  brandId?: number;
  permissions: {
    canEditDiscount: boolean;
    canApprove: boolean;
    canReject: boolean;
    canRequest: boolean;
    canRemoveSparePartQuote: boolean;
    canRemoveSparePartLabor: boolean;
    canCreateSpare: boolean;
    canReverseDiscount?: boolean;
  };
}

export default function ProductDetailsSection({
  quotationId,
  quotationDate,
  details,
  isLoadingDetails,
  onRefresh,
  onDelete,
  currencySymbol,
  currencyId,
  discountRequests,
  warehouseId,
  permissions,
}: ProductDetailsSectionProps) {
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();
  const { user, general } = useAuthStore();
  const freightCommissionMultiplier = 1 + (general?.freight_commission ?? 0.05);
  const quotationDateFormatted = quotationDate
    ? format(new Date(quotationDate), "yyyy-MM-dd")
    : "";
  const { data: exchangeRateData, isLoading: isLoadingExchangeRate } =
    useExchangeRateByDateAndCurrency(
      Number(CURRENCY_TYPE_IDS.DOLLARS),
      quotationDateFormatted,
    );
  const exchangeRate = exchangeRateData?.rate
    ? Number(exchangeRateData.rate)
    : null;

  const { data: activeCampaign } = useActiveCampaign({ area_id: AREA_TALLER });
  const campaignDiscountValue =
    activeCampaign && activeCampaign.discount_type === "percentage"
      ? Number(activeCampaign.discount_value)
      : undefined;

  const maxDiscountPercentage =
    user?.discount_percentage ?? DEFAULT_APPROVED_DISCOUNT;

  // Sheet de agregar/editar ítem
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [editingDetail, setEditingDetail] =
    useState<OrderQuotationDetailsResource | null>(null);

  // Modo ordenar (drag & drop)
  const [isSorting, setIsSorting] = useState(false);
  const [sortedIds, setSortedIds] = useState<number[] | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  const [isPartModalOpen, setIsPartModalOpen] = useState(false);

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

  const productDetails = details.filter(
    (d) => d.item_type === ITEM_TYPE_PRODUCT,
  );

  // Mientras se está en modo ordenar, refleja el orden local (optimista) elegido por el usuario
  const displayedDetails = (() => {
    if (!isSorting || !sortedIds) return productDetails;
    const byId = new Map(productDetails.map((d) => [d.id, d]));
    return sortedIds
      .map((id) => byId.get(id))
      .filter(Boolean) as OrderQuotationDetailsResource[];
  })();

  const globalBaseAmount = productDetails.reduce(
    (sum, d) => sum + Number(d.total_cost || 0),
    0,
  );
  const hasMultipleItems = productDetails.length > 1;

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

  // Calcular descuento máximo permitido (para formulario y modal)
  const globalApprovedRequest = activeDiscountRequests.find(
    (r) => r.type === TYPE_GLOBAL && r.status === STATUS_APPROVED,
  );
  const maxDiscountAllowed = globalApprovedRequest
    ? Number(globalApprovedRequest.requested_discount_percentage)
    : (user?.discount_percentage ?? DEFAULT_APPROVED_DISCOUNT);

  const baseAmountForModal =
    modalType === TYPE_GLOBAL
      ? globalBaseAmount
      : Number(selectedDetail?.total_cost || 0);

  // Para el modal siempre permitir solicitar hasta 100% (es una solicitud, no aplicación directa)
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

  const handleConfirmDealer = async (data: ProductDetailSchema) => {
    try {
      setIsSaving(true);
      const payload = { ...data, product_id: Number(data.product_id) };

      if (editingDetail) {
        await updateOrderQuotationDetails(editingDetail.id, payload);
        successToast(SUCCESS_MESSAGE(ORDER_QUOTATION_DETAILS.MODEL, "update"));
      } else {
        await storeOrderQuotationDetails(payload);
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

  const handleConfirmAp = async (data: ApProductFormData) => {
    try {
      setIsSaving(true);
      await storeOrderQuotationDetails({
        order_quotation_id: quotationId,
        item_type: ITEM_TYPE_PRODUCT,
        product_id: Number(data.ap_product_id),
        description: data.ap_description,
        quantity: data.ap_quantity,
        unit_measure: "UND",
        retail_price_external: undefined,
        freight_commission: 1,
        exchange_rate: 0,
        unit_price: data.ap_unit_price,
        discount_percentage: data.ap_discount,
        observations: "",
        supply_type: data.ap_supply_type,
      });
      successToast(SUCCESS_MESSAGE(ORDER_QUOTATION_DETAILS.MODEL, "create"));
      await onRefresh();
      closeDetailSheet();
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(ORDER_QUOTATION_DETAILS.MODEL, "create", msg));
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
      setSortedIds(productDetails.map((d) => d.id));
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
          <Package className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Repuestos</h3>
        </div>

        <div className="flex items-center gap-2">
          {permissions.canCreateSpare && (
            <Button
              type="button"
              onClick={() => setIsPartModalOpen(true)}
              size="sm"
              variant="outline"
            >
              <PackagePlus className="h-4 w-4 lg:mr-2" />
              <span className="hidden lg:inline">Crear Repuesto</span>
            </Button>
          )}
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
          {productDetails.length > 1 && (
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
          <Button
            type="button"
            size="sm"
            onClick={openCreateSheet}
            disabled={!quotationDate}
          >
            <Plus className="h-4 w-4 lg:mr-2" />
            <span className="hidden lg:inline">Agregar</span>
          </Button>
        </div>
      </div>

      <ActiveCampaignAlert areaId={AREA_TALLER} className="mt-4" />

      {/* Lista de Productos en formato tabla */}
      <div className="mt-6">
        {/* Header con botón de descuento global */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-gray-700">Items de Repuestos</h4>
            <Badge color="secondary" className="font-semibold">
              {productDetails.length} item(s)
            </Badge>
          </div>

          {!isSorting && hasMultipleItems && productDetails.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {globalRequest ? (
                <div className="flex items-center gap-2 text-sm border rounded-md px-3 py-1.5">
                  <span className="text-muted-foreground text-xs">
                    Solicitar Desc. global:
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
                            htmlFor="global-revert-reason"
                            className="text-xs"
                          >
                            Motivo (opcional)
                          </Label>
                          <Textarea
                            id="global-revert-reason"
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
                !hasPartialRequests && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenCreate(TYPE_GLOBAL)}
                    className="gap-2"
                  >
                    <Percent className="size-4" />
                    Solicitar Desc. global
                  </Button>
                )
              )}
            </div>
          )}
        </div>

        <QuotationItemsTable
          details={displayedDetails}
          isLoading={isLoadingDetails}
          emptyIcon={<Package className="h-10 w-10" />}
          emptyMessage="No hay items de repuestos"
          formatCurrency={formatCurrency}
          discountRequests={activeDiscountRequests}
          globalRequest={globalRequest}
          permissions={permissions}
          itemType={ITEM_TYPE_PRODUCT}
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
              <p className="text-sm font-medium truncate">
                {detail.description}
              </p>
              {detail.product?.code && (
                <CopyCell
                  value={detail.product.code}
                  label={`Cód: ${detail.product.code}`}
                  className="text-xs font-mono px-1.5 py-0.5 rounded mt-0.5"
                />
              )}
              {detail.product?.dyn_code && (
                <CopyCell
                  value={detail.product.dyn_code}
                  label={`Dyn: ${detail.product.dyn_code}`}
                  className="text-xs font-mono px-1.5 py-0.5 rounded mt-0.5"
                />
              )}
              {detail.observations && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {detail.observations}
                </p>
              )}
            </div>
          )}
          getQuantity={(detail) => (
            <span className="tabular-nums">
              {detail.quantity}{" "}
              <span className="text-xs text-muted-foreground">
                {detail.unit_measure}
              </span>
            </span>
          )}
          getPrice={(detail) => formatCurrency(detail.unit_price)}
          getTotal={(detail) => detail.net_amount}
          extraColumns={[
            {
              header: "Tipo Abas.",
              className: "w-[10%]",
              render: (detail) => (
                <span className="text-xs">{detail.supply_type}</span>
              ),
            },
            {
              header: "Reg. por",
              className: "w-[10%]",
              render: (detail) => (
                <span className="text-xs text-muted-foreground wrap-break-word">
                  {detail.created_by_name}
                </span>
              ),
            },
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
            <>
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Tipo Abas.:</span>
                <span className="font-medium">{detail.supply_type}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Reg. por:</span>
                <span className="font-medium">{detail.created_by_name}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Cto. Total:</span>
                <span className="font-medium">{detail.total_cost}</span>
              </div>
            </>
          )}
        />
      </div>

      <ProductDetailSheet
        open={detailSheetOpen}
        onClose={closeDetailSheet}
        onConfirmDealer={handleConfirmDealer}
        onConfirmAp={handleConfirmAp}
        mode={editingDetail ? "edit" : "create"}
        quotationId={quotationId}
        currencyId={currencyId}
        currencySymbol={currencySymbol}
        exchangeRate={exchangeRate}
        isLoadingExchangeRate={isLoadingExchangeRate}
        freightCommissionMultiplier={freightCommissionMultiplier}
        warehouseId={warehouseId}
        campaignDiscountValue={campaignDiscountValue}
        maxDiscountAllowed={maxDiscountAllowed}
        maxDiscountPercentage={maxDiscountPercentage}
        isSaving={isSaving}
        initialValue={
          editingDetail
            ? {
                order_quotation_id: editingDetail.order_quotation_id,
                item_type: ITEM_TYPE_PRODUCT,
                product_id: String(editingDetail.product_id ?? ""),
                description: editingDetail.description,
                quantity: Number(editingDetail.quantity),
                unit_measure: editingDetail.unit_measure,
                retail_price_external:
                  Number(editingDetail.retail_price_external) || 0,
                freight_commission:
                  Number(editingDetail.freight_commission) || 0,
                exchange_rate: Number(editingDetail.exchange_rate) || 0,
                unit_price: Number(editingDetail.unit_price) || 0,
                discount_percentage: Number(
                  editingDetail.discount_percentage || 0,
                ),
                observations: editingDetail.observations ?? "",
                supply_type: editingDetail.supply_type,
              }
            : undefined
        }
      />

      {/* Modal para crear repuesto */}
      <QuotationPartModal
        open={isPartModalOpen}
        onClose={() => setIsPartModalOpen(false)}
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
        itemType={ITEM_TYPE_DCT_PRODUCT}
        maxDiscount={maxDiscountForModal}
      />

      <BulkDiscountModal
        open={bulkDiscountOpen}
        onClose={() => setBulkDiscountOpen(false)}
        quotationId={quotationId}
        type="product"
        maxDiscount={maxDiscountAllowed}
        onSuccess={onRefresh}
      />
    </Card>
  );
}
