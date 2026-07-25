"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, Warehouse, AlertCircle } from "lucide-react";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormInput } from "@/shared/components/FormInput";
import {
  productDetailMesonSchema,
  ProductDetailMesonSchema,
} from "../lib/quotationMeson.schema";
import {
  useProduct,
  useProductById,
} from "@/features/ap/post-venta/gestion-almacen/productos/lib/product.hook";
import { getStockByProductIds } from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventory.actions";
import { StockByProductIdsResponse } from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventory.interface";
import { StockWarehousesCard } from "@/features/ap/post-venta/gestion-almacen/inventario/components/StockWarehousesCard";
import { AP_CLASS_ARTICLE_LUBRICANT_ID } from "@/features/ap/configuraciones/maestros-general/campanas/lib/campaign.constants";
import { onSelectSupplyType } from "../../../taller/cotizacion-detalle/lib/proformaDetails.constants";

const EMPTY_DETAIL: ProductDetailMesonSchema = {
  product_id: "",
  description: "",
  quantity: 1,
  unit_measure: "UND",
  unit_price: 0,
  discount_percentage: 0,
  observations: "",
  retail_price_external: undefined,
  exchange_rate: 0,
  freight_commission: 1,
  supply_type: "STOCK",
};

interface AddProductDetailSheetProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (row: ProductDetailMesonSchema) => void;
  mode: "create" | "edit";
  initialValue?: ProductDetailMesonSchema;
  exchangeRate: number | null;
  freightCommissionMultiplier: number;
  selectedCurrency: any;
  campaignDiscountValue?: number;
  sedeId?: string;
  approvedDiscount?: number;
  defaultDiscount: number;
  isDetailsDisabled?: boolean;
  initialProductId?: number;
}

export default function AddProductDetailSheet({
  open,
  onClose,
  onConfirm,
  mode,
  initialValue,
  exchangeRate,
  freightCommissionMultiplier,
  selectedCurrency,
  campaignDiscountValue,
  sedeId,
  approvedDiscount,
  defaultDiscount,
  isDetailsDisabled = false,
  initialProductId,
}: AddProductDetailSheetProps) {
  const [showStock, setShowStock] = useState(true);
  const [sheetStock, setSheetStock] =
    useState<StockByProductIdsResponse | null>(null);

  const form = useForm<ProductDetailMesonSchema>({
    resolver: zodResolver(productDetailMesonSchema) as any,
    defaultValues: initialValue ?? EMPTY_DETAIL,
    mode: "onChange",
  });

  useEffect(() => {
    if (open) {
      form.reset(
        initialValue ?? {
          ...EMPTY_DETAIL,
          exchange_rate: exchangeRate || 0,
          freight_commission: freightCommissionMultiplier,
        },
      );
      setShowStock(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialValue]);

  useEffect(() => {
    if (open && initialProductId) {
      form.setValue("product_id", initialProductId.toString(), {
        shouldValidate: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialProductId]);

  const productId = form.watch("product_id");
  const { data: productData } = useProductById(Number(productId) || 0);

  // Auto-completar descripción y unidad de medida al seleccionar producto
  useEffect(() => {
    if (productData) {
      form.setValue("description", productData.name || "");
      form.setValue("unit_measure", productData.unit_measurement_name || "UND");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productData]);

  // Consultar stock del producto seleccionado
  useEffect(() => {
    const fetchStock = async () => {
      const id = Number(productId);
      if (!id) {
        setSheetStock(null);
        return;
      }
      try {
        const response = await getStockByProductIds([id]);
        setSheetStock(response);
      } catch {
        setSheetStock(null);
      }
    };
    fetchStock();
  }, [productId]);

  const currentProductStock = sheetStock?.data?.find(
    (stock) => stock.product_id === Number(productId),
  );
  const hasStock = !!(currentProductStock && productId);
  const hasStockInSede = !!currentProductStock?.warehouses.some(
    (warehouse) =>
      warehouse.sede_id === Number(sedeId) && warehouse.available_quantity > 0,
  );

  const supplyType = form.watch("supply_type");

  const isCampaignDiscountLocked =
    hasStockInSede &&
    campaignDiscountValue !== undefined &&
    supplyType === "STOCK" &&
    !!productData &&
    productData.ap_class_article_id !== AP_CLASS_ARTICLE_LUBRICANT_ID;

  // Aplicar/limpiar automáticamente el descuento de campaña
  useEffect(() => {
    const currentDiscount = form.getValues("discount_percentage");
    if (isCampaignDiscountLocked) {
      if (currentDiscount !== campaignDiscountValue) {
        form.setValue("discount_percentage", campaignDiscountValue!);
      }
    } else if (
      hasStockInSede &&
      campaignDiscountValue !== undefined &&
      currentDiscount === campaignDiscountValue
    ) {
      form.setValue("discount_percentage", 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCampaignDiscountLocked, hasStockInSede, campaignDiscountValue]);

  // Calcular unit_price automáticamente
  const retailPrice = form.watch("retail_price_external");
  const freightCommission = form.watch("freight_commission");
  useEffect(() => {
    const retail = retailPrice || 0;
    const commission = freightCommission || freightCommissionMultiplier;
    const isUSD = selectedCurrency?.code === "USD";
    const rate = isUSD ? 1 : exchangeRate || 1;
    const calculatedUnitPrice =
      Math.round(retail * commission * rate * 100) / 100;

    if (calculatedUnitPrice !== form.getValues("unit_price")) {
      form.setValue("unit_price", calculatedUnitPrice);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retailPrice, freightCommission, exchangeRate, selectedCurrency]);

  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    field: any,
  ) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    const normalizedValue = pastedText.replace(",", ".");
    const numericValue = parseFloat(normalizedValue);
    if (!isNaN(numericValue)) {
      field.onChange(numericValue);
    }
  };

  const detail = form.watch();
  const computedTotal = (() => {
    const quantity = detail?.quantity || 0;
    const unitPrice = detail?.unit_price || 0;
    const discount = detail?.discount_percentage || 0;
    const subtotal = quantity * unitPrice;
    return Math.round((subtotal - subtotal * (discount / 100)) * 100) / 100;
  })();

  const handleConfirm = form.handleSubmit((data) => {
    onConfirm(data);
  });

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Agregar Repuesto" : "Editar Repuesto"}
      subtitle="Complete los datos del repuesto para la cotización"
      icon="Package"
      size="5xl"
      childrenFooter={
        <div className="flex gap-2 w-full justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!form.formState.isValid || isDetailsDisabled}
          >
            {mode === "create" ? "Agregar" : "Guardar"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <FormSelectAsync
          name="product_id"
          label="Repuesto"
          placeholder="Seleccione repuesto"
          control={form.control}
          useQueryHook={useProduct}
          useFindByIdHook={useProductById}
          mapOptionFn={(product) => ({
            label: () => (
              <div className="flex items-center justify-between gap-2 w-full">
                <span className="font-medium truncate">
                  {product.code} - {product.name}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded shrink-0 bg-orange-100 text-orange-700">
                  {product.brand?.name || "Sin marca"}
                </span>
              </div>
            ),
            value: product.id.toString(),
          })}
          perPage={10}
          debounceMs={500}
          disabled={isDetailsDisabled}
          required
        />

        {hasStock && (
          <div className="-mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex justify-end mb-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-primary"
                onClick={() => setShowStock((prev) => !prev)}
              >
                {showStock ? (
                  <ChevronUp className="h-3.5 w-3.5 mr-1" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 mr-1" />
                )}
                {showStock ? "Ocultar almacenes" : "Ver almacenes"}
              </Button>
            </div>
            {showStock && (
              <StockWarehousesCard
                stock={currentProductStock!}
                productInfo={productData}
              />
            )}
          </div>
        )}

        {productId && !hasStock && (
          <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border rounded-md p-2">
            <Warehouse className="h-3.5 w-3.5" />
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Sin stock disponible en almacenes</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cantidad</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="Cant."
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? undefined : Number(value));
                    }}
                    disabled={isDetailsDisabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="retail_price_external"
            render={({ field }) => (
              <FormItem>
                <FormLabel>P. Lista ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="P. Lista ($)"
                    {...field}
                    value={field.value || ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : undefined,
                      )
                    }
                    onPaste={(e) => handlePaste(e, field)}
                    disabled={isDetailsDisabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unit_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  P. Unit. ({selectedCurrency?.symbol || "S/."})
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    {...field}
                    className="bg-gray-100 font-medium"
                    disabled
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discount_percentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dcto %</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max={approvedDiscount ?? defaultDiscount}
                    placeholder="Dcto %"
                    {...field}
                    value={field.value || ""}
                    onChange={(e) => {
                      const val = e.target.value
                        ? Number(e.target.value)
                        : undefined;
                      const maxAllowed = approvedDiscount ?? defaultDiscount;
                      if (val !== undefined && val > maxAllowed) return;
                      field.onChange(val);
                    }}
                    className={
                      isCampaignDiscountLocked
                        ? "border-orange-400 bg-orange-50"
                        : approvedDiscount !== undefined
                          ? "border-green-400"
                          : ""
                    }
                    disabled={isDetailsDisabled || isCampaignDiscountLocked}
                  />
                </FormControl>
                {isCampaignDiscountLocked ? (
                  <p className="text-[10px] font-medium mt-0.5 text-orange-600">
                    Descuento por campaña aplicado
                  </p>
                ) : (
                  <p className="text-[10px] font-medium mt-0.5 text-green-600">
                    Máx.{" "}
                    {approvedDiscount !== undefined ? "aprobado" : "permitido"}:{" "}
                    {(approvedDiscount ?? defaultDiscount).toFixed(2)}%
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormSelect
          name="supply_type"
          label="Tipo de Abastecimiento"
          placeholder="Seleccione tipo"
          control={form.control}
          options={onSelectSupplyType}
          disabled={isDetailsDisabled}
        />

        <FormInput
          name="observations"
          label="Notas"
          control={form.control}
          placeholder="Opcional"
          disabled={isDetailsDisabled}
        />

        <div className="rounded-lg border bg-gray-50 px-4 py-3 flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600">
            Total ({selectedCurrency?.symbol || "S/."})
          </span>
          <span className="text-xl font-bold text-primary">
            {computedTotal.toFixed(2)}
          </span>
        </div>
      </div>
    </GeneralSheet>
  );
}
