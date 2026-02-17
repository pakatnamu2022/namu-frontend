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
import {
  ITEM_TYPE_LABOR,
  ORDER_QUOTATION_DETAILS,
} from "../lib/proformaDetails.constants";
import { storeOrderQuotationDetails } from "../lib/proformaDetails.actions";
import { OrderQuotationDetailsResource } from "../lib/proformaDetails.interface";
import {
  laborDetailSchema,
  LaborDetailSchema,
} from "../lib/proformaDetails.schema";
import { FormInput } from "@/shared/components/FormInput";
import { DiscountRequestOrderQuotationResource } from "@/features/ap/post-venta/repuestos/descuento-cotizacion-meson/lib/discountRequestMeson.interface";
import { DiscountRequestModal } from "@/features/ap/post-venta/repuestos/descuento-cotizacion-meson/components/DiscountRequestModal";
import { deleteDiscountRequestOrderQuotation } from "@/features/ap/post-venta/repuestos/descuento-cotizacion-meson/lib/discountRequestMeson.actions";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import {
  TYPE_GLOBAL,
  TYPE_PARTIAL,
  DISCOUNT_REQUEST_MESON,
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

  // Estado del modal de descuento
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"GLOBAL" | "PARTIAL">(TYPE_GLOBAL);
  const [selectedDetail, setSelectedDetail] =
    useState<OrderQuotationDetailsResource | null>(null);
  const [editingRequest, setEditingRequest] =
    useState<DiscountRequestOrderQuotationResource | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

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

  const { mutate: doDelete } = useMutation({
    mutationFn: deleteDiscountRequestOrderQuotation,
    onSuccess: () => {
      successToast("Solicitud eliminada correctamente");
      queryClient.invalidateQueries({
        queryKey: [DISCOUNT_REQUEST_MESON.QUERY_KEY],
      });
      setDeleteId(null);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Error al eliminar la solicitud";
      errorToast(message);
      setDeleteId(null);
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

  const baseAmountForModal =
    modalType === TYPE_GLOBAL
      ? globalBaseAmount
      : Number(selectedDetail?.total_amount || 0);

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

            <div className="sm:col-span-1 lg:col-span-2">
              <FormInput
                control={form.control}
                name="discount_percentage"
                label="Desc. %"
                placeholder="Ej: 0.00"
                className="h-9 text-xs"
                inputMode="numeric"
                type="number"
              />
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
                  <Badge color={globalRequest.is_approved ? "green" : "orange"}>
                    {globalRequest.is_approved ? "Aprobado" : "Pendiente"}
                  </Badge>
                  {!globalRequest.is_approved && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-7"
                        tooltip="Editar solicitud global"
                        onClick={() => handleOpenEdit(globalRequest)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                        tooltip="Eliminar solicitud global"
                        onClick={() => setDeleteId(globalRequest.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
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
            <div className="hidden md:grid grid-cols-12 gap-3 bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 border-b">
              <div className="col-span-3">Descripción</div>
              <div className="col-span-2 text-center">Horas</div>
              <div className="col-span-2 text-right">Precio/Hora</div>
              <div className="col-span-1 text-right">Desc.</div>
              <div className="col-span-2 text-right">Total</div>
              <div className="col-span-2 text-left">Desc. parcial</div>
            </div>

            {/* Items */}
            <div className="divide-y">
              {laborDetails.map((detail) => {
                const partialRequest = getPartialRequest(detail.id);
                return (
                  <div
                    key={detail.id}
                    className="px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    {/* Vista Desktop */}
                    <div className="hidden md:grid grid-cols-12 gap-3 items-center">
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

                      <div className="col-span-2 text-center">
                        <span className="text-sm font-medium">
                          {detail.quantity}{" "}
                          <span className="text-xs text-gray-500">
                            {detail.unit_measure}
                          </span>
                        </span>
                      </div>

                      <div className="col-span-2 text-right">
                        <span className="text-sm">
                          {formatCurrency(detail.unit_price)}
                        </span>
                      </div>

                      <div className="col-span-1 text-right">
                        <span className="text-sm text-orange-600">
                          -{detail.discount_percentage}%
                        </span>
                      </div>

                      <div className="col-span-2 text-right">
                        <span className="text-sm font-bold text-primary">
                          {formatCurrency(detail.total_amount)}
                        </span>
                      </div>

                      <div className="col-span-2">
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
                                partialRequest.is_approved ? "green" : "orange"
                              }
                            >
                              {partialRequest.is_approved
                                ? "Aprobado"
                                : "Pendiente"}
                            </Badge>
                            {!partialRequest.is_approved && (
                              <>
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
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="size-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  tooltip="Eliminar solicitud"
                                  onClick={() => setDeleteId(partialRequest.id)}
                                >
                                  <Trash2 className="size-4" />
                                </Button>
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
                        <div>
                          <span className="text-gray-500">Desc:</span>
                          <span className="font-medium ml-1 text-orange-600">
                            -{formatCurrency(detail.discount_percentage)}
                          </span>
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
                                  partialRequest.is_approved
                                    ? "green"
                                    : "orange"
                                }
                              >
                                {partialRequest.is_approved
                                  ? "Aprobado"
                                  : "Pendiente"}
                              </Badge>
                              {!partialRequest.is_approved && (
                                <>
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
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="size-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() =>
                                      setDeleteId(partialRequest.id)
                                    }
                                  >
                                    <Trash2 className="size-4" />
                                  </Button>
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
      />

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={() => Promise.resolve(doDelete(deleteId))}
        />
      )}
    </Card>
  );
}
