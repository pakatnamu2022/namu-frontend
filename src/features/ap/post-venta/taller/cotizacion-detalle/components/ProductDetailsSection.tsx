"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Trash2,
  Package,
  Loader2,
  Copy,
  PackagePlus,
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
  ITEM_TYPE_PRODUCT,
  ORDER_QUOTATION_DETAILS,
} from "../lib/proformaDetails.constants";
import {
  storeOrderQuotationDetails,
  updateOrderQuotationDetails,
} from "../lib/proformaDetails.actions";
import { OrderQuotationDetailsResource } from "../lib/proformaDetails.interface";
import {
  productDetailSchema,
  ProductDetailSchema,
} from "../lib/proformaDetails.schema";
import {
  useProduct,
  useProductById,
} from "@/features/ap/post-venta/gestion-almacen/productos/lib/product.hook";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { api } from "@/core/api";
import { format } from "date-fns";
import { CURRENCY_TYPE_IDS } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.constants";
import { FormInput } from "@/shared/components/FormInput";
import { EditableCell } from "@/shared/components/EditableCell";
import QuotationPartModal from "@/features/ap/post-venta/repuestos/cotizacion-meson/components/QuotationPartModal";
import { FormSelect } from "@/shared/components/FormSelect";
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

const onSelectSupplyType = [
  { label: "Lima", value: "LIMA" },
  { label: "Importación", value: "IMPORTACION" },
];

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
}: ProductDetailsSectionProps) {
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

  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [isLoadingExchangeRate, setIsLoadingExchangeRate] = useState(false);
  const [isPartModalOpen, setIsPartModalOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(productDetailSchema),
    defaultValues: {
      order_quotation_id: quotationId,
      item_type: ITEM_TYPE_PRODUCT,
      product_id: "",
      description: "",
      quantity: 1,
      unit_measure: "UND",
      retail_price_external: undefined,
      freight_commission: 1.05,
      exchange_rate: 0,
      unit_price: 0,
      discount_percentage: 0,
      total_amount: 0,
      observations: "",
      supply_type: "",
    },
  });

  const selectedProductId = form.watch("product_id");
  const retailPriceExternal = form.watch("retail_price_external");
  const comisionFlete = form.watch("freight_commission");

  const { data: productData } = useProductById(Number(selectedProductId) || 0);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      successToast("Código copiado al portapapeles");
    });
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    const normalizedValue = pastedText.replace(",", ".");
    const numericValue = parseFloat(normalizedValue);
    if (!isNaN(numericValue)) {
      form.setValue("retail_price_external", numericValue);
    }
  };

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(",", ".");
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      form.setValue("retail_price_external", numericValue);
    } else if (value === "") {
      form.setValue("retail_price_external", 0);
    }
  };

  useEffect(() => {
    if (productData) {
      form.setValue("description", productData.name || "");
      form.setValue("unit_measure", productData.unit_measurement_name || "UND");
    }
  }, [productData, form]);

  useEffect(() => {
    const fetchExchangeRate = async () => {
      setIsLoadingExchangeRate(true);
      try {
        const formattedDate = format(new Date(quotationDate), "yyyy-MM-dd");
        const response = await api.get(
          `/gp/mg/exchange-rate/by-date-and-currency?to_currency_id=${CURRENCY_TYPE_IDS.DOLLARS}&date=${formattedDate}`,
        );
        if (response.data?.data?.rate) {
          const rate = parseFloat(response.data.data.rate);
          setExchangeRate(rate);
          form.setValue("exchange_rate", rate);
        }
      } catch (error) {
        console.error("Error al obtener tipo de cambio:", error);
        setExchangeRate(null);
        form.setValue("exchange_rate", 0);
      } finally {
        setIsLoadingExchangeRate(false);
      }
    };
    fetchExchangeRate();
  }, [quotationDate, form]);

  const isInDollars = currencyId === Number(CURRENCY_TYPE_IDS.DOLLARS);

  useEffect(() => {
    const retail = Number(retailPriceExternal) || 0;
    const comision = Number(comisionFlete) || 1.05;
    let calculatedUnitPrice: number;
    if (isInDollars) {
      calculatedUnitPrice = Math.round(retail * comision * 100) / 100;
    } else {
      const tipoCambio = exchangeRate || 1;
      calculatedUnitPrice =
        Math.round(retail * comision * tipoCambio * 100) / 100;
    }
    form.setValue("unit_price", calculatedUnitPrice);
  }, [retailPriceExternal, comisionFlete, exchangeRate, form, isInDollars]);

  const onSubmit = async (data: ProductDetailSchema) => {
    try {
      setIsSaving(true);
      const subtotal = data.quantity * data.unit_price;
      const total_amount = subtotal - data.discount_percentage;
      await storeOrderQuotationDetails({
        ...data,
        total_amount,
        product_id: Number(data.product_id),
      });
      successToast(SUCCESS_MESSAGE(ORDER_QUOTATION_DETAILS.MODEL, "create"));
      form.reset({
        order_quotation_id: quotationId,
        item_type: ITEM_TYPE_PRODUCT,
        product_id: "",
        description: "",
        quantity: 1,
        unit_measure: "UND",
        retail_price_external: undefined,
        freight_commission: 1.05,
        exchange_rate: exchangeRate || 0,
        unit_price: 0,
        discount_percentage: 0,
        total_amount: 0,
        observations: "",
        supply_type: "",
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

  const productDetails = details.filter(
    (d) => d.item_type === ITEM_TYPE_PRODUCT,
  );

  const globalBaseAmount = productDetails.reduce(
    (sum, d) => sum + Number(d.total_amount || 0),
    0,
  );
  const hasMultipleItems = productDetails.length > 1;

  const globalRequest = discountRequests.find((r) => r.type === TYPE_GLOBAL);
  const hasPartialRequests = discountRequests.some(
    (r) => r.type === TYPE_PARTIAL,
  );

  const getPartialRequest = (detailId: number) =>
    discountRequests.find(
      (r) =>
        r.type === TYPE_PARTIAL && r.ap_order_quotation_detail_id === detailId,
    );

  // Calcular descuento máximo permitido (para formulario y modal)
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Repuestos</h3>
        </div>
        <Button
          type="button"
          onClick={() => setIsPartModalOpen(true)}
          size="sm"
          variant="outline"
        >
          <PackagePlus className="h-4 w-4 mr-2" />
          Crear Repuesto
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Mensaje de tipo de cambio y comisión */}
          <div className="bg-blue-50 border border-blue-200 rounded-md px-3 py-2 space-y-1">
            <p className="text-xs text-primary">
              <span className="font-semibold">Moneda de cotización:</span>{" "}
              {currencySymbol}
            </p>
            <p className="text-xs text-primary">
              <span className="font-semibold">Comisión de flete:</span>{" "}
              {Number(comisionFlete) || 1.05}
            </p>
            {!isInDollars &&
              (isLoadingExchangeRate ? (
                <p className="text-xs text-primary">
                  <span className="font-semibold">Tipo de cambio:</span>{" "}
                  Cargando...
                </p>
              ) : exchangeRate ? (
                <p className="text-xs text-primary">
                  <span className="font-semibold">Tipo de cambio:</span> S/.{" "}
                  {exchangeRate.toFixed(4)}
                </p>
              ) : (
                <p className="text-xs text-red-600">
                  <span className="font-semibold">Tipo de cambio:</span> No
                  disponible
                </p>
              ))}
          </div>

          {/* Primera fila: Repuesto y Precio Externo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="md:col-span-2 lg:col-span-2">
              <FormSelectAsync
                name="product_id"
                label="Repuesto"
                placeholder="Seleccione un repuesto"
                control={form.control}
                useQueryHook={useProduct}
                mapOptionFn={(product) => ({
                  label: `${product.code} - ${product.name}`,
                  value: product.id.toString(),
                })}
                perPage={10}
                debounceMs={500}
              />
            </div>

            <div className="md:col-span-2 lg:col-span-2">
              <FormInput
                control={form.control}
                name="retail_price_external"
                label="Precio Externo ($)"
                placeholder="Ej: 1.5"
                inputMode="decimal"
                type="text"
                onPaste={handlePaste}
                onChange={handleNumericChange}
              />
            </div>
          </div>

          {/* Segunda fila: Cantidad, Precio Unitario, Descuento y Tipo de Abastecimiento */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <FormInput
                control={form.control}
                name="quantity"
                label="Cantidad"
                placeholder="Ej: 1"
                inputMode="numeric"
                type="number"
              />
            </div>

            <div>
              <FormInput
                control={form.control}
                name="unit_price"
                label="Precio Unit. (Calculado)"
                placeholder="Ej: 10.00"
                inputMode="numeric"
                type="number"
                disabled
              />
            </div>

            <div className="space-y-1">
              <FormInput
                control={form.control}
                name="discount_percentage"
                label="Desc. %"
                placeholder="Ej: 0.00"
                inputMode="numeric"
                type="number"
                min={0}
                max={maxDiscountAllowed}
                className={
                  globalApprovedRequest ? "border-green-400" : undefined
                }
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

            <div>
              <FormSelect
                control={form.control}
                name="supply_type"
                options={onSelectSupplyType}
                label="Tipo de Abastecimiento"
                placeholder="Seleccionar un tipo"
                required
              />
            </div>
          </div>

          {/* Tercera fila: Observaciones y Botón */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-11">
              <FormInput
                control={form.control}
                name="observations"
                label="Observaciones"
                placeholder="Ej: Observaciones adicionales"
              />
            </div>

            <div className="md:col-span-1 flex items-end">
              <Button
                type="submit"
                disabled={isSaving || !selectedProductId}
                className="h-9 w-full"
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </form>
      </Form>

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

          {hasMultipleItems && productDetails.length > 0 && (
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
        ) : productDetails.length === 0 ? (
          <div className="text-center py-8 border rounded-lg bg-gray-50">
            <Package className="h-10 w-10 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No hay items de repuestos</p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            {/* Cabecera de tabla */}
            <div className="hidden md:grid grid-cols-20 gap-3 bg-gray-100 px-4 py-3 text-xs font-semibold text-gray-700 border-b">
              <div className="col-span-4">Repuesto</div>
              <div className="col-span-2 text-center">Cant.</div>
              <div className="col-span-2 text-center">Tipo Abas.</div>
              <div className="col-span-3 text-center">Precio Unit.</div>
              <div className="col-span-2 text-center">Desc.</div>
              <div className="col-span-3 text-center">Total</div>
              <div className="col-span-2 text-center">Reg. por</div>
              <div className="col-span-2 text-right">Desc. parcial</div>
            </div>

            {/* Items */}
            <div className="divide-y">
              {productDetails.map((detail) => {
                const partialRequest = getPartialRequest(detail.id);
                const approvedRequest =
                  partialRequest?.status === STATUS_APPROVED
                    ? partialRequest
                    : globalRequest?.status === STATUS_APPROVED
                      ? globalRequest
                      : null;
                return (
                  <div key={detail.id}>
                    {/* Vista Desktop */}
                    <div className="hidden md:grid grid-cols-20 gap-3 px-4 py-3 hover:bg-gray-50 transition-colors items-center">
                      <div className="col-span-4">
                        {detail.product?.code && (
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                              {detail.product.code}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              onClick={() =>
                                copyToClipboard(detail.product?.code || "")
                              }
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
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

                      <div className="col-span-2 text-center">
                        <span className="text-sm">{detail.supply_type}</span>
                      </div>

                      <div className="col-span-3 text-center">
                        <span className="text-sm font-medium">
                          {formatCurrency(detail.unit_price)}
                        </span>
                      </div>

                      <div className="col-span-2 flex justify-center">
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

                      <div className="col-span-3 text-center">
                        <span className="text-sm font-bold text-primary">
                          {formatCurrency(detail.total_amount)}
                        </span>
                      </div>

                      <div className="col-span-2 text-center">
                        <span className="text-xs text-gray-600 wrap-break-word">
                          {detail.created_by_name}
                        </span>
                      </div>

                      <div className="col-span-2 flex justify-end">
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
                    <div className="md:hidden px-4 py-3 space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          {detail.product?.code && (
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                {detail.product.code}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                onClick={() =>
                                  copyToClipboard(detail.product?.code || "")
                                }
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
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
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 ml-2"
                          onClick={() => onDelete(detail.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">Cantidad:</span>
                          <span className="ml-1 font-medium">
                            {detail.quantity} {detail.unit_measure}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-gray-500">Precio Unit.:</span>
                          <span className="ml-1 font-medium">
                            {formatCurrency(detail.unit_price)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Tipo Abas.:</span>
                          <span className="ml-1 font-medium">
                            {detail.supply_type}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">Desc.:</span>
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
                            <span className="ml-1 font-medium text-orange-600">
                              -{detail.discount_percentage}%
                            </span>
                          )}
                        </div>
                        <div className="col-span-2 text-right">
                          <span className="text-gray-500">Total:</span>
                          <span className="ml-1 font-bold text-primary">
                            {formatCurrency(detail.total_amount)}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">Registrado por:</span>
                          <span className="ml-1 font-medium">
                            {detail.created_by_name}
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
        itemType="PRODUCT"
        maxDiscount={maxDiscountForModal}
      />
    </Card>
  );
}
