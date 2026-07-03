"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Wrench,
  Pencil,
  Percent,
  CheckCircle,
  XCircle,
  Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Form } from "@/components/ui/form";
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
  ORDER_QUOTATION_DETAILS,
} from "../lib/proformaDetails.constants";
import {
  storeOrderQuotationDetails,
  updateOrderQuotationDetails,
} from "../lib/proformaDetails.actions";
import { OrderQuotationDetailsResource } from "../lib/proformaDetails.interface";
import {
  laborDetailSchema,
  LaborDetailSchema,
} from "../lib/proformaDetails.schema";
import { FormInput } from "@/shared/components/FormInput";
import { EditableCell } from "@/shared/components/EditableCell";
import { QuotationItemsTable } from "./QuotationItemsTable";
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
  exchangeRate,
  discountRequests,
  permissions,
}: LaborDetailsSectionProps) {
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // Estado del modal de descuento
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"GLOBAL" | "PARTIAL">(TYPE_GLOBAL);
  const [selectedDetail, setSelectedDetail] =
    useState<OrderQuotationDetailsResource | null>(null);
  const [editingRequest, setEditingRequest] =
    useState<DiscountRequestOrderQuotationResource | null>(null);

  const form = useForm({
    resolver: zodResolver(laborDetailSchema),
    defaultValues: {
      order_quotation_id: quotationId,
      item_type: ITEM_TYPE_LABOR,
      description: "",
      quantity: 1,
      unit_measure: "Horas",
      unit_price: constManHours,
      discount_percentage: undefined,
      exchange_rate: exchangeRate,
      observations: "",
    },
  });

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

  const handleDiscountUpdate = async (
    detail: OrderQuotationDetailsResource,
    newPct: number,
  ) => {
    try {
      await updateOrderQuotationDetails(detail.id, {
        order_quotation_id: detail.order_quotation_id,
        item_type: detail.item_type,
        description: detail.description,
        quantity: detail.quantity,
        unit_measure: detail.unit_measure,
        retail_price_external: detail.retail_price_external,
        freight_commission: detail.freight_commission,
        exchange_rate: detail.exchange_rate,
        unit_price: detail.unit_price,
        discount_percentage: newPct,
        observations: detail.observations ?? undefined,
      });
      successToast("Descuento actualizado correctamente");
      await onRefresh();
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(msg || "Error al actualizar el descuento");
    }
  };

  const handleQuantityUpdate = async (
    detail: OrderQuotationDetailsResource,
    newQty: number,
  ) => {
    try {
      await updateOrderQuotationDetails(detail.id, {
        order_quotation_id: detail.order_quotation_id,
        item_type: detail.item_type,
        description: detail.description,
        quantity: newQty,
        unit_measure: detail.unit_measure,
        retail_price_external: detail.retail_price_external,
        freight_commission: detail.freight_commission,
        exchange_rate: detail.exchange_rate,
        unit_price: detail.unit_price,
        discount_percentage: Number(detail.discount_percentage || 0),
        observations: detail.observations ?? undefined,
      });
      successToast("Horas actualizadas correctamente");

      await onRefresh();
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(msg || "Error al actualizar las horas");
    }
  };

  const onSubmit = async (data: LaborDetailSchema) => {
    try {
      setIsSaving(true);

      await storeOrderQuotationDetails({
        ...data,
        product_id: undefined,
      });

      successToast(SUCCESS_MESSAGE(ORDER_QUOTATION_DETAILS.MODEL, "create"));
      form.reset({
        order_quotation_id: quotationId,
        item_type: ITEM_TYPE_LABOR,
        description: "",
        quantity: 1,
        unit_measure: "Horas",
        unit_price: undefined,
        discount_percentage: undefined,
        exchange_rate: exchangeRate,
        observations: "",
      });
      await onRefresh();
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(ORDER_QUOTATION_DETAILS.MODEL, "create", msg));
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (amount: string | number | null | undefined) => {
    const value = Number(amount) || 0;
    return `${currencySymbol} ${value.toFixed(2)}`;
  };

  const laborDetails = details.filter((d) => d.item_type === ITEM_TYPE_LABOR);

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

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2">
        <Wrench className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Mano de Obra</h3>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Descripción - ancho completo */}
          <FormInput
            control={form.control}
            name="description"
            label="Descripción"
            placeholder="Ej: Cambio de aceite"
            className="h-9 text-xs"
          />

          {/* Campos de entrada en una sola línea */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
            <div className="sm:col-span-1 lg:col-span-3">
              <FormInput
                control={form.control}
                name="quantity"
                label="Cant. (Horas)"
                placeholder="Ej: 1.5"
                className="h-9 text-xs"
                inputMode="numeric"
                type="number"
              />
            </div>

            <div className="sm:col-span-1 lg:col-span-3">
              <FormInput
                control={form.control}
                name="unit_price"
                label="Precio/Hora"
                placeholder="Ej: Horas"
                className="h-9 text-xs"
                type="number"
              />
            </div>

            <div className="sm:col-span-1 lg:col-span-2 space-y-1">
              <FormInput
                control={form.control}
                name="discount_percentage"
                label="Desc. %"
                placeholder="Ej: 0.00"
                className={
                  globalApprovedRequest
                    ? "h-9 text-xs border-green-400"
                    : "h-9 text-xs"
                }
                inputMode="numeric"
                type="number"
                min={0}
                max={maxDiscountAllowed}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : 0;
                  if (val > maxDiscountAllowed) {
                    form.setValue("discount_percentage", maxDiscountAllowed);
                  } else {
                    form.setValue("discount_percentage", val);
                  }
                }}
              />
              <p className="text-[10px] font-medium text-green-600">
                Máx. {globalApprovedRequest ? "aprobado" : "permitido"}:{" "}
                {maxDiscountAllowed.toFixed(2)}%
              </p>
            </div>

            <div className="sm:col-span-1 lg:col-span-3">
              <FormInput
                control={form.control}
                name="observations"
                label="Observaciones"
                placeholder="Ej: Observaciones adicionales"
                className="h-9 text-xs"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-1 flex items-center">
              <Button
                type="submit"
                disabled={isSaving}
                className="h-9 w-full lg:h-10 lg:rounded-md lg:px-3 lg:font-semibold lg:shadow-sm"
                size="sm"
              >
                <Plus className="h-4 w-4 lg:h-3.5 lg:w-3.5" />
                <span className="hidden lg:inline text-xs">Agregar</span>
              </Button>
            </div>
          </div>
        </form>
      </Form>

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

          {hasMultipleItems && laborDetails.length > 0 && (
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
          details={laborDetails}
          isLoading={isLoadingDetails}
          emptyIcon={<Wrench className="h-10 w-10" />}
          emptyMessage="No hay items de mano de obra"
          formatCurrency={formatCurrency}
          maxDiscountAllowed={maxDiscountAllowed}
          discountRequests={activeDiscountRequests}
          globalRequest={globalRequest}
          permissions={permissions}
          itemType="LABOR"
          isApproving={isApproving}
          isRejecting={isRejecting}
          isReverting={isReverting}
          onDiscountUpdate={handleDiscountUpdate}
          onDelete={onDelete}
          onOpenCreate={handleOpenCreate}
          onOpenEdit={handleOpenEdit}
          onApprove={(id) => doApprove(id)}
          onReject={(id) => doReject(id)}
          onRevert={(id, reason) => doRevert({ id, reason })}
          renderName={(detail) => (
            <div>
              <p className="text-sm font-medium truncate">
                {detail.description}
              </p>
              {detail.observations && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {detail.observations}
                </p>
              )}
            </div>
          )}
          getQuantity={(detail) => (
            <EditableCell
              id={detail.id}
              value={detail.quantity}
              min={0.01}
              widthClass="w-14"
              onUpdate={(_id, val) => handleQuantityUpdate(detail, Number(val))}
            />
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

      <DiscountRequestModal
        open={modalOpen}
        onClose={handleClose}
        type={modalType}
        quotationId={quotationId}
        baseAmount={baseAmountForModal}
        detail={selectedDetail ?? undefined}
        currencySymbol={currencySymbol}
        existingRequest={editingRequest ?? undefined}
        itemType="LABOR"
        maxDiscount={maxDiscountForModal}
      />
    </Card>
  );
}
