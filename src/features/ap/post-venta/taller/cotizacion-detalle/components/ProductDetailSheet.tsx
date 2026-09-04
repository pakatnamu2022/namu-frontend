"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { FormInput } from "@/shared/components/FormInput";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { CURRENCY_TYPE_IDS } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.constants";
import {
  ITEM_TYPE_PRODUCT,
  onSelectSupplyType,
} from "../lib/proformaDetails.constants";
import {
  productDetailSchema,
  productDetailEditSchema,
  ProductDetailSchema,
} from "../lib/proformaDetails.schema";
import {
  useProduct,
  useProductById,
} from "@/features/ap/post-venta/gestion-almacen/productos/lib/product.hook";
import { getStockByProductIds } from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventory.actions";
import {
  StockByProductIdsResponse,
  InventoryResource,
} from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventory.interface";
import { useInventory } from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventory.hook";
import { StockWarehousesCard } from "@/features/ap/post-venta/gestion-almacen/inventario/components/StockWarehousesCard";
import { AP_CLASS_ARTICLE_LUBRICANT_ID } from "@/features/ap/configuraciones/maestros-general/campanas/lib/campaign.constants";

const SUPPLY_TYPE_STOCK = "STOCK";

export interface ApProductFormData {
  ap_product_id: string;
  ap_quantity: number;
  ap_unit_price: number;
  ap_discount: number;
  ap_description: string;
  ap_supply_type: string;
}

interface ProductDetailSheetProps {
  open: boolean;
  onClose: () => void;
  onConfirmDealer: (data: ProductDetailSchema) => Promise<void> | void;
  onConfirmAp: (data: ApProductFormData) => Promise<void> | void;
  mode: "create" | "edit";
  quotationId: number;
  currencyId: number;
  currencySymbol: string;
  exchangeRate: number | null;
  isLoadingExchangeRate: boolean;
  freightCommissionMultiplier: number;
  warehouseId?: number;
  campaignDiscountValue?: number;
  maxDiscountAllowed: number;
  maxDiscountPercentage: number;
  isSaving?: boolean;
  initialValue?: ProductDetailSchema;
}

const buildDealerDefaults = (
  quotationId: number,
  freightCommissionMultiplier: number,
  exchangeRate: number | null,
): ProductDetailSchema => ({
  order_quotation_id: quotationId,
  item_type: ITEM_TYPE_PRODUCT,
  product_id: "",
  description: "",
  quantity: 1,
  unit_measure: "UND",
  retail_price_external: undefined as unknown as number,
  freight_commission: freightCommissionMultiplier,
  exchange_rate: exchangeRate || 0,
  unit_price: 0,
  discount_percentage: 0,
  observations: "",
  supply_type: "",
});

const AP_DEFAULTS: ApProductFormData = {
  ap_product_id: "",
  ap_quantity: 1,
  ap_unit_price: 0,
  ap_discount: 0,
  ap_description: "",
  ap_supply_type: "",
};

export default function ProductDetailSheet({
  open,
  onClose,
  onConfirmDealer,
  onConfirmAp,
  mode,
  quotationId,
  currencyId,
  currencySymbol,
  exchangeRate,
  isLoadingExchangeRate,
  freightCommissionMultiplier,
  warehouseId,
  campaignDiscountValue,
  maxDiscountAllowed,
  maxDiscountPercentage,
  isSaving = false,
  initialValue,
}: ProductDetailSheetProps) {
  const [formMode, setFormMode] = useState<"DEALER_PORTAL" | "AP">(
    "DEALER_PORTAL",
  );
  const isInDollars = currencyId === Number(CURRENCY_TYPE_IDS.DOLLARS);
  const [externalPriceText, setExternalPriceText] = useState("");
  const [stockData, setStockData] = useState<StockByProductIdsResponse | null>(
    null,
  );

  // ── Formulario modo Dealer Portal (repuesto del catálogo con precio externo) ──
  const form = useForm({
    resolver: zodResolver(
      mode === "edit" ? productDetailEditSchema : productDetailSchema,
    ),
    defaultValues: buildDealerDefaults(
      quotationId,
      freightCommissionMultiplier,
      exchangeRate,
    ),
  });

  useEffect(() => {
    if (open) {
      setFormMode("DEALER_PORTAL");
      form.reset(
        initialValue ??
          buildDealerDefaults(
            quotationId,
            freightCommissionMultiplier,
            exchangeRate,
          ),
      );
      setExternalPriceText(
        initialValue?.retail_price_external != null
          ? String(initialValue.retail_price_external)
          : "",
      );
      apForm.reset(AP_DEFAULTS);
      setApMinSalePrice(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialValue]);

  const selectedProductId = form.watch("product_id");
  const retailPriceExternal = form.watch("retail_price_external");
  const comisionFlete = form.watch("freight_commission");
  const supplyType = form.watch("supply_type");

  const { data: productData } = useProductById(Number(selectedProductId) || 0);

  useEffect(() => {
    if (productData && !initialValue) {
      form.setValue("description", productData.name || "");
      form.setValue("unit_measure", productData.unit_measurement_name || "UND");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productData]);

  useEffect(() => {
    const fetchStock = async () => {
      const id = Number(selectedProductId);
      if (!id) {
        setStockData(null);
        return;
      }
      try {
        const response = await getStockByProductIds([id]);
        setStockData(response);
      } catch {
        setStockData(null);
      }
    };
    fetchStock();
  }, [selectedProductId]);

  useEffect(() => {
    if (open) form.setValue("exchange_rate", exchangeRate || 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exchangeRate, open]);

  const hasStockInWarehouse = (() => {
    const currentProductStock = stockData?.data?.find(
      (s) => s.product_id === Number(selectedProductId),
    );
    return !!currentProductStock?.warehouses?.some(
      (w) => w.warehouse_id === warehouseId && w.available_quantity > 0,
    );
  })();

  const isCampaignDiscountLocked =
    hasStockInWarehouse &&
    supplyType === SUPPLY_TYPE_STOCK &&
    campaignDiscountValue !== undefined &&
    !!productData &&
    productData.ap_class_article_id !== AP_CLASS_ARTICLE_LUBRICANT_ID;

  useEffect(() => {
    const currentDiscount = form.getValues("discount_percentage");
    if (isCampaignDiscountLocked) {
      if (currentDiscount !== campaignDiscountValue) {
        form.setValue("discount_percentage", campaignDiscountValue as number);
      }
    } else if (
      campaignDiscountValue !== undefined &&
      currentDiscount === campaignDiscountValue
    ) {
      form.setValue("discount_percentage", 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCampaignDiscountLocked, campaignDiscountValue]);

  useEffect(() => {
    if (supplyType !== SUPPLY_TYPE_STOCK) {
      form.setValue("discount_percentage", 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplyType]);

  useEffect(() => {
    if (mode === "edit") return;
    const retail = Number(retailPriceExternal) || 0;
    const comision = Number(comisionFlete) || freightCommissionMultiplier;
    let calculatedUnitPrice: number;
    if (isInDollars) {
      calculatedUnitPrice = Math.round(retail * comision * 100) / 100;
    } else {
      const tipoCambio = exchangeRate || 1;
      calculatedUnitPrice =
        Math.round(retail * comision * tipoCambio * 100) / 100;
    }
    form.setValue("unit_price", calculatedUnitPrice);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retailPriceExternal, comisionFlete, exchangeRate, isInDollars, mode]);

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    const normalizedValue = pastedText.replace(",", ".");
    const numericValue = parseFloat(normalizedValue);
    if (!isNaN(numericValue)) {
      setExternalPriceText(normalizedValue);
      form.setValue("retail_price_external", numericValue);
    }
  };

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(",", ".");
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setExternalPriceText(value);
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue)) {
        form.setValue("retail_price_external", numericValue);
      } else {
        form.setValue("retail_price_external", 0);
      }
    }
  };

  const dealerQuantity = form.watch("quantity");
  const dealerUnitPrice = form.watch("unit_price");
  const dealerDiscountPercentage = form.watch("discount_percentage");

  const dealerTotalPreview = (() => {
    const quantity = Number(dealerQuantity) || 0;
    const unitPrice = Number(dealerUnitPrice) || 0;
    const discount = Number(dealerDiscountPercentage) || 0;
    const subtotal = quantity * unitPrice;
    return subtotal - subtotal * (discount / 100);
  })();

  // ── Formulario modo AP (inventario propio, precio de venta público) ──
  const apForm = useForm<ApProductFormData>({ defaultValues: AP_DEFAULTS });
  const apUnitPrice = apForm.watch("ap_unit_price");
  const apProductId = apForm.watch("ap_product_id");
  const apSupplyType = apForm.watch("ap_supply_type");
  const apQuantity = apForm.watch("ap_quantity");
  const apDiscount = apForm.watch("ap_discount");

  const apTotalPreview = (() => {
    const quantity = Number(apQuantity) || 0;
    const unitPrice = Number(apUnitPrice) || 0;
    const discount = Number(apDiscount) || 0;
    const subtotal = quantity * unitPrice;
    return subtotal - subtotal * (discount / 100);
  })();
  const [apHasStock, setApHasStock] = useState(false);
  const [apClassArticleId, setApClassArticleId] = useState<number | null>(null);
  const [apMinSalePrice, setApMinSalePrice] = useState(0);
  const [apSalePriceSoles, setApSalePriceSoles] = useState(0);
  const apIsPriceBelowMin = apMinSalePrice > 0 && apUnitPrice < apMinSalePrice;

  const handleApInventoryChange = (
    _value: string,
    item?: InventoryResource,
  ) => {
    if (item) {
      const priceSoles = parseFloat(item.sale_price);
      const price =
        isInDollars && exchangeRate
          ? Math.round((priceSoles / exchangeRate) * 100) / 100
          : priceSoles;
      setApMinSalePrice(price);
      setApSalePriceSoles(priceSoles);
      apForm.setValue("ap_unit_price", price);
      apForm.setValue("ap_description", item.product?.name || "");
      setApHasStock(item.available_quantity > 0);
      setApClassArticleId(item.product?.ap_class_article_id ?? null);
    } else {
      setApMinSalePrice(0);
      setApSalePriceSoles(0);
      apForm.setValue("ap_unit_price", 0);
      apForm.setValue("ap_description", "");
      setApHasStock(false);
      setApClassArticleId(null);
    }
  };

  const isApCampaignDiscountLocked =
    apHasStock &&
    apSupplyType === SUPPLY_TYPE_STOCK &&
    campaignDiscountValue !== undefined &&
    apClassArticleId !== null &&
    apClassArticleId !== AP_CLASS_ARTICLE_LUBRICANT_ID;

  useEffect(() => {
    const currentDiscount = apForm.getValues("ap_discount");
    if (isApCampaignDiscountLocked) {
      if (currentDiscount !== campaignDiscountValue) {
        apForm.setValue("ap_discount", campaignDiscountValue as number);
      }
    } else if (
      campaignDiscountValue !== undefined &&
      currentDiscount === campaignDiscountValue
    ) {
      apForm.setValue("ap_discount", 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isApCampaignDiscountLocked, campaignDiscountValue]);

  useEffect(() => {
    if (apSupplyType !== SUPPLY_TYPE_STOCK) {
      apForm.setValue("ap_discount", 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apSupplyType]);

  const handleModeChange = (checked: boolean) => {
    const newMode = checked ? "AP" : "DEALER_PORTAL";
    setFormMode(newMode);
    if (newMode === "AP") {
      apForm.reset(AP_DEFAULTS);
      setApMinSalePrice(0);
    } else {
      form.reset(
        buildDealerDefaults(
          quotationId,
          freightCommissionMultiplier,
          exchangeRate,
        ),
      );
      setExternalPriceText("");
      setStockData(null);
    }
  };

  const handleConfirmDealer = form.handleSubmit(async (data) => {
    await onConfirmDealer(data);
  });

  const handleConfirmAp = apForm.handleSubmit(async (data) => {
    if (apIsPriceBelowMin) return;
    if (!data.ap_supply_type) {
      apForm.setError("ap_supply_type", {
        type: "manual",
        message: "El tipo de abastecimiento es requerido",
      });
      return;
    }
    await onConfirmAp(data);
  });

  const isEdit = mode === "edit";

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title={isEdit ? "Editar Repuesto" : "Agregar Repuesto"}
      subtitle="Complete los datos del repuesto para la cotización"
      icon="Package"
      size="4xl"
      childrenFooter={
        <div className="flex gap-2 w-full justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          {formMode === "AP" ? (
            <Button
              type="button"
              onClick={handleConfirmAp}
              disabled={isSaving || !apProductId || apIsPriceBelowMin}
              className="gap-2"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Guardar" : "Agregar"}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleConfirmDealer}
              disabled={
                isSaving || !selectedProductId || !form.formState.isValid
              }
            >
              {isEdit ? "Guardar" : "Agregar"}
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        {!isEdit && (
          <div className="flex items-center justify-end gap-2">
            <Label
              htmlFor="mode-switch"
              className={`text-xs font-semibold cursor-pointer ${formMode === "DEALER_PORTAL" ? "text-primary" : "text-muted-foreground"}`}
            >
              DEALER PORTAL
            </Label>
            <Switch
              id="mode-switch"
              checked={formMode === "AP"}
              onCheckedChange={handleModeChange}
            />
            <Label
              htmlFor="mode-switch"
              className={`text-xs font-semibold cursor-pointer ${formMode === "AP" ? "text-primary" : "text-muted-foreground"}`}
            >
              AP
            </Label>
          </div>
        )}

        {formMode === "AP" ? (
          <Form {...apForm}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {isEdit ? (
                  <div className="flex flex-col justify-center gap-0.5">
                    <span className="text-xs text-muted-foreground">
                      Repuesto
                    </span>
                    <span className="text-sm font-semibold">
                      {apForm.watch("ap_description")}
                    </span>
                  </div>
                ) : (
                  <FormSelectAsync
                    name="ap_product_id"
                    label="Repuesto"
                    placeholder="Buscar producto en el almacén..."
                    control={apForm.control}
                    useQueryHook={useInventory}
                    additionalParams={{
                      warehouse_id: warehouseId?.toString() ?? "",
                    }}
                    mapOptionFn={(inventory: InventoryResource) => ({
                      label: () => (
                        <div className="flex items-center justify-between gap-2 w-full">
                          <span className="font-medium truncate">
                            {inventory.product.code} - {inventory.product.name}
                          </span>
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded shrink-0 ${
                              inventory.available_quantity > 0
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            Stock: {inventory.available_quantity}
                          </span>
                        </div>
                      ),
                      value: inventory.product_id.toString(),
                    })}
                    perPage={10}
                    debounceMs={500}
                    onValueChange={handleApInventoryChange}
                  />
                )}

                <div className="flex flex-col gap-1">
                  <FormInput
                    name="ap_unit_price"
                    label={`Precio Venta Público (${currencySymbol})`}
                    type="number"
                    placeholder="0.0"
                    step="0.01"
                    control={apForm.control}
                  />
                  {isInDollars && exchangeRate && (
                    <p className="text-[10px] text-muted-foreground">
                      Convertido con tipo de cambio S/.{" "}
                      {exchangeRate.toFixed(4)} (S/.{" "}
                      {apSalePriceSoles.toFixed(2)})
                    </p>
                  )}
                  {apIsPriceBelowMin && (
                    <p className="text-xs font-medium text-destructive">
                      El precio no puede ser menor a {apMinSalePrice}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                <FormInput
                  name="ap_quantity"
                  label="Cantidad"
                  type="number"
                  placeholder="1"
                  step="0.01"
                  min={0.01}
                  control={apForm.control}
                />

                <div className="space-y-1">
                  <FormInput
                    name="ap_discount"
                    label={`Descuento (% máx: ${maxDiscountPercentage})`}
                    type="number"
                    placeholder="0.0"
                    step="0.01"
                    min={0}
                    max={maxDiscountPercentage}
                    control={apForm.control}
                    disabled={isApCampaignDiscountLocked}
                    className={
                      isApCampaignDiscountLocked
                        ? "border-orange-400 bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200"
                        : undefined
                    }
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      apForm.setValue(
                        "ap_discount",
                        Math.min(val, maxDiscountPercentage),
                      );
                    }}
                  />
                  {isApCampaignDiscountLocked && (
                    <p className="text-[10px] font-medium text-orange-600">
                      Descuento por campaña aplicado
                    </p>
                  )}
                </div>
              </div>

              <FormSelect
                control={apForm.control}
                name="ap_supply_type"
                options={onSelectSupplyType}
                label="Tipo de Abastecimiento"
                placeholder="Seleccionar un tipo"
              />

              <div className="flex items-center justify-between bg-muted/50 border rounded-md px-3 py-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Total
                </span>
                <span className="text-base font-semibold">
                  {currencySymbol} {apTotalPreview.toFixed(2)}
                </span>
              </div>
            </div>
          </Form>
        ) : (
          <Form {...form}>
            <div className="space-y-4">
              {/* Mensaje de tipo de cambio y comisión */}
              <div className="bg-blue-50 border border-blue-200 rounded-md px-3 py-2 space-y-1">
                <p className="text-xs text-primary">
                  <span className="font-semibold">Moneda de cotización:</span>{" "}
                  {currencySymbol}
                </p>
                <p className="text-xs text-primary">
                  <span className="font-semibold">Comisión de flete:</span>{" "}
                  {Number(comisionFlete) || freightCommissionMultiplier}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isEdit ? (
                  <div className="flex flex-col justify-center gap-0.5">
                    <span className="text-xs text-muted-foreground">
                      Repuesto
                    </span>
                    <span className="text-sm font-semibold">
                      {form.watch("description")}
                    </span>
                  </div>
                ) : (
                  <FormSelectAsync
                    name="product_id"
                    label="Repuesto"
                    placeholder="Seleccione un repuesto"
                    control={form.control}
                    useQueryHook={useProduct}
                    mapOptionFn={(product) => ({
                      label: () => (
                        <div className="flex items-center justify-between gap-2 w-full">
                          <span className="font-medium truncate">
                            {product.code} - {product.name}
                          </span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded shrink-0 bg-orange-100 text-orange-700">
                            {product.brand.name || "Sin marca"}
                          </span>
                        </div>
                      ),
                      value: product.id.toString(),
                    })}
                    perPage={10}
                    debounceMs={500}
                  />
                )}

                {isEdit ? (
                  <div className="flex flex-col justify-center gap-0.5">
                    <span className="text-xs text-muted-foreground">
                      Precio Lista ($)
                    </span>
                    <span className="text-sm font-semibold">
                      {externalPriceText || "0"}
                    </span>
                  </div>
                ) : (
                  <FormInput
                    control={form.control}
                    name="retail_price_external"
                    label="Precio Lista ($)"
                    placeholder="Ej: 1.5"
                    inputMode="decimal"
                    type="text"
                    value={externalPriceText}
                    onPaste={handlePaste}
                    onChange={handleNumericChange}
                  />
                )}
              </div>

              {stockData &&
                selectedProductId &&
                (() => {
                  const currentStock = stockData.data?.find(
                    (s) => s.product_id === Number(selectedProductId),
                  );
                  if (!currentStock) return null;
                  return (
                    <StockWarehousesCard
                      stock={currentStock}
                      productInfo={productData}
                    />
                  );
                })()}

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                <FormInput
                  control={form.control}
                  name="quantity"
                  label="Cantidad"
                  placeholder="Ej: 1"
                  inputMode="numeric"
                  type="number"
                />

                {isEdit ? (
                  <FormInput
                    control={form.control}
                    name="unit_price"
                    label={`Precio Unit. (${currencySymbol})`}
                    placeholder="Ej: 10.00"
                    inputMode="numeric"
                    type="number"
                    step="0.01"
                  />
                ) : (
                  <div className="flex flex-col justify-center gap-0.5 pt-1">
                    <span className="text-xs text-muted-foreground">
                      Precio Unit. (Calculado)
                    </span>
                    <span className="text-base font-semibold">
                      {currencySymbol}{" "}
                      {(Number(dealerUnitPrice) || 0).toFixed(2)}
                    </span>
                  </div>
                )}

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
                    disabled={isCampaignDiscountLocked}
                    className={
                      isCampaignDiscountLocked
                        ? "border-orange-400 bg-orange-50"
                        : undefined
                    }
                    onChange={(e) => {
                      const val = e.target.value ? Number(e.target.value) : 0;
                      if (val > maxDiscountAllowed) {
                        form.setValue(
                          "discount_percentage",
                          maxDiscountAllowed,
                        );
                      } else {
                        form.setValue("discount_percentage", val);
                      }
                    }}
                  />
                  {isCampaignDiscountLocked ? (
                    <p className="text-[10px] font-medium text-orange-600">
                      Descuento por campaña aplicado
                    </p>
                  ) : (
                    <p className="text-[10px] font-medium text-green-600">
                      Máx. permitido: {maxDiscountAllowed.toFixed(2)}%
                    </p>
                  )}
                </div>

                <FormSelect
                  control={form.control}
                  name="supply_type"
                  options={onSelectSupplyType}
                  label="Tipo de Abastecimiento"
                  placeholder="Seleccionar un tipo"
                  required
                />
              </div>

              {isEdit ? (
                <div className="flex flex-col justify-center gap-0.5">
                  <span className="text-xs text-muted-foreground">
                    Observaciones
                  </span>
                  <span className="text-sm font-semibold">
                    {form.watch("observations") || "-"}
                  </span>
                </div>
              ) : (
                <FormInput
                  control={form.control}
                  name="observations"
                  label="Observaciones"
                  placeholder="Ej: Observaciones adicionales"
                />
              )}

              <div className="flex items-center justify-between bg-muted/50 border rounded-md px-3 py-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Total
                </span>
                <span className="text-base font-semibold">
                  {currencySymbol} {dealerTotalPreview.toFixed(2)}
                </span>
              </div>
            </div>
          </Form>
        )}
      </div>
    </GeneralSheet>
  );
}
