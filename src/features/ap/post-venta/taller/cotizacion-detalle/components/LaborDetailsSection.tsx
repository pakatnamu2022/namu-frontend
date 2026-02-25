"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Trash2,
  Wrench,
  Loader2,
  Pencil,
  Tag,
  Percent,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Form } from "@/components/ui/form";
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
import { DiscountRequestOrderQuotationResource } from "@/features/ap/post-venta/repuestos/descuento-cotizacion-meson/lib/discountRequestMeson.interface";
import { DiscountRequestModal } from "@/features/ap/post-venta/repuestos/descuento-cotizacion-meson/components/DiscountRequestModal";
import {
  approveDiscountRequestOrderQuotation,
  rejectDiscountRequestOrderQuotation,
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
  details: OrderQuotationDetailsResource[];
  isLoadingDetails: boolean;
  onRefresh: () => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  currencySymbol: string;
  exchangeRate: number;
  discountRequests: DiscountRequestOrderQuotationResource[];
}

export default function LaborDetailsSection({
  quotationId,
  details,
  isLoadingDetails,
  onRefresh,
  onDelete,
  currencySymbol,
  exchangeRate,
  discountRequests,
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
      unit_price: undefined,
      discount_percentage: undefined,
      total_amount: 0,
      exchange_rate: exchangeRate,
      observations: "",
    },
  });

  const { mutate: doApprove, isPending: isApproving } = useMutation({
    mutationFn: approveDiscountRequestOrderQuotation,
    onSuccess: () => {
      successToast("Solicitud aprobada correctamente");
      queryClient.invalidateQueries({
        queryKey: [DISCOUNT_REQUEST_MESON.QUERY_KEY],
      });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Error al aprobar la solicitud";
      errorToast(message);
    },
  });

  const { mutate: doReject, isPending: isRejecting } = useMutation({
    mutationFn: rejectDiscountRequestOrderQuotation,
    onSuccess: () => {
      successToast("Solicitud rechazada correctamente");
      queryClient.invalidateQueries({
        queryKey: [DISCOUNT_REQUEST_MESON.QUERY_KEY],
      });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Error al rechazar la solicitud";
      errorToast(message);
    },
  });

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
      const subtotal = detail.quantity * detail.unit_price;
      const total_amount = subtotal - (subtotal * newPct) / 100;
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
        total_amount,
        observations: detail.observations ?? undefined,
      });
      successToast("Descuento actualizado correctamente");
      await onRefresh();
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(msg || "Error al actualizar el descuento");
    }
  };

  const onSubmit = async (data: LaborDetailSchema) => {
    try {
      setIsSaving(true);
      const subtotal = data.quantity * data.unit_price;
      const total_amount = subtotal - data.discount_percentage;

      await storeOrderQuotationDetails({
        ...data,
        total_amount,
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
        total_amount: 0,
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
    (sum, d) => sum + Number(d.total_amount || 0),
    0,
  );
  const hasMultipleItems = laborDetails.length > 1;

  const globalRequest = discountRequests.find((r) => r.type === TYPE_GLOBAL);
  const hasPartialRequests = discountRequests.some(
    (r) => r.type === TYPE_PARTIAL,
  );

  const getPartialRequest = (detailId: number) =>
    discountRequests.find(
      (r) =>
        r.type === TYPE_PARTIAL && r.ap_order_quotation_detail_id === detailId,
    );

  // Calcular descuento máximo permitido (para formulario)
  const globalApprovedRequest = discountRequests.find(
    (r) => r.type === TYPE_GLOBAL && r.status === STATUS_APPROVED,
  );
  const maxDiscountAllowed = globalApprovedRequest
    ? Number(globalApprovedRequest.requested_discount_percentage)
    : (user?.discount_percentage ?? DEFAULT_APPROVED_DISCOUNT);

  const baseAmountForModal =
    modalType === TYPE_GLOBAL
      ? globalBaseAmount
      : Number(selectedDetail?.total_amount || 0);

  // Para el modal siempre permitir solicitar hasta 100% (es una solicitud, no aplicación directa)
  const maxDiscountForModal = 100;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
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
                inputMode="numeric"
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

            <div className="sm:col-span-2 lg:col-span-1 flex items-end">
              <Button
                type="submit"
                disabled={isSaving}
                className="h-9 w-full"
                size="sm"
              >
                <Plus className="h-4 w-4" />
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
                        description="Se rechazará el descuento global solicitado. ¿Deseas continuar?"
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

        {isLoadingDetails ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : laborDetails.length === 0 ? (
          <div className="text-center py-8 border rounded-lg bg-gray-50">
            <Wrench className="h-10 w-10 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              No hay items de mano de obra
            </p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            {/* Cabecera de tabla - oculta en móvil */}
            <div className="hidden md:grid grid-cols-12 gap-2 bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 border-b">
              <div className="col-span-3">Descripción</div>
              <div className="col-span-1 text-center">Horas</div>
              <div className="col-span-2 text-center">Precio/Hora</div>
              <div className="col-span-1 text-center">Desc.</div>
              <div className="col-span-2 text-center">Total</div>
              <div className="col-span-3 text-right">Desc. parcial</div>
            </div>

            {/* Items */}
            <div className="divide-y">
              {laborDetails.map((detail) => {
                const partialRequest = getPartialRequest(detail.id);
                const approvedRequest =
                  partialRequest?.status === STATUS_APPROVED
                    ? partialRequest
                    : globalRequest?.status === STATUS_APPROVED
                      ? globalRequest
                      : null;
                return (
                  <div
                    key={detail.id}
                    className="px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    {/* Vista Desktop */}
                    <div className="hidden md:grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-3">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {detail.description}
                        </p>
                        {detail.observations && (
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            {detail.observations}
                          </p>
                        )}
                      </div>

                      <div className="col-span-1 text-center">
                        <span className="text-sm font-medium">
                          {detail.quantity}{" "}
                          <span className="text-xs text-gray-500">
                            {detail.unit_measure}
                          </span>
                        </span>
                      </div>

                      <div className="col-span-2 text-center">
                        <span className="text-sm">
                          {formatCurrency(detail.unit_price)}
                        </span>
                      </div>

                      {/* Columna Desc. — editable si hay solicitud aprobada */}
                      <div className="col-span-1 text-center">
                        {approvedRequest ? (
                          <EditableCell
                            id={detail.id}
                            value={detail.discount_percentage}
                            min={0}
                            max={Number(
                              approvedRequest.requested_discount_percentage,
                            )}
                            widthClass="w-16"
                            onUpdate={(_id, val) =>
                              handleDiscountUpdate(detail, Number(val))
                            }
                          />
                        ) : (
                          <span className="text-sm text-orange-600">
                            -{detail.discount_percentage}%
                          </span>
                        )}
                      </div>

                      <div className="col-span-2 text-center">
                        <span className="text-sm font-bold text-primary">
                          {formatCurrency(detail.total_amount)}
                        </span>
                      </div>

                      <div className="col-span-3 flex justify-end">
                        {partialRequest ? (
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="text-xs font-semibold">
                              {Number(
                                partialRequest.requested_discount_percentage,
                              ).toFixed(2)}
                              %
                            </span>
                            <Badge
                              color={
                                partialRequest.status === STATUS_APPROVED
                                  ? "green"
                                  : partialRequest.status === STATUS_REJECTED
                                    ? "red"
                                    : "orange"
                              }
                            >
                              {partialRequest.status === STATUS_APPROVED
                                ? "Aprobado"
                                : partialRequest.status === STATUS_REJECTED
                                  ? "Rechazado"
                                  : "Pendiente"}
                            </Badge>
                            {partialRequest.status === STATUS_PENDING && (
                              <>
                                <ConfirmationDialog
                                  trigger={
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="size-7 text-green-600 hover:text-green-600 hover:bg-green-50"
                                      tooltip="Aprobar solicitud"
                                      disabled={isApproving}
                                    >
                                      <CheckCircle className="size-4" />
                                    </Button>
                                  }
                                  title="¿Aprobar solicitud?"
                                  description="Se aprobará el descuento parcial solicitado. ¿Deseas continuar?"
                                  confirmText="Sí, aprobar"
                                  cancelText="Cancelar"
                                  icon="info"
                                  onConfirm={() => doApprove(partialRequest.id)}
                                />
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="size-7"
                                  tooltip="Editar solicitud"
                                  onClick={() =>
                                    handleOpenEdit(partialRequest, detail)
                                  }
                                >
                                  <Pencil className="size-4" />
                                </Button>
                                <ConfirmationDialog
                                  trigger={
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="size-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                      tooltip="Rechazar solicitud"
                                      disabled={isRejecting}
                                    >
                                      <XCircle className="size-4" />
                                    </Button>
                                  }
                                  title="¿Rechazar solicitud?"
                                  description="Se rechazará el descuento parcial solicitado. ¿Deseas continuar?"
                                  confirmText="Sí, rechazar"
                                  cancelText="Cancelar"
                                  variant="destructive"
                                  icon="danger"
                                  onConfirm={() => doReject(partialRequest.id)}
                                />
                              </>
                            )}
                          </div>
                        ) : (
                          !globalRequest && (
                            <Button
                              variant="outline"
                              size="icon"
                              className="size-7"
                              tooltip="Solicitar descuento parcial"
                              onClick={() =>
                                handleOpenCreate(TYPE_PARTIAL, detail)
                              }
                            >
                              <Tag className="size-4" />
                            </Button>
                          )
                        )}
                      </div>
                    </div>

                    {/* Vista Mobile */}
                    <div className="md:hidden space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {detail.description}
                          </p>
                          {detail.observations && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {detail.observations}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
                          onClick={() => onDelete(detail.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">Horas:</span>
                          <span className="font-medium ml-1">
                            {detail.quantity} {detail.unit_measure}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Precio/H:</span>
                          <span className="font-medium ml-1">
                            {formatCurrency(detail.unit_price)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">Desc:</span>
                          {approvedRequest ? (
                            <EditableCell
                              id={detail.id}
                              value={detail.discount_percentage}
                              min={0}
                              max={Number(
                                approvedRequest.requested_discount_percentage,
                              )}
                              widthClass="w-16"
                              onUpdate={(_id, val) =>
                                handleDiscountUpdate(detail, Number(val))
                              }
                            />
                          ) : (
                            <span className="font-medium ml-1 text-orange-600">
                              -{detail.discount_percentage}%
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-gray-500">Total:</span>
                          <span className="font-bold ml-1 text-primary">
                            {formatCurrency(detail.total_amount)}
                          </span>
                        </div>
                      </div>
                      {/* Descuento parcial mobile */}
                      {!globalRequest && (
                        <div className="pt-1">
                          {partialRequest ? (
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-semibold">
                                Desc. solicitado:{" "}
                                {Number(
                                  partialRequest.requested_discount_percentage,
                                ).toFixed(2)}
                                %
                              </span>
                              <Badge
                                color={
                                  partialRequest.status === STATUS_APPROVED
                                    ? "green"
                                    : partialRequest.status === STATUS_REJECTED
                                      ? "red"
                                      : "orange"
                                }
                              >
                                {partialRequest.status === STATUS_APPROVED
                                  ? "Aprobado"
                                  : partialRequest.status === STATUS_REJECTED
                                    ? "Rechazado"
                                    : "Pendiente"}
                              </Badge>
                              {partialRequest.status === STATUS_PENDING && (
                                <>
                                  <ConfirmationDialog
                                    trigger={
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        className="size-7 text-green-600 hover:text-green-600 hover:bg-green-50"
                                        disabled={isApproving}
                                      >
                                        <CheckCircle className="size-4" />
                                      </Button>
                                    }
                                    title="¿Aprobar solicitud?"
                                    description="Se aprobará el descuento parcial solicitado. ¿Deseas continuar?"
                                    confirmText="Sí, aprobar"
                                    cancelText="Cancelar"
                                    icon="info"
                                    onConfirm={() =>
                                      doApprove(partialRequest.id)
                                    }
                                  />
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="size-7"
                                    onClick={() =>
                                      handleOpenEdit(partialRequest, detail)
                                    }
                                  >
                                    <Pencil className="size-4" />
                                  </Button>
                                  <ConfirmationDialog
                                    trigger={
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        className="size-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        disabled={isRejecting}
                                      >
                                        <XCircle className="size-4" />
                                      </Button>
                                    }
                                    title="¿Rechazar solicitud?"
                                    description="Se rechazará el descuento parcial solicitado. ¿Deseas continuar?"
                                    confirmText="Sí, rechazar"
                                    cancelText="Cancelar"
                                    variant="destructive"
                                    icon="danger"
                                    onConfirm={() =>
                                      doReject(partialRequest.id)
                                    }
                                  />
                                </>
                              )}
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2"
                              onClick={() =>
                                handleOpenCreate(TYPE_PARTIAL, detail)
                              }
                            >
                              <Tag className="size-4" />
                              Solicitar descuento parcial
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
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
