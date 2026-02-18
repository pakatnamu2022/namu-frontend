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
  ITEM_TYPE_PRODUCT,
  ORDER_QUOTATION_DETAILS,
} from "../lib/proformaDetails.constants";
import { storeOrderQuotationDetails } from "../lib/proformaDetails.actions";
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
import QuotationPartModal from "@/features/ap/post-venta/repuestos/cotizacion-meson/components/QuotationPartModal";
import { FormSelect } from "@/shared/components/FormSelect";
import { DiscountRequestOrderQuotationResource } from "@/features/ap/post-venta/repuestos/descuento-cotizacion-meson/lib/discountRequestMeson.interface";
import { DiscountRequestModal } from "@/features/ap/post-venta/repuestos/descuento-cotizacion-meson/components/DiscountRequestModal";
import { deleteDiscountRequestOrderQuotation } from "@/features/ap/post-venta/repuestos/descuento-cotizacion-meson/lib/discountRequestMeson.actions";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import { TYPE_GLOBAL, TYPE_PARTIAL, DISCOUNT_REQUEST_MESON } from "@/features/ap/post-venta/repuestos/descuento-cotizacion-meson/lib/discountRequestMeson.constants";
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

  // Estado del modal de descuento
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"GLOBAL" | "PARTIAL">(TYPE_GLOBAL);
  const [selectedDetail, setSelectedDetail] = useState<OrderQuotationDetailsResource | null>(null);
  const [editingRequest, setEditingRequest] = useState<DiscountRequestOrderQuotationResource | null>(null);
  const [deleteDiscountId, setDeleteDiscountId] = useState<number | null>(null);

  const { mutate: doDeleteDiscount } = useMutation({
    mutationFn: deleteDiscountRequestOrderQuotation,
    onSuccess: () => {
      successToast("Solicitud eliminada correctamente");
      queryClient.invalidateQueries({ queryKey: [DISCOUNT_REQUEST_MESON.QUERY_KEY] });
      setDeleteDiscountId(null);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Error al eliminar la solicitud";
      errorToast(message);
      setDeleteDiscountId(null);
    },
  });

  const handleOpenCreate = (type: "GLOBAL" | "PARTIAL", detail?: OrderQuotationDetailsResource) => {
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

  // Obtener datos del producto seleccionado
  const { data: productData } = useProductById(Number(selectedProductId) || 0);

  // Función para copiar código del repuesto
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      successToast("Código copiado al portapapeles");
    });
  };

  // Función para manejar el pegado y convertir comas a puntos
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    const normalizedValue = pastedText.replace(",", ".");
    const numericValue = parseFloat(normalizedValue);

    if (!isNaN(numericValue)) {
      form.setValue("retail_price_external", numericValue);
    }
  };

  // Función para normalizar el input mientras se escribe (convierte comas a puntos)
  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(",", ".");
    const numericValue = parseFloat(value);

    if (!isNaN(numericValue)) {
      form.setValue("retail_price_external", numericValue);
    } else if (value === "") {
      form.setValue("retail_price_external", 0);
    }
  };

  // Llenar automáticamente los campos cuando se selecciona un producto
  useEffect(() => {
    if (productData) {
      form.setValue("description", productData.name || "");
      form.setValue("unit_measure", productData.unit_measurement_name || "UND");
    }
  }, [productData, form]);

  // Consultar tipo de cambio cuando se monta el componente
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

  // Verificar si la cotización está en dólares
  const isInDollars = currencyId === Number(CURRENCY_TYPE_IDS.DOLLARS);

  // Calcular automáticamente el precio unitario
  // Si la cotización está en dólares: unit_price = retail_price_external * freight_commission
  // Si la cotización está en soles: unit_price = retail_price_external * freight_commission * tipo_cambio
  useEffect(() => {
    const retail = Number(retailPriceExternal) || 0;
    const comision = Number(comisionFlete) || 1.05;

    let calculatedUnitPrice: number;
    if (isInDollars) {
      // En dólares: solo precio externo * comisión de flete
      calculatedUnitPrice = Math.round(retail * comision * 100) / 100;
    } else {
      // En soles: precio externo * comisión de flete * tipo de cambio
      const tipoCambio = exchangeRate || 1;
      calculatedUnitPrice =
        Math.round(retail * comision * tipoCambio * 100) / 100;
    }

    form.setValue("unit_price", calculatedUnitPrice);
  }, [retailPriceExternal, comisionFlete, exchangeRate, form, isInDollars]);

  const onSubmit = async (data: ProductDetailSchema) => {
    try {
      setIsSaving(true);

      // Calcular el total: (quantity * unit_price) - discount
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
  const hasPartialRequests = discountRequests.some((r) => r.type === TYPE_PARTIAL);

  const getPartialRequest = (detailId: number) =>
    discountRequests.find(
      (r) => r.type === TYPE_PARTIAL && r.ap_order_quotation_detail_id === detailId,
    );

  const baseAmountForModal =
    modalType === TYPE_GLOBAL
      ? globalBaseAmount
      : Number(selectedDetail?.total_amount || 0);

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

            <div>
              <FormInput
                control={form.control}
                name="discount_percentage"
                label="Desc. %"
                placeholder="Ej: 0.00"
                inputMode="numeric"
                type="number"
              />
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
                  <span className="text-muted-foreground text-xs">Desc. global:</span>
                  <span className="font-semibold">
                    {Number(globalRequest.requested_discount_percentage).toFixed(2)}%
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
                        onClick={() => setDeleteDiscountId(globalRequest.id)}
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
        ) : productDetails.length === 0 ? (
          <div className="text-center py-8 border rounded-lg bg-gray-50">
            <Package className="h-10 w-10 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No hay items de repuestos</p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            {/* Cabecera de tabla */}
            <div className="hidden md:grid grid-cols-16 gap-3 bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 border-b">
              <div className="col-span-3">Repuesto</div>
              <div className="col-span-2 text-center">Cantidad</div>
              <div className="col-span-2 text-right">Tipo Abas.</div>
              <div className="col-span-1 text-right">Precio Unit.</div>
              <div className="col-span-1 text-right">Desc.</div>
              <div className="col-span-2 text-right">Total</div>
              <div className="col-span-2 text-right">Registrado Por:</div>
              <div className="col-span-3 text-left">Desc. parcial</div>
            </div>

            {/* Items */}
            <div className="divide-y">
              {productDetails.map((detail) => {
                const partialRequest = getPartialRequest(detail.id);
                return (
                  <div key={detail.id}>
                    {/* Vista Desktop */}
                    <div className="hidden md:grid grid-cols-16 gap-3 px-4 py-3 hover:bg-gray-50 transition-colors items-center">
                      <div className="col-span-3">
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

                      <div className="col-span-2 text-right">
                        <span className="text-sm">{detail.supply_type}</span>
                      </div>

                      <div className="col-span-1 text-right">
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

                      <div className="col-span-2 text-right">
                        <span className="text-sm">{detail.created_by_name}</span>
                      </div>

                      <div className="col-span-3">
                        {partialRequest ? (
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="text-xs font-semibold">
                              {Number(partialRequest.requested_discount_percentage).toFixed(2)}%
                            </span>
                            <Badge color={partialRequest.is_approved ? "green" : "orange"}>
                              {partialRequest.is_approved ? "Aprobado" : "Pendiente"}
                            </Badge>
                            {!partialRequest.is_approved && (
                              <>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="size-7"
                                  tooltip="Editar solicitud"
                                  onClick={() => handleOpenEdit(partialRequest, detail)}
                                >
                                  <Pencil className="size-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="size-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  tooltip="Eliminar solicitud"
                                  onClick={() => setDeleteDiscountId(partialRequest.id)}
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
                              onClick={() => handleOpenCreate(TYPE_PARTIAL, detail)}
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
                        <div className="text-right">
                          <span className="text-gray-500">Desc.:</span>
                          <span className="ml-1 font-medium text-orange-600">
                            -{formatCurrency(detail.discount_percentage)}
                          </span>
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
                                Desc. solicitado: {Number(partialRequest.requested_discount_percentage).toFixed(2)}%
                              </span>
                              <Badge color={partialRequest.is_approved ? "green" : "orange"}>
                                {partialRequest.is_approved ? "Aprobado" : "Pendiente"}
                              </Badge>
                              {!partialRequest.is_approved && (
                                <>
                                  <Button variant="outline" size="icon" className="size-7"
                                    onClick={() => handleOpenEdit(partialRequest, detail)}>
                                    <Pencil className="size-4" />
                                  </Button>
                                  <Button variant="outline" size="icon"
                                    className="size-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => setDeleteDiscountId(partialRequest.id)}>
                                    <Trash2 className="size-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          ) : (
                            <Button variant="outline" size="sm" className="gap-2"
                              onClick={() => handleOpenCreate(TYPE_PARTIAL, detail)}>
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
      />

      {deleteDiscountId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteDiscountId(null)}
          onConfirm={() => Promise.resolve(doDeleteDiscount(deleteDiscountId))}
        />
      )}
    </Card>
  );
}
