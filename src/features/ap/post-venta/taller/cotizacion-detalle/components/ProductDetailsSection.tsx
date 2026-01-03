"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  errorToast,
  successToast,
  ERROR_MESSAGE,
  SUCCESS_MESSAGE,
} from "@/core/core.function";
import { ORDER_QUOTATION_DETAILS } from "../lib/proformaDetails.constants";
import { storeOrderQuotationDetails } from "../lib/proformaDetails.actions";
import { OrderQuotationDetailsResource } from "../lib/proformaDetails.interface";
import {
  productDetailSchema,
  ProductDetailSchema,
} from "../lib/proformaDetails.schema";
import {
  useProduct,
  useProductById,
} from "@/features/ap/post-venta/gestion-productos/productos/lib/product.hook";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { api } from "@/core/api";
import { format } from "date-fns";
import { CURRENCY_TYPE_IDS } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.constants";

interface ProductDetailsSectionProps {
  quotationId: number;
  quotationDate: string;
  details: OrderQuotationDetailsResource[];
  isLoadingDetails: boolean;
  onRefresh: () => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export default function ProductDetailsSection({
  quotationId,
  quotationDate,
  details,
  isLoadingDetails,
  onRefresh,
  onDelete,
}: ProductDetailsSectionProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [isLoadingExchangeRate, setIsLoadingExchangeRate] = useState(false);

  const form = useForm({
    resolver: zodResolver(productDetailSchema),
    defaultValues: {
      order_quotation_id: quotationId,
      item_type: "PRODUCT" as const,
      product_id: "",
      description: "",
      quantity: 1,
      unit_measure: "UND",
      retail_price_external: 0,
      freight_commission: 1.05,
      exchange_rate: 0,
      unit_price: 0,
      discount: 0,
      total_amount: 0,
      observations: "",
    },
  });

  const selectedProductId = form.watch("product_id");
  const retailPriceExternal = form.watch("retail_price_external");
  const comisionFlete = form.watch("freight_commission");

  // Obtener datos del producto seleccionado
  const { data: productData } = useProductById(Number(selectedProductId) || 0);

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
          `/gp/mg/exchange-rate/by-date-and-currency?to_currency_id=${CURRENCY_TYPE_IDS.DOLLARS}&date=${formattedDate}`
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

  // Calcular automáticamente el precio unitario
  // Fórmula: unit_price = retail_price_external * freight_commission * tipo_cambio (redondeado a 2 decimales)
  useEffect(() => {
    const retail = retailPriceExternal || 0;
    const comision = comisionFlete || 1.05;
    const tipoCambio = exchangeRate || 1;

    const calculatedUnitPrice =
      Math.round(retail * comision * tipoCambio * 100) / 100;
    form.setValue("unit_price", calculatedUnitPrice);
  }, [retailPriceExternal, comisionFlete, exchangeRate, form]);

  const onSubmit = async (data: ProductDetailSchema) => {
    try {
      setIsSaving(true);

      // Calcular el total: (quantity * unit_price) - discount
      const subtotal = data.quantity * data.unit_price;
      const total_amount = subtotal - data.discount;

      await storeOrderQuotationDetails({
        ...data,
        total_amount,
        product_id: Number(data.product_id),
      });

      successToast(SUCCESS_MESSAGE(ORDER_QUOTATION_DETAILS.MODEL, "create"));
      form.reset({
        order_quotation_id: quotationId,
        item_type: "PRODUCT",
        product_id: "",
        description: "",
        quantity: 1,
        unit_measure: "UND",
        retail_price_external: 0,
        freight_commission: 1.05,
        exchange_rate: exchangeRate || 0,
        unit_price: 0,
        discount: 0,
        total_amount: 0,
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
    return `S/. ${value.toFixed(2)}`;
  };

  const productDetails = details.filter((d) => d.item_type === "PRODUCT");

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Package className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Repuestos</h3>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Mensaje de tipo de cambio y comisión */}
          <div className="bg-blue-50 border border-blue-200 rounded-md px-3 py-2 space-y-1">
            <p className="text-xs text-primary">
              <span className="font-semibold">Comisión de flete:</span>{" "}
              {comisionFlete || 1.05}
            </p>
            {isLoadingExchangeRate ? (
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
            )}
          </div>

          {/* Primera fila: Repuesto y Precio Externo */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="lg:col-span-2">
              <FormSelectAsync
                name="product_id"
                label="Repuesto"
                placeholder="Seleccione un repuesto"
                control={form.control}
                useQueryHook={useProduct}
                mapOptionFn={(product) => ({
                  label: product.name,
                  value: product.id.toString(),
                })}
                perPage={10}
                debounceMs={500}
              />
            </div>

            <div className="lg:col-span-1">
              <FormField
                control={form.control}
                name="retail_price_external"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">
                      Precio Externo ($)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="h-9"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Segunda fila: Cantidad, Precio Unitario, Observaciones, Botón */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
            <div className="sm:col-span-1 lg:col-span-2">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Cantidad</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="h-9"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="sm:col-span-1 lg:col-span-3">
              <FormField
                control={form.control}
                name="unit_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">
                      Precio Unit. (Calculado)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="h-9 bg-gray-50"
                        disabled
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="sm:col-span-1 lg:col-span-6">
              <FormField
                control={form.control}
                name="observations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Observaciones</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ""}
                        placeholder="Opcional"
                        className="h-9"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-1 flex items-end">
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
        <div className="flex items-center justify-between mb-3 pb-2 border-b">
          <h4 className="font-semibold text-gray-700">Items de Repuestos</h4>
          <Badge variant="secondary" className="font-semibold">
            {productDetails.length} item(s)
          </Badge>
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
            <div className="hidden md:grid grid-cols-12 gap-3 bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 border-b">
              <div className="col-span-4">Repuesto</div>
              <div className="col-span-2 text-center">Cantidad</div>
              <div className="col-span-2 text-right">Precio Unit.</div>
              {/* <div className="col-span-1 text-right">Desc.</div> */}
              <div className="col-span-2 text-right">Total</div>
              <div className="col-span-2 text-right">Acción</div>
            </div>

            {/* Items */}
            <div className="divide-y">
              {productDetails.map((detail) => (
                <div key={detail.id}>
                  {/* Vista Desktop */}
                  <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-3 hover:bg-gray-50 transition-colors items-center">
                    <div className="col-span-4">
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

                    {/* <div className="col-span-1 text-right">
                      <span className="text-sm text-orange-600">
                        -{formatCurrency(detail.discount)}
                      </span>
                    </div> */}

                    <div className="col-span-2 text-right">
                      <span className="text-sm font-bold text-primary">
                        {formatCurrency(detail.total_amount)}
                      </span>
                    </div>

                    <div className="col-span-2 flex justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => onDelete(detail.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Vista Mobile */}
                  <div className="md:hidden px-4 py-3 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
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
                        <span className="text-gray-500">Descuento:</span>
                        <span className="ml-1 font-medium text-orange-600">
                          -{formatCurrency(detail.discount)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-500">Total:</span>
                        <span className="ml-1 font-bold text-primary">
                          {formatCurrency(detail.total_amount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
